from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ytmusicapi import YTMusic
import uuid
import syncedlyrics
import mysql.connector
import bcrypt
import json
import re
import yt_dlp
import os
import shutil

app = FastAPI(title="YT Music Library API")

# Ensure uploads directory exists and mount it
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

yt = YTMusic()

def format_track(track):
    video_id = track.get("videoId")
    playlist_id = track.get("playlistId")
    browse_id = track.get("browseId")
    
    # We will use youtube_id for whatever primary ID it has
    primary_id = video_id or playlist_id or browse_id
    if not primary_id:
        return None
        
    item_type = "song"
    if playlist_id:
        item_type = "playlist"
    elif browse_id and not video_id:
        item_type = "album"
    
    cover_url = ""
    if "thumbnails" in track and len(track["thumbnails"]) > 0:
        cover_url = track["thumbnails"][-1].get("url", "")
        cover_url = re.sub(r'=w\d+-h\d+', '=w1080-h1080', cover_url)
        cover_url = cover_url.replace('sddefault.jpg', 'maxresdefault.jpg').replace('hqdefault.jpg', 'maxresdefault.jpg')
        
    return {
        "id": str(uuid.uuid4()),
        "youtube_id": primary_id,
        "type": item_type,
        "title": track.get("title", "Unknown Title"),
        "artist": ", ".join(a["name"] for a in track.get("artists", [])) if "artists" in track else "Unknown Artist",
        "album": track.get("album", {}).get("name", "Single") if track.get("album") else "Single",
        "duration": track.get("duration", "0:00"),
        "cover_url": cover_url
    }

@app.get("/home")
def get_home(limit: int = 15):
    try:
        categories = []
        
        # Add custom dynamic categories
        extra_categories = [
            ("Hollywood Popular Songs", "Hollywood popular songs"),
            ("New Songs Release", "New hollywood songs release"),
            ("Trending Most Played", "Trending most played songs of this month")
        ]
        
        for cat_title, query in extra_categories:
            try:
                results = yt.search(query, filter="songs", limit=limit)
                tracks = []
                for item in results:
                    t = format_track(item)
                    if t:
                        tracks.append(t)
                if tracks:
                    categories.append({
                        "title": cat_title,
                        "tracks": tracks
                    })
            except Exception as e:
                print(f"Error fetching {cat_title}:", e)
                pass
                
        return categories
    except Exception as e:
        print("Home Feed Error:", e)
        return []

@app.get("/search")
def search(q: str, filter: str = "songs"):
    try:
        results = yt.search(q, filter=filter)
        tracks = []
        for item in results:
            t = format_track(item)
            if t:
                tracks.append(t)
        return tracks
    except Exception as e:
        print("Search Error:", e)
        return []

@app.get("/lyrics/{video_id}")
def get_lyrics(video_id: str):
    try:
        try:
            song = yt.get_song(video_id)
            if song and "videoDetails" in song:
                title = song["videoDetails"].get("title", "")
                author = song["videoDetails"].get("author", "")
                search_term = f"{title} {author}"
                lrc = syncedlyrics.search(search_term)
                if lrc:
                    return {"lyrics": lrc}
        except Exception as e:
            pass

        wp = yt.get_watch_playlist(video_id)
        if wp and wp.get("lyrics"):
            lyrics_data = yt.get_lyrics(wp["lyrics"])
            if "lyrics" in lyrics_data:
                text = lyrics_data["lyrics"]
                lrc = "[00:00.00] " + text.replace("\n", "\n[00:00.00] ")
                return {"lyrics": lrc}
            elif "text" in lyrics_data:
                text = lyrics_data["text"]
                lrc = "[00:00.00] " + text.replace("\n", "\n[00:00.00] ")
                return {"lyrics": lrc}
        return {"lyrics": "[00:00.00] Lyrics not available"}
    except Exception as e:
        return {"lyrics": "[00:00.00] Lyrics not available"}

# ---------- TRENDING / CHARTS ----------
@app.get("/trending")
def trending(country: str = "ZZ"):
    try:
        return yt.get_charts(country=country)
    except Exception as e:
        return {"error": str(e)}

# ---------- GENRES & MOODS ----------
@app.get("/genres")
def genres():
    try:
        return yt.get_mood_categories()
    except Exception as e:
        return {"error": str(e)}

# ---------- PLAYLISTS BY GENRE/MOOD ----------
@app.get("/genre-playlists")
def genre_playlists(params: str):
    try:
        return yt.get_mood_playlists(params)
    except Exception as e:
        return {"error": str(e)}

# ---------- SONG DETAILS ----------
@app.get("/song/{video_id}")
def song(video_id: str):
    try:
        return yt.get_song(video_id)
    except Exception as e:
        return {"error": str(e)}

# ---------- ALBUM ----------
@app.get("/album/{browse_id}")
def album(browse_id: str):
    try:
        return yt.get_album(browse_id)
    except Exception as e:
        return {"error": str(e)}

# ---------- ARTIST ----------
@app.get("/artist/{channel_id}")
def artist(channel_id: str):
    try:
        return yt.get_artist(channel_id)
    except Exception as e:
        return {"error": str(e)}

# ---------- PLAYLIST ----------
@app.get("/playlist/{playlist_id}")
def playlist(playlist_id: str, limit: int = 100):
    try:
        return yt.get_playlist(playlist_id, limit=limit)
    except Exception as e:
        return {"error": str(e)}

# ---------- WATCH / UP-NEXT QUEUE ----------
@app.get("/watch/{video_id}")
def watch(video_id: str):
    try:
        return yt.get_watch_playlist(video_id)
    except Exception as e:
        return {"error": str(e)}

# ---------- SEARCH SUGGESTIONS ----------
@app.get("/suggestions")
def suggestions(q: str):
    try:
        return yt.get_search_suggestions(q)
    except Exception as e:
        return {"error": str(e)}

# ---------- STREAMING (yt-dlp) ----------
@app.get("/stream/{video_id}")
def stream(video_id: str):
    try:
        url = f"https://music.youtube.com/watch?v={video_id}"
        with yt_dlp.YoutubeDL({'format':'bestaudio','quiet':True}) as ydl:
            info = ydl.extract_info(url, download=False)
            return {"url": info['url']}
    except Exception as e:
        return {"error": str(e)}

# ---------- DATABASE / AUTHENTICATION ----------

def get_db():
    try:
        return mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='tremble_db'
        )
    except Exception as e:
        print("Database connection failed:", e)
        return None

class AuthRequest(BaseModel):
    username: str
    password: str
    email: str = None

class ProfileUpdateRequest(BaseModel):
    user_id: int
    username: str
    email: str

class LikedSongRequest(BaseModel):
    user_id: int
    track_data: dict

@app.post("/api/auth/register")
def register(req: AuthRequest):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection error")
    cursor = db.cursor(dictionary=True)
    try:
        # Check if user exists by username or email
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (req.username, req.email))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username or email already exists")
            
        # Hash password with bcrypt
        hashed = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt())
        
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (req.username, req.email, hashed.decode('utf-8'))
        )
        db.commit()
        user_id = cursor.lastrowid
        return {"message": "User created", "user": {"id": user_id, "username": req.username, "email": req.email}, "token": "dummy_token"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        db.close()

@app.post("/api/auth/login")
def login(req: AuthRequest):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection error")
    cursor = db.cursor(dictionary=True)
    try:
        # Search by username or email. Frontend sends email in either `username` or `email` field.
        identifier = req.email if req.email else req.username
        if not identifier:
            raise HTTPException(status_code=400, detail="Username or email required")
            
        cursor.execute("SELECT id, username, email, password FROM users WHERE username = %s OR email = %s", (identifier, identifier))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid username/email or password")
            
        # Check bcrypt hash (or fallback to plaintext for old dummy accounts)
        db_password = user["password"]
        password_matched = False
        
        if db_password.startswith("$2") or db_password.startswith("$2b$") or db_password.startswith("$2a$"):
            if bcrypt.checkpw(req.password.encode('utf-8'), db_password.encode('utf-8')):
                password_matched = True
        else:
            if req.password == db_password:
                password_matched = True
                
        if not password_matched:
            raise HTTPException(status_code=401, detail="Invalid username/email or password")
            
        # Don't send password hash back
        user.pop("password", None)
            
        return {"message": "Login successful", "user": user, "token": "dummy_token"}
    finally:
        cursor.close()
        db.close()

@app.put("/api/auth/profile")
def update_profile(req: ProfileUpdateRequest):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection error")
    cursor = db.cursor(dictionary=True)
    try:
        # Check if new username or email belongs to someone else
        cursor.execute("SELECT id FROM users WHERE (username = %s OR email = %s) AND id != %s", (req.username, req.email, req.user_id))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username or email already in use")
            
        cursor.execute("UPDATE users SET username = %s, email = %s WHERE id = %s", (req.username, req.email, req.user_id))
        db.commit()
        
        # Return updated user
        cursor.execute("SELECT id, username, email, profile_picture_url FROM users WHERE id = %s", (req.user_id,))
        updated_user = cursor.fetchone()
        return {"message": "Profile updated", "user": updated_user}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        db.close()

@app.post("/api/auth/profile/picture")
def upload_profile_picture(user_id: int = Form(...), file: UploadFile = File(...)):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection error")
        
    try:
        # Generate unique filename
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join("uploads", filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_url = f"http://localhost:8000/uploads/{filename}"
        
        cursor = db.cursor(dictionary=True)
        cursor.execute("UPDATE users SET profile_picture_url = %s WHERE id = %s", (file_url, user_id))
        db.commit()
        
        cursor.execute("SELECT id, username, email, profile_picture_url FROM users WHERE id = %s", (user_id,))
        updated_user = cursor.fetchone()
        
        return {"message": "Profile picture updated", "user": updated_user}
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        db.close()

@app.get("/api/liked-songs/{user_id}")
def get_liked_songs(user_id: int):
    db = get_db()
    if not db:
        return []
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT track_data FROM liked_songs WHERE user_id = %s", (user_id,))
        rows = cursor.fetchall()
        songs = [json.loads(row['track_data']) for row in rows]
        return songs
    except Exception as e:
        print("Error fetching liked songs:", e)
        return []
    finally:
        cursor.close()
        db.close()

@app.post("/api/liked-songs")
def add_liked_song(req: LikedSongRequest):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection error")
    cursor = db.cursor()
    try:
        track_id = req.track_data.get("id") or req.track_data.get("youtube_id")
        if not track_id:
            raise HTTPException(status_code=400, detail="Invalid track data")
            
        cursor.execute(
            "INSERT IGNORE INTO liked_songs (user_id, track_id, track_data) VALUES (%s, %s, %s)",
            (req.user_id, track_id, json.dumps(req.track_data))
        )
        db.commit()
        return {"message": "Song added"}
    finally:
        cursor.close()
        db.close()

@app.delete("/api/liked-songs/{user_id}/{track_id}")
def remove_liked_song(user_id: int, track_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection error")
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM liked_songs WHERE user_id = %s AND track_id = %s", (user_id, track_id))
        db.commit()
        return {"message": "Song removed"}
    finally:
        cursor.close()
        db.close()
