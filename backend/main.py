from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ytmusicapi import YTMusic
import uuid
import syncedlyrics
import bcrypt
import json
import re
import yt_dlp
import os
import shutil
import urllib.request
import requests
import difflib
from db import get_db, init_tables

app = FastAPI(title="YT Music Library API")

@app.on_event("startup")
def on_startup():
    init_tables()

# Ensure uploads directory exists and mount it
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "TREMBLE API is live and operational"}

@app.get("/health")
def health():
    return {"status": "ok"}

yt = YTMusic()
import time
import random
cache_store = {}

DEFAULT_TRACKS = [
    {"youtube_id": "4NRXx6caWDU", "title": "Blinding Lights", "artist": "The Weeknd"},
    {"youtube_id": "34Na4j8AVgA", "title": "Starboy", "artist": "The Weeknd"},
    {"youtube_id": "H5v3kku4y6Q", "title": "As It Was", "artist": "Harry Styles"},
    {"youtube_id": "kTJ3a0SRRLw", "title": "STAY", "artist": "The Kid LAROI, Justin Bieber"},
    {"youtube_id": "ApXoWvfEYVU", "title": "Sunflower (Spider-Man: Into the Spider-Verse)", "artist": "Post Malone, Swae Lee"},
    {"youtube_id": "XXYlFuWEuKI", "title": "Save Your Tears", "artist": "The Weeknd"}
]

def parse_views(views_val) -> int:
    if not views_val:
        return 0
    if isinstance(views_val, (int, float)):
        return int(views_val)
    s = str(views_val).strip().upper()
    match = re.search(r'([\d\.]+)\s*([KMBkmb])?', s)
    if not match:
        return 0
    num_str, unit = match.groups()
    try:
        num = float(num_str)
        if unit == 'B':
            return int(num * 1_000_000_000)
        elif unit == 'M':
            return int(num * 1_000_000)
        elif unit == 'K':
            return int(num * 1_000)
        return int(num)
    except Exception:
        return 0

def format_track(track):
    video_id = track.get("videoId")
    playlist_id = track.get("playlistId")
    browse_id = track.get("browseId")
    
    # We will use youtube_id for whatever primary ID it has
    primary_id = video_id or playlist_id or browse_id
    if not primary_id:
        return None
        
    result_type = track.get("resultType")
    item_type = "song"
    if result_type == "artist" or "subscribers" in track:
        item_type = "artist"
    elif playlist_id or result_type == "playlist":
        item_type = "playlist"
    elif browse_id and not video_id:
        item_type = "album"
    
    cover_url = ""
    thumb_url = ""
    thumbnails = track.get("thumbnails") or track.get("thumbnail")
    if thumbnails and len(thumbnails) > 0:
        url = thumbnails[-1].get("url", "")
        thumb_url = thumbnails[0].get("url", "")
        # Filter out default placeholder avatars
        if url and "artist_avatar" not in url and "default_avatar" not in url:
            cover_url = url
            # Enforce HD resolution parameters for Google User Content and YouTube
            if "googleusercontent.com" in cover_url or "ggpht.com" in cover_url or "gstatic.com" in cover_url:
                cover_url = re.sub(r'=w\d+-h\d+', '=w1080-h1080', cover_url)
                cover_url = re.sub(r'=s\d+', '=s1080', cover_url)
            elif "img.youtube.com" in cover_url and "hqdefault.jpg" in cover_url:
                cover_url = cover_url.replace("hqdefault.jpg", "maxresdefault.jpg")

    # If cover_url is still empty and we have a valid YouTube video ID, use YouTube CDN
    if not cover_url and video_id:
        cover_url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        if not thumb_url:
            thumb_url = f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg"
        
    track_title = track.get("title") or track.get("artist") or track.get("name") or "Unknown Title"
    artist_name = "Trembler" if item_type == "artist" else (", ".join(a["name"] for a in track.get("artists", [])) if "artists" in track else track.get("artist", "Unknown Artist"))
    artist_id = track.get("artists", [{}])[0].get("id") if track.get("artists") and len(track.get("artists")) > 0 else (browse_id if item_type == "artist" else None)
    raw_views = track.get("views") or ""

    return {
        "id": str(uuid.uuid4()),
        "youtube_id": primary_id,
        "type": item_type,
        "title": track_title,
        "artist": artist_name,
        "artist_id": artist_id,
        "album": track.get("album", {}).get("name", "Single") if track.get("album") else "Single",
        "album_id": track.get("album", {}).get("id") if track.get("album") else None,
        "duration": track.get("duration", "0:00"),
        "cover_url": cover_url,
        "thumb_url": thumb_url or cover_url,
        "views": raw_views,
        "views_count": parse_views(raw_views),
        "year": track.get("year"),
        "isExplicit": track.get("isExplicit", False)
    }





class HistoryRequest(BaseModel):
    user_id: int
    track_data: dict

class PlaylistRequest(BaseModel):
    user_id: int
    title: str
    tracks: list
    id: int = None

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

def get_cached(key, ttl, fetch_func):
    now = time.time()
    if key in cache_store and now - cache_store[key]['time'] < ttl:
        data = cache_store[key]['data']
        if isinstance(data, list):
            res = list(data)
            random.shuffle(res)
            return res
        return data
    try:
        data = fetch_func()
        cache_store[key] = {'time': now, 'data': data}
        if isinstance(data, list):
            res_data = list(data)
            random.shuffle(res_data)
            return res_data
        return data
    except Exception as e:
        print(f"Error fetching {key}:", e)
        return []

@app.get("/home")
def get_home(limit: int = 15, user_id: int = None):
    try:
        categories = []
        db = get_db()
        history = []
        if user_id and db:
            cursor = db.cursor(dictionary=True)
            cursor.execute("SELECT track_data, MAX(listened_at) as last_played FROM listening_history WHERE user_id = %s GROUP BY track_data ORDER BY last_played DESC LIMIT 15", (user_id,))
            rows = cursor.fetchall()
            history = [json.loads(r["track_data"]) for r in rows]
            cursor.close()
            db.close()

        # 1. Recently Played (Personalized)
        if user_id and history:
            categories.append({"title": "Recently Played", "tracks": history})

        return categories
    except Exception as e:
        print("Home Feed Error:", e)
        return []

def clean_search_string(s: str) -> str:
    s = s.lower().strip()
    if s.startswith("the "):
        s = s[4:].strip()
    return re.sub(r'[^\w\s]', '', s).strip()

def evaluate_search(q: str, raw_songs: list, raw_artists: list, raw_albums: list):
    clean_q = clean_search_string(q)
    
    # 1. Format and sort songs strictly by popularity (views_count descending)
    formatted_songs = []
    for item in raw_songs:
        t = format_track(item)
        if t and t.get("type") == "song":
            formatted_songs.append(t)
    
    formatted_songs.sort(key=lambda x: x.get("views_count", 0), reverse=True)

    # Calculate artist consensus among top songs
    artist_matches_in_songs = 0
    for s in formatted_songs[:10]:
        s_artist = clean_search_string(s.get("artist") or "")
        if clean_q and s_artist and (clean_q == s_artist or clean_q in s_artist or s_artist in clean_q):
            artist_matches_in_songs += 1
    
    # 2. Check Trembler (Artist) Candidates
    best_artist = None
    best_artist_score = 0
    all_artists = []
    
    for idx, a in enumerate(raw_artists):
        a_name = a.get("artist") or a.get("title") or a.get("name") or ""
        a_id = a.get("browseId") or a.get("id")
        if not a_name:
            continue
        clean_name = clean_search_string(a_name)
        subs = a.get("subscribers") or ""
        sub_count = 0
        if "M" in subs:
            try: sub_count = float(re.findall(r'[\d.]+', subs)[0]) * 1_000_000
            except: pass
        elif "K" in subs:
            try: sub_count = float(re.findall(r'[\d.]+', subs)[0]) * 1_000
            except: pass
            
        ratio = difflib.SequenceMatcher(None, clean_q, clean_name).ratio()
        is_exact = (clean_q == clean_name)
        is_prefix = (clean_name.startswith(clean_q) or clean_q.startswith(clean_name)) and len(clean_q) >= 3
        
        score = ratio * 100.0 - (idx * 3.0)
        if is_exact:
            score = 220.0 - (idx * 2.0)
        elif is_prefix:
            score = 150.0 - (idx * 2.0)
        elif ratio >= 0.82:
            score = 120.0 - (idx * 2.0)
            
        if sub_count > 500000:
            score += 30.0
        elif sub_count > 50000:
            score += 20.0
        elif sub_count > 5000:
            score += 10.0

        if artist_matches_in_songs >= 2:
            score += 100.0
        elif artist_matches_in_songs == 1:
            score += 40.0

        thumbs = a.get("thumbnails", [])
        cover = thumbs[-1].get("url", "") if thumbs else ""
        if cover:
            cover = re.sub(r'=w\d+-h\d+', '=w500-h500', cover)
            cover = re.sub(r'=s\d+', '=s500', cover)
            
        art_dict = {
            "id": a_id,
            "name": a_name,
            "cover_url": cover,
            "subscribers": subs or "Trembler",
            "sub_count": sub_count,
            "type": "artist",
            "score": score
        }
        all_artists.append(art_dict)
        
        if score > best_artist_score:
            best_artist_score = score
            best_artist = art_dict
            
    # 3. Check Album Candidates
    best_album = None
    best_album_score = 0
    all_albums = []
    
    for idx, alb in enumerate(raw_albums):
        alb_title = alb.get("title") or alb.get("name") or ""
        alb_id = alb.get("browseId") or alb.get("id") or alb.get("playlistId")
        if not alb_title:
            continue
        clean_title = clean_search_string(alb_title)
        
        ratio = difflib.SequenceMatcher(None, clean_q, clean_title).ratio()
        is_exact = (clean_q == clean_title)
        is_prefix = (clean_title.startswith(clean_q) or clean_q.startswith(clean_title)) and len(clean_q) >= 3
        
        score = ratio * 100.0 - (idx * 3.0)
        if is_exact:
            score = 220.0 - (idx * 2.0)
        elif is_prefix:
            score = 150.0 - (idx * 2.0)
        elif ratio >= 0.82:
            score = 120.0 - (idx * 2.0)
            
        thumbs = alb.get("thumbnails", [])
        cover = thumbs[-1].get("url", "") if thumbs else ""
        if cover:
            cover = re.sub(r'=w\d+-h\d+', '=w600-h600', cover)
            cover = re.sub(r'=s\d+', '=s600', cover)
            
        alb_artist = alb.get("artists", [{}])[0].get("name", "") if alb.get("artists") else (alb.get("artist") or "")
        year = alb.get("year") or ""
        
        alb_dict = {
            "id": alb_id,
            "title": alb_title,
            "artist": alb_artist,
            "year": year,
            "cover_url": cover,
            "type": "album",
            "score": score
        }
        all_albums.append(alb_dict)
        
        if score > best_album_score:
            best_album_score = score
            best_album = alb_dict

    # 4. Check Song Match Candidates
    best_song = None
    best_song_score = 0
    if formatted_songs:
        for idx, s in enumerate(formatted_songs[:10]):
            s_title = s.get("title", "")
            clean_s_title = clean_search_string(s_title)
            ratio = difflib.SequenceMatcher(None, clean_q, clean_s_title).ratio()
            is_exact = (clean_q == clean_s_title)
            is_prefix = (clean_s_title.startswith(clean_q) or clean_q.startswith(clean_s_title)) and len(clean_q) >= 3
            
            score = ratio * 100.0 - (idx * 2.0)
            if is_exact:
                score = 250.0 - (idx * 2.0)
            elif is_prefix:
                score = 175.0 - (idx * 2.0)
            elif ratio >= 0.82:
                score = 135.0 - (idx * 2.0)
                
            views = s.get("views_count", 0)
            if views > 100_000_000:
                score += 30.0
            elif views > 10_000_000:
                score += 20.0
            elif views > 1_000_000:
                score += 10.0
                
            if score > best_song_score:
                best_song_score = score
                best_song = s

    # 5. Resolve intent hierarchy:
    # First check Trembler match (if prominent artist and query matches artist name)
    # Then check Album match (if album matches query strongly and is not overshadowed by a song)
    # Then check Song match (most popular matching song)
    intent = "song"
    top_result = None
    secondary_featured = None
    
    is_strong_artist = best_artist and (
        best_artist_score >= 170 and (
            artist_matches_in_songs >= 2 or 
            best_artist.get("sub_count", 0) >= 50000 or
            best_artist_score >= (best_song_score + 10)
        )
    )
    
    is_strong_album = best_album and best_album_score >= 140

    if is_strong_artist and (best_artist_score >= best_album_score) and (artist_matches_in_songs >= 2 or best_artist_score >= best_song_score):
        intent = "trembler"
        top_result = best_artist
        secondary_featured = formatted_songs[0] if len(formatted_songs) > 0 else None
    elif is_strong_album and best_album_score >= best_song_score:
        intent = "album"
        top_result = best_album
        secondary_featured = formatted_songs[0] if len(formatted_songs) > 0 else None
    else:
        intent = "song"
        top_result = best_song if best_song else (formatted_songs[0] if len(formatted_songs) > 0 else None)
        if top_result:
            candidates = [s for s in formatted_songs if s.get("youtube_id") != top_result.get("youtube_id")]
            secondary_featured = candidates[0] if candidates else None
        else:
            secondary_featured = None

    return {
        "intent": intent,
        "top_result": top_result,
        "secondary_featured": secondary_featured,
        "trembler": best_artist if intent == "trembler" else (best_artist if best_artist_score >= 100 else None),
        "album": best_album if intent == "album" else (best_album if best_album_score >= 100 else None),
        "songs": formatted_songs,
        "artists": all_artists,
        "albums": all_albums
    }

@app.get("/api/unified-search")
def unified_search(q: str):
    try:
        raw_songs = []
        try:
            raw_songs = yt.search(q, filter="songs", limit=25)
        except Exception as e:
            print("Unified search songs error:", e)

        raw_artists = []
        try:
            raw_artists = yt.search(q, filter="artists", limit=8)
        except Exception as e:
            print("Unified search artists error:", e)

        raw_albums = []
        try:
            raw_albums = yt.search(q, filter="albums", limit=8)
        except Exception as e:
            print("Unified search albums error:", e)

        raw_playlists = []
        try:
            raw_playlists = yt.search(q, filter="playlists", limit=8)
        except Exception as e:
            print("Unified search playlists error:", e)

        eval_result = evaluate_search(q, raw_songs, raw_artists, raw_albums)
        
        playlists = []
        for item in raw_playlists:
            t = format_track(item)
            if t:
                playlists.append(t)

        return {
            "intent": eval_result["intent"],
            "top_result": eval_result["top_result"],
            "secondary_featured": eval_result["secondary_featured"],
            "trembler": eval_result["trembler"],
            "album": eval_result["album"],
            "songs": eval_result["songs"],
            "artists": eval_result["artists"],
            "albums": eval_result["albums"],
            "playlists": playlists
        }
    except Exception as e:
        print("Unified Search Error:", e)
        return {
            "intent": "song",
            "top_result": None,
            "secondary_featured": None,
            "trembler": None,
            "album": None,
            "songs": [],
            "artists": [],
            "albums": [],
            "playlists": []
        }

@app.get("/search")
def search(q: str, filter: str = "all", unified: bool = False):
    try:
        if unified or filter == "all":
            return unified_search(q)

        yt_filter = "songs"
        if filter in ["artists", "tremblers"]:
            yt_filter = "artists"
        elif filter == "albums":
            yt_filter = "albums"
        elif filter in ["playlists", "tremlists"]:
            yt_filter = "playlists"
            
        results = yt.search(q, filter=yt_filter, limit=25)
        tracks = []
        for item in results:
            t = format_track(item)
            if t:
                # Exclude any video results - audio only
                if t.get("type") != "video":
                    tracks.append(t)
                    
        if yt_filter == "songs":
            tracks.sort(key=lambda x: x.get("views_count", 0), reverse=True)
            
        return tracks
    except Exception as e:
        print("Search Error:", e)
        return []

lyrics_cache = {}

def clean_for_lyrics(title: str, artist: str = ""):
    ct = re.sub(r'\(.*?\)|\[.*?\]|official|music|video|audio|lyrics|hd|4k|feat\..*|ft\..*', '', title or '', flags=re.I).strip()
    ca = re.sub(r'vevo|official|music|channel|topic|- topic', '', artist or '', flags=re.I).strip()
    ct = re.sub(r'\s+', ' ', ct).strip(' -_')
    ca = re.sub(r'\s+', ' ', ca).strip(' -_')
    return ct, ca

@app.get("/lyrics/{video_id}")
def get_lyrics(video_id: str, title: str = None, artist: str = None):
    if video_id in lyrics_cache:
        return {"lyrics": lyrics_cache[video_id]}

    try:
        clean_t = ""
        clean_a = ""

        if title or artist:
            clean_t, clean_a = clean_for_lyrics(title, artist)

        if not clean_t:
            try:
                song = yt.get_song(video_id)
                if song and "videoDetails" in song:
                    raw_title = song["videoDetails"].get("title", "")
                    raw_author = song["videoDetails"].get("author", "")
                    clean_t, clean_a = clean_for_lyrics(raw_title, raw_author)
            except Exception:
                pass

        # 1. Search with synced_only=True
        search_terms = []
        if clean_t and clean_a:
            search_terms.append(f"{clean_t} {clean_a}".strip())
        if clean_t:
            search_terms.append(clean_t.strip())

        for term in search_terms:
            try:
                lrc = syncedlyrics.search(term, synced_only=True)
                if lrc and "[" in lrc:
                    lyrics_cache[video_id] = lrc
                    return {"lyrics": lrc}
            except Exception:
                pass

        # 2. Fallback: Search without synced_only constraint
        for term in search_terms:
            try:
                lrc = syncedlyrics.search(term)
                if lrc:
                    lyrics_cache[video_id] = lrc
                    return {"lyrics": lrc}
            except Exception:
                pass

        # 3. Fallback: YouTube Music watch playlist lyrics
        try:
            wp = yt.get_watch_playlist(video_id)
            if wp and wp.get("lyrics"):
                lyrics_data = yt.get_lyrics(wp["lyrics"])
                text = lyrics_data.get("lyrics") or lyrics_data.get("text")
                if text:
                    lrc = "[00:00.00] " + text.replace("\n", "\n[00:00.00] ")
                    lyrics_cache[video_id] = lrc
                    return {"lyrics": lrc}
        except Exception:
            pass

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
    return [
        {"title": "Pop", "params": "pop"},
        {"title": "Hip-Hop", "params": "hiphop"},
        {"title": "Rock", "params": "rock"},
        {"title": "Electronic", "params": "electronic"},
        {"title": "R&B", "params": "rnb"},
        {"title": "Jazz", "params": "jazz"},
        {"title": "Classical", "params": "classical"},
        {"title": "Country", "params": "country"},
        {"title": "Indie", "params": "indie"},
        {"title": "K-Pop", "params": "kpop"},
        {"title": "Latin", "params": "latin"},
        {"title": "Metal", "params": "metal"},
        {"title": "Phonk", "params": "phonk"},
        {"title": "Motivation", "params": "motivation"},
        {"title": "Feel Good", "params": "feel good"},
        {"title": "Fitness", "params": "workout"}
    ]

# ---------- PLAYLISTS BY GENRE/MOOD ----------
@app.get("/genre-playlists")
def genre_playlists(params: str):
    try:
        return yt.get_mood_playlists(params)
    except Exception as e:
        return {"error": str(e)}

# ---------- COUNTRY TOP SONGS ----------
@app.get("/country-top")
def country_top(country: str):
    try:
        search_query = f"Top 100 songs {country}"
        results = yt.search(search_query, filter="songs", limit=10)
        tracks = []
        for item in results:
            t = format_track(item)
            if t:
                tracks.append(t)
        return tracks
    except Exception as e:
        return {"error": str(e)}

# ---------- SONGS BY GENRE ----------
@app.get("/genre-songs")
def genre_songs(title: str):
    try:
        # Advanced sorting using hashtags and specific queries
        safe_tag = title.lower().replace(" ", "").replace("-", "")
        search_query = f"{title} popular songs #{safe_tag}"
        results = yt.search(search_query, filter="songs", limit=50)
        tracks = []
        for item in results:
            t = format_track(item)
            if t:
                tracks.append(t)
        return tracks
    except Exception as e:
        return {"error": str(e)}

# ---------- SONG DETAILS ----------
@app.get("/song/{video_id}")
def song(video_id: str):
    try:
        return yt.get_song(video_id)
    except Exception as e:
        return {"error": str(e)}

ALBUM_RESOLVER_CACHE = {}
PLAYLIST_RESOLVER_CACHE = {}

def get_short_hash(identifier: str) -> str:
    if not identifier:
        return "0000"
    h = 5381
    for c in str(identifier):
        h = ((h << 5) + h) + ord(c)
        h = h & 0xFFFFFFFF
    return f"{abs(h):x}"[-4:].zfill(4)

# ---------- ALBUM ----------
@app.get("/album/{browse_id}")
def album(browse_id: str):
    try:
        target_id = browse_id
        
        # Check cache
        if target_id in ALBUM_RESOLVER_CACHE:
            target_id = ALBUM_RESOLVER_CACHE[target_id]
        elif not (target_id.startswith("MPREb_") or target_id.startswith("OLAK") or target_id.startswith("VL") or target_id.startswith("PL") or target_id.startswith("FEmusic_")):
            # Slug format: e.g. "am-8f92" or "after-hours-7b4c"
            parts = target_id.rsplit('-', 1)
            hash_candidate = parts[1] if len(parts) == 2 else ""
            if hash_candidate and hash_candidate in ALBUM_RESOLVER_CACHE:
                target_id = ALBUM_RESOLVER_CACHE[hash_candidate]
            else:
                # Search album by title
                query = (parts[0] if len(parts) == 2 else target_id).replace('-', ' ').strip()
                try:
                    s_res = yt.search(query, filter="albums", limit=3)
                    if s_res and len(s_res) > 0 and s_res[0].get("browseId"):
                        target_id = s_res[0].get("browseId")
                        if hash_candidate:
                            ALBUM_RESOLVER_CACHE[hash_candidate] = target_id
                        ALBUM_RESOLVER_CACHE[browse_id] = target_id
                except Exception as s_err:
                    print("Error resolving album slug:", s_err)

        # Register hash in cache
        h = get_short_hash(target_id)
        ALBUM_RESOLVER_CACHE[h] = target_id
        ALBUM_RESOLVER_CACHE[target_id] = target_id

        if target_id.startswith("OLAK") or target_id.startswith("VL") or target_id.startswith("PL"):
            return yt.get_playlist(target_id)
        try:
            return yt.get_album(target_id)
        except Exception:
            # Fallback for singles/EPs that might fail get_album
            return yt.get_playlist(target_id)
    except Exception as e:
        return {"error": str(e)}

# ---------- PLAYLIST ----------
@app.get("/playlist/{playlist_id}")
@app.get("/tremlist/{playlist_id}")
def playlist(playlist_id: str, limit: int = 100):
    try:
        target_id = playlist_id
        
        # Check cache
        if target_id in PLAYLIST_RESOLVER_CACHE:
            target_id = PLAYLIST_RESOLVER_CACHE[target_id]
        elif not (target_id.startswith("PL") or target_id.startswith("RDCLAK") or target_id.isdigit() or len(target_id) > 20):
            parts = target_id.rsplit('-', 1)
            hash_candidate = parts[1] if len(parts) == 2 else ""
            if hash_candidate and hash_candidate in PLAYLIST_RESOLVER_CACHE:
                target_id = PLAYLIST_RESOLVER_CACHE[hash_candidate]
            else:
                query = (parts[0] if len(parts) == 2 else target_id).replace('-', ' ').strip()
                try:
                    s_res = yt.search(query, filter="playlists", limit=3)
                    if s_res and len(s_res) > 0 and s_res[0].get("browseId"):
                        target_id = s_res[0].get("browseId")
                        if hash_candidate:
                            PLAYLIST_RESOLVER_CACHE[hash_candidate] = target_id
                        PLAYLIST_RESOLVER_CACHE[playlist_id] = target_id
                except Exception as s_err:
                    print("Error resolving playlist slug:", s_err)

        h = get_short_hash(target_id)
        PLAYLIST_RESOLVER_CACHE[h] = target_id
        PLAYLIST_RESOLVER_CACHE[target_id] = target_id

        db = get_db()
        if db:
            cursor = db.cursor(dictionary=True)
            try:
                cursor.execute("SELECT id, title, tracks FROM user_playlists WHERE id = %s", (target_id,))
                row = cursor.fetchone()
                if row:
                    tracks = json.loads(row["tracks"]) if isinstance(row["tracks"], str) else (row["tracks"] or [])
                    cover_url = tracks[0].get("cover_url") if tracks and len(tracks) > 0 else "/images/tremlist_static.jpeg"
                    return {
                        "id": str(row["id"]),
                        "title": row["title"],
                        "tracks": tracks,
                        "cover_url": cover_url,
                        "is_user_playlist": True
                    }
            except Exception as db_err:
                print("DB lookup note in /playlist:", db_err)
            finally:
                cursor.close()
                db.close()

        return yt.get_playlist(target_id, limit=limit)
    except Exception as e:
        return {"error": str(e)}

# ---------- ARTIST / TREMBLER ----------
@app.get("/artist/{artist_id}")
@app.get("/trembler/{artist_id}")
def artist(artist_id: str):
    def fetch_artist():
        try:
            target_id = artist_id
            clean_name = urllib.parse.unquote(artist_id).replace('+', ' ').strip()
            
            # If not a standard browseId (e.g. "arctic monkeys" or "the weeknd"), resolve browseId by searching
            search_cover = ""
            s_res = None
            if not target_id.startswith("UC") and not target_id.startswith("FEmusic_artist_"):
                try:
                    s_res = yt.search(clean_name, filter="artists", limit=3)
                    if s_res and len(s_res) > 0 and s_res[0].get("browseId"):
                        target_id = s_res[0].get("browseId")
                        if s_res[0].get("thumbnails"):
                            search_cover = s_res[0]["thumbnails"][-1].get("url", "")
                except Exception as s_err:
                    print("Error resolving artist search:", s_err)

            try:
                art = yt.get_artist(target_id)
            except Exception as e:
                try:
                    if not s_res:
                        s_res = yt.search(clean_name, filter="artists", limit=3)
                    if s_res and len(s_res) > 0 and s_res[0].get("browseId"):
                        target_id = s_res[0].get("browseId")
                        if s_res[0].get("thumbnails"):
                            search_cover = s_res[0]["thumbnails"][-1].get("url", "")
                        art = yt.get_artist(target_id)
                    else:
                        raise e
                except Exception:
                    raise e
            desc = art.get('description', '')
            name = art.get('name') or clean_name
            
            cover_url = ""
            if art.get("thumbnails") and len(art["thumbnails"]) > 0:
                cover_url = art["thumbnails"][-1].get("url", "")
            elif search_cover:
                cover_url = search_cover
            else:
                try:
                    fallback_res = yt.search(name, filter="artists", limit=3)
                    if fallback_res and len(fallback_res) > 0 and fallback_res[0].get("thumbnails"):
                        cover_url = fallback_res[0]["thumbnails"][-1].get("url", "")
                except Exception:
                    pass

            if cover_url:
                cover_url = re.sub(r'=w\d+-h\d+', '=w1080-h1080', cover_url)
                cover_url = re.sub(r'=s\d+', '=s1080', cover_url)
                
            songs = []
            songs_pl_id = art.get("songs", {}).get("browseId")
            if songs_pl_id:
                try:
                    pl = yt.get_playlist(songs_pl_id, limit=14)
                    songs = [format_track(t) for t in pl.get("tracks", []) if format_track(t)][:14]
                except Exception as e:
                    print("Error fetching artist playlist", e)
                    
            if not songs and "songs" in art and "results" in art["songs"]:
                songs = [format_track(t) for t in art["songs"]["results"] if format_track(t)][:14]
                
            albums = []
            alb_bid = art.get("albums", {}).get("browseId")
            alb_params = art.get("albums", {}).get("params")
            if alb_bid and alb_params:
                try:
                    alb_results = yt.get_artist_albums(alb_bid, alb_params)
                    for a in alb_results:
                        img = a.get("thumbnails", [{}])[-1].get("url", "") if a.get("thumbnails") else ""
                        albums.append({
                            "id": a.get("browseId", ""),
                            "title": a.get("title", ""),
                            "cover_url": img,
                            "year": a.get("year", ""),
                            "type": a.get("type", "Album")
                        })
                except Exception as e:
                    print("Error fetching albums", e)
            if not albums and "albums" in art and "results" in art["albums"]:
                for a in art["albums"]["results"]:
                    img = a.get("thumbnails", [{}])[-1].get("url", "") if a.get("thumbnails") else ""
                    albums.append({
                        "id": a.get("browseId", ""),
                        "title": a.get("title", ""),
                        "cover_url": img,
                        "year": a.get("year", ""),
                        "type": a.get("type", "Album")
                    })
                    
            similar_artists = []
            if "related" in art and "results" in art["related"]:
                for r in art["related"]["results"]:
                    img = r.get("thumbnails", [{}])[-1].get("url", "") if r.get("thumbnails") else ""
                    similar_artists.append({
                        "id": r.get("browseId", ""),
                        "name": r.get("title", ""),
                        "cover_url": img
                    })

            return {
                "id": target_id,
                "name": name,
                "description": desc,
                "cover_url": cover_url,
                "top_songs": songs,
                "albums": albums,
                "similar_artists": similar_artists
            }
        except Exception as e:
            print("Error in /artist:", e)
            return {"error": str(e)}

    # Cache artist for 1 hour to speed up UI
    cache_key = f"artist_{artist_id.lower().strip()}"
    data = get_cached(cache_key, 3600, fetch_artist)
    return data if data else fetch_artist()

# ---------- WATCH / UP-NEXT QUEUE ----------
@app.get("/watch/{video_id}")
def watch(video_id: str):
    try:
        return yt.get_watch_playlist(video_id)
    except Exception as e:
        return {"error": str(e)}

# ---------- IMAGE PROXY FOR WEBGEL KAWARP ----------
@app.get("/api/image-proxy")
def image_proxy(url: str):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read()
            mime = response.headers.get_content_type() or "image/jpeg"
            return Response(content=content, media_type=mime, headers={"Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=86400"})
    except Exception as e:
        print("Image proxy note:", e)
        return Response(status_code=404)

# ---------- SEARCH SUGGESTIONS ----------
@app.get("/suggestions")
def suggestions(q: str):
    try:
        return yt.get_search_suggestions(q)
    except Exception as e:
        return {"error": str(e)}



# ---------- DATABASE / AUTHENTICATION ----------



class RecommendationRequest(BaseModel):
    seed_track_ids: list = []
    exclude_track_ids: list = []
    limit: int = 20

@app.post("/api/history")
def add_history(req: HistoryRequest):
    db = get_db()
    if not db:
        return {"error": "Database error"}
    cursor = db.cursor(buffered=True)
    try:
        # Ensure play_count column exists
        try:
            cursor.execute("ALTER TABLE listening_history ADD COLUMN play_count INT DEFAULT 1")
            db.commit()
        except Exception:
            pass

        track_id = req.track_data.get("id") or req.track_data.get("youtube_id")
        cursor.execute("SELECT id, play_count FROM listening_history WHERE user_id = %s AND track_id = %s", (req.user_id, track_id))
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                "UPDATE listening_history SET listened_at = CURRENT_TIMESTAMP, track_data = %s, play_count = play_count + 1 WHERE user_id = %s AND track_id = %s",
                (json.dumps(req.track_data), req.user_id, track_id)
            )
        else:
            cursor.execute(
                "INSERT INTO listening_history (user_id, track_id, track_data, play_count) VALUES (%s, %s, %s, 1)",
                (req.user_id, track_id, json.dumps(req.track_data))
            )
        db.commit()
        return {"message": "History added"}
    finally:
        cursor.close()
        db.close()

@app.get("/api/history/{user_id}")
def get_history(user_id: int):
    db = get_db()
    if not db: return []
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT track_data, play_count FROM listening_history WHERE user_id = %s ORDER BY listened_at DESC LIMIT 50", (user_id,))
        rows = cursor.fetchall()
        result = []
        for r in rows:
            td = json.loads(r["track_data"]) if isinstance(r["track_data"], str) else r["track_data"]
            td["play_count"] = r.get("play_count") or 1
            result.append(td)
        return result
    finally:
        cursor.close()
        db.close()

@app.get("/api/user-stats/{user_id}")
def get_user_stats(user_id: int):
    db = get_db()
    if not db:
        return {"most_listened_songs": [], "most_listened_tremblers": [], "most_listened_albums": [], "total_plays": 0}
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT track_data, play_count, listened_at FROM listening_history WHERE user_id = %s ORDER BY play_count DESC, listened_at DESC", (user_id,))
        rows = cursor.fetchall()
        
        songs = []
        artist_map = {}
        album_map = {}
        total_plays = 0
        
        for r in rows:
            t = json.loads(r["track_data"]) if isinstance(r["track_data"], str) else r["track_data"]
            cnt = r.get("play_count") or 1
            total_plays += cnt
            t["play_count"] = cnt
            songs.append(t)
            
            # Aggregate artists
            art_name = t.get("artist_name") or t.get("artist") or "Unknown Artist"
            if art_name and art_name != "Unknown Artist":
                if art_name not in artist_map:
                    artist_map[art_name] = {
                        "id": t.get("artist_id") or t.get("youtube_id"),
                        "youtube_id": t.get("artist_id") or t.get("youtube_id"),
                        "title": art_name,
                        "name": art_name,
                        "type": "artist",
                        "cover_url": t.get("cover_url", ""),
                        "count": 0
                    }
                artist_map[art_name]["count"] += cnt
                
            # Aggregate albums
            alb_name = t.get("album")
            alb_id = t.get("album_id")
            if alb_name and alb_name != "Single":
                alb_key = alb_id or alb_name
                if alb_key not in album_map:
                    album_map[alb_key] = {
                        "id": alb_id or alb_key,
                        "youtube_id": alb_id or alb_key,
                        "title": alb_name,
                        "artist": art_name,
                        "type": "album",
                        "cover_url": t.get("cover_url", ""),
                        "count": 0
                    }
                album_map[alb_key]["count"] += cnt
                
        sorted_artists = sorted(artist_map.values(), key=lambda x: x["count"], reverse=True)
        sorted_albums = sorted(album_map.values(), key=lambda x: x["count"], reverse=True)
        
        return {
            "most_listened_songs": songs,
            "most_listened_tremblers": sorted_artists,
            "most_listened_albums": sorted_albums,
            "total_plays": total_plays
        }
    except Exception as e:
        print("Error fetching user stats:", e)
        return {"most_listened_songs": [], "most_listened_tremblers": [], "most_listened_albums": [], "total_plays": 0}
    finally:
        cursor.close()
        db.close()

@app.get("/api/artist-avatar")
def get_artist_avatar(name: str):
    def fetch_avatar():
        try:
            res = yt.search(name, filter="artists", limit=3)
            if res and len(res) > 0:
                art = res[0]
                art_id = art.get("browseId")
                cover = art.get("thumbnails", [{}])[-1].get("url", "")
                cover = re.sub(r'=w\d+-h\d+', '=w500-h500', cover)
                return {"id": art_id, "name": art.get("artist", name), "cover_url": cover}
        except Exception:
            pass
        return {"id": None, "name": name, "cover_url": ""}
    return get_cached(f"art_avatar_{name.lower().strip()}", 86400, fetch_avatar)

@app.get("/api/resolve-album")
def resolve_album(title: str, artist: str = ""):
    def fetch_alb():
        try:
            query = f"{title} {artist}".strip()
            res = yt.search(query, filter="albums", limit=3)
            if res and len(res) > 0:
                alb = res[0]
                alb_id = alb.get("browseId")
                cover = alb.get("thumbnails", [{}])[-1].get("url", "")
                cover = re.sub(r'=w\d+-h\d+', '=w600-h600', cover)
                return {
                    "id": alb_id,
                    "title": alb.get("title", title),
                    "artist": alb.get("artists", [{}])[0].get("name", artist) if alb.get("artists") else artist,
                    "cover_url": cover,
                    "year": alb.get("year", "")
                }
        except Exception:
            pass
        return {"id": None, "title": title, "artist": artist, "cover_url": ""}
    return get_cached(f"resolve_alb_{title.lower().strip()}_{artist.lower().strip()}", 86400, fetch_alb)

@app.post("/api/recommendations/we-think-youd-like")
def get_we_think_youd_like(req: RecommendationRequest):
    def generate_recommendations():
        try:
            exclude_set = set(req.exclude_track_ids)
            seed_ids = req.seed_track_ids[:4]
            collected = []
            seen_collected = set()

            def fetch_seed_tracks(sid):
                try:
                    wp = yt.get_watch_playlist(videoId=sid, limit=10)
                    return wp.get("tracks", [])
                except Exception:
                    return []

            from concurrent.futures import ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=4) as executor:
                results = list(executor.map(fetch_seed_tracks, seed_ids))

            for raw_list in results:
                for raw in raw_list:
                    t = format_track(raw)
                    if not t: continue
                    tid = t.get("youtube_id") or t.get("id")
                    if tid and tid not in exclude_set and tid not in seen_collected:
                        seen_collected.add(tid)
                        collected.append(t)

            import random
            random.shuffle(collected)
            return {"tracks": collected[:req.limit]}
        except Exception as e:
            print("Error generating we think you'd like:", e)
            return {"tracks": []}

    seed_key = "-".join(sorted(req.seed_track_ids[:4]))
    if seed_key:
        cached = get_cached(f"we_think_{seed_key}", 1800, generate_recommendations)
        return cached if cached else generate_recommendations()
    return generate_recommendations()

@app.post("/api/playlists")
def create_playlist(req: PlaylistRequest):
    db = get_db()
    if not db: return {"error": "DB"}
    cursor = db.cursor()
    try:
        if req.id:
            cursor.execute("UPDATE user_playlists SET title = %s, tracks = %s WHERE id = %s AND user_id = %s", (req.title, json.dumps(req.tracks), req.id, req.user_id))
            db.commit()
            return {"id": req.id}
        else:
            # Check if a playlist with the same title already exists for this user
            cursor.execute("SELECT id FROM user_playlists WHERE user_id = %s AND LOWER(title) = LOWER(%s)", (req.user_id, req.title))
            existing = cursor.fetchone()
            if existing:
                existing_id = existing[0] if isinstance(existing, tuple) else existing['id']
                cursor.execute("UPDATE user_playlists SET tracks = %s, title = %s WHERE id = %s", (json.dumps(req.tracks), req.title, existing_id))
                db.commit()
                return {"id": existing_id}
            else:
                cursor.execute("INSERT INTO user_playlists (user_id, title, tracks) VALUES (%s, %s, %s)", (req.user_id, req.title, json.dumps(req.tracks)))
                db.commit()
                return {"id": cursor.lastrowid}
    finally:
        cursor.close()
        db.close()

@app.delete("/api/playlists/{playlist_id}")
def delete_playlist(playlist_id: int):
    db = get_db()
    if not db: return {"error": "DB"}
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM user_playlists WHERE id = %s", (playlist_id,))
        db.commit()
        return {"message": "Playlist deleted successfully"}
    finally:
        cursor.close()
        db.close()

@app.get("/api/playlists/{user_id}")
def get_playlists(user_id: int):
    db = get_db()
    if not db: return []
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, title, tracks FROM user_playlists WHERE user_id = %s ORDER BY id ASC", (user_id,))
        rows = cursor.fetchall()
        title_map = {}
        to_delete_ids = []
        for r in rows:
            t_title = (r["title"] or "").strip().lower()
            try:
                r["tracks"] = json.loads(r["tracks"]) if isinstance(r["tracks"], str) else (r["tracks"] or [])
            except Exception:
                r["tracks"] = []
                
            if t_title in title_map:
                existing = title_map[t_title]
                if len(r["tracks"]) >= len(existing["tracks"]):
                    to_delete_ids.append(existing["id"])
                    title_map[t_title] = r
                else:
                    to_delete_ids.append(r["id"])
            else:
                title_map[t_title] = r

        if to_delete_ids:
            try:
                format_strings = ','.join(['%s'] * len(to_delete_ids))
                cursor.execute(f"DELETE FROM user_playlists WHERE id IN ({format_strings})", tuple(to_delete_ids))
                db.commit()
            except Exception as del_err:
                print("Error deleting duplicate playlists:", del_err)

        return list(title_map.values())
    finally:
        cursor.close()
        db.close()

@app.get("/api/autoplay/{video_id}")
def get_autoplay(video_id: str):
    try:
        wp = yt.get_watch_playlist(videoId=video_id, limit=20)
        tracks = []
        for t in wp.get("tracks", []):
            if t.get("videoId") != video_id:
                formatted = format_track(t)
                if formatted: tracks.append(formatted)
        return tracks
    except Exception as e:
        print("Autoplay Error:", e)
        return []

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
    except Exception as err:
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
    except Exception as err:
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
        cursor.execute("SELECT track_data FROM liked_songs WHERE user_id = %s ORDER BY id DESC", (user_id,))
        rows = cursor.fetchall()
        songs = []
        for row in rows:
            td = row['track_data']
            if isinstance(td, str):
                try:
                    songs.append(json.loads(td))
                except Exception:
                    pass
            elif isinstance(td, dict):
                songs.append(td)
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
            (req.user_id, str(track_id), json.dumps(req.track_data))
        )
        db.commit()
        return {"message": "Song added"}
    except Exception as e:
        print("Error adding liked song:", e)
        raise HTTPException(status_code=500, detail=str(e))
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
        cursor.execute("DELETE FROM liked_songs WHERE user_id = %s AND track_id = %s", (user_id, str(track_id)))
        db.commit()
        return {"message": "Song removed"}
    except Exception as e:
        print("Error removing liked song:", e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()

from fastapi.responses import RedirectResponse

@app.get("/api/cover-fallback")
def cover_fallback(artist: str = "", title: str = "", video_id: str = "", type: str = "song"):
    try:
        if type == "artist" and artist:
            # Search for the artist
            res = yt.search(artist, filter="artists", limit=1)
            if res:
                cover = res[0].get("thumbnails", [{}])[-1].get("url", "")
                if cover:
                    cover = re.sub(r'=w\d+-h\d+', '=w1080-h1080', cover)
                    cover = re.sub(r'=s\d+', '=s1080', cover)
                    return RedirectResponse(url=cover)
        else:
            # 1. Attempt iTunes API search for pristine 1000x1000 official album art
            search_terms = f"{title} {artist}".strip()
            if search_terms:
                try:
                    itunes_resp = requests.get(
                        f"https://itunes.apple.com/search?term={urllib.request.quote(search_terms)}&entity=song&limit=1",
                        timeout=2.5
                    )
                    if itunes_resp.status_code == 200:
                        itunes_data = itunes_resp.json()
                        if itunes_data.get("resultCount", 0) > 0:
                            art_url = itunes_data["results"][0].get("artworkUrl100", "")
                            if art_url:
                                hd_art = art_url.replace("100x100bb", "1000x1000bb")
                                return RedirectResponse(url=hd_art)
                except Exception as it_err:
                    print("iTunes art fallback error:", it_err)

            # 2. Search YT Music
            query = f"{artist} {title}".strip()
            if query:
                res = yt.search(query, filter="songs", limit=1)
                if res:
                    vid = res[0].get("videoId")
                    cover = res[0].get("thumbnails", [{}])[-1].get("url", "")
                    if cover:
                        cover = re.sub(r'=w\d+-h\d+', '=w1080-h1080', cover)
                        cover = re.sub(r'=s\d+', '=s1080', cover)
                        return RedirectResponse(url=cover)
                    elif vid:
                        return RedirectResponse(url=f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg")

        # 3. Direct YouTube CDN thumbnail if video_id is a valid 11-char ID
        if video_id and len(video_id) == 11 and "-" not in video_id[:8]:
            return RedirectResponse(url=f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg")
    except Exception as e:
        print("Error in cover_fallback:", e)
    
    # Fallback to high quality abstract modern background image
    return RedirectResponse(url="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1080&q=80")

@app.get("/api/recommended")
def get_recommended_songs(user_id: int = None, limit: int = 20):
    db = get_db()
    history = []
    if user_id and db:
        try:
            cursor = db.cursor(dictionary=True)
            cursor.execute("SELECT track_data, MAX(listened_at) as last_played FROM listening_history WHERE user_id = %s GROUP BY track_data ORDER BY last_played DESC LIMIT 15", (user_id,))
            rows = cursor.fetchall()
            history = [json.loads(r["track_data"]) for r in rows]
            cursor.close()
        except Exception as e:
            print("Error fetching history for recommended:", e)
        finally:
            db.close()
        
    ref_track = None
    if history:
        ref_track = random.choice(history)
    else:
        ref_track = random.choice(DEFAULT_TRACKS)

    try:
        wp = yt.get_watch_playlist(videoId=ref_track.get('youtube_id'), limit=limit)
        tracks = [format_track(t) for t in wp.get("tracks", []) if format_track(t)]
        if tracks:
            return tracks
    except Exception as e:
        print("Error in get_recommended_songs watch playlist:", e)
    
    # Return formatted default tracks on failure
    return [
        format_track({
            "videoId": t["youtube_id"],
            "title": t["title"],
            "artists": [{"name": t["artist"]}],
            "thumbnails": [{"url": f"https://img.youtube.com/vi/{t['youtube_id']}/maxresdefault.jpg"}]
        }) for t in DEFAULT_TRACKS
    ]

@app.get("/api/hot-new")
def get_hot_new(limit: int = 30):
    def fetch_hotnew():
        res = yt.search("Hot and new songs", filter="songs", limit=limit)
        return [format_track(i) for i in res if format_track(i)]
    return get_cached("hotnew_page", 600, fetch_hotnew)

@app.get("/api/editors-picks")
def get_editors_picks(limit: int = 30):
    def fetch_picks():
        res = yt.search("Editor picks hits", filter="songs", limit=limit)
        return [format_track(i) for i in res if format_track(i)]
    return get_cached("editors_picks_page", 1200, fetch_picks)

@app.get("/api/aoty")
def get_aoty(limit: int = 30):
    def fetch_aoty():
        res = yt.search("album of the year hits", filter="songs", limit=limit)
        return [format_track(i) for i in res if format_track(i)]
    return get_cached("aoty_page", 3600, fetch_aoty)

