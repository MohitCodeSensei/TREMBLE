# Legacy patch script - deactivated to preserve current main.py structure
if __name__ == "__main__":
    print("patch_main.py is legacy and currently deactivated.")
    exit(0)

# 2. Add History Models and Playlists Models
models_code = """
class HistoryRequest(BaseModel):
    user_id: int
    track_data: dict

class PlaylistRequest(BaseModel):
    user_id: int
    title: str
    tracks: list
"""
if "class HistoryRequest(BaseModel):" not in content:
    content = content.replace("class AuthRequest(BaseModel):", models_code + "\nclass AuthRequest(BaseModel):")


# 3. Add Endpoints for History, Playlists, Autoplay
new_endpoints = """

@app.post("/api/history")
def add_history(req: HistoryRequest):
    db = get_db()
    if not db:
        return {"error": "Database error"}
    cursor = db.cursor()
    try:
        track_id = req.track_data.get("id") or req.track_data.get("youtube_id")
        cursor.execute(
            "INSERT INTO listening_history (user_id, track_id, track_data) VALUES (%s, %s, %s)",
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
        # Group by track_id to avoid immediate duplicates, order by max listened_at
        cursor.execute("SELECT track_data, MAX(listened_at) as last_played FROM listening_history WHERE user_id = %s GROUP BY track_data ORDER BY last_played DESC LIMIT 15", (user_id,))
        rows = cursor.fetchall()
        return [json.loads(r["track_data"]) for r in rows]
    finally:
        cursor.close()
        db.close()

@app.post("/api/playlists")
def create_playlist(req: PlaylistRequest):
    db = get_db()
    if not db: return {"error": "DB"}
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO user_playlists (user_id, title, tracks) VALUES (%s, %s, %s)", (req.user_id, req.title, json.dumps(req.tracks)))
        db.commit()
        return {"id": cursor.lastrowid}
    finally:
        cursor.close()
        db.close()

@app.get("/api/playlists/{user_id}")
def get_playlists(user_id: int):
    db = get_db()
    if not db: return []
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, title, tracks FROM user_playlists WHERE user_id = %s", (user_id,))
        rows = cursor.fetchall()
        for r in rows:
            r["tracks"] = json.loads(r["tracks"])
        return rows
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

"""
if "@app.post(\"/api/history\")" not in content:
    content = content.replace("def get_db():", new_endpoints + "\ndef get_db():")


# 4. Replace get_home
new_home = """
def get_cached(key, ttl, fetch_func):
    now = time.time()
    if key in cache_store and now - cache_store[key]['time'] < ttl:
        data = list(cache_store[key]['data']) # Copy
        random.shuffle(data) # Shuffle slightly on cache hit
        return data
    try:
        data = fetch_func()
        cache_store[key] = {'time': now, 'data': data}
        res_data = list(data)
        random.shuffle(res_data)
        return res_data
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

        # 2. Hollywood Popular Songs (Generic)
        def fetch_hollywood():
            res = yt.search("Hollywood popular songs", filter="songs", limit=30)
            return [format_track(i) for i in res if format_track(i)]
        hw = get_cached("hollywood", 600, fetch_hollywood)
        if hw: categories.append({"title": "Hollywood Popular Songs", "tracks": hw[:limit]})

        # 3. Favored Shuffles (Generic)
        def fetch_shuffles():
            res = yt.search("Top hits shuffle", filter="songs", limit=30)
            return [format_track(i) for i in res if format_track(i)]
        shuffles = get_cached("shuffles", 600, fetch_shuffles)
        if shuffles: categories.append({"title": "Favored Shuffles", "tracks": shuffles[:limit]})

        # 4. Mainstream Tremblers (Generic, artist type)
        def fetch_mainstream():
            res = yt.search("Top artists popular", filter="songs", limit=30)
            artists = []
            seen = set()
            for r in res:
                if 'artists' in r and len(r['artists']) > 0:
                    art = r['artists'][0]
                    if art['id'] and art['id'] not in seen:
                        seen.add(art['id'])
                        cover = r.get('thumbnails', [{}])[-1].get('url', '')
                        artists.append({"id": art['id'], "youtube_id": art['id'], "title": art['name'], "type": "artist", "cover_url": cover})
            return artists
        mt = get_cached("mainstream", 3600, fetch_mainstream)
        if mt: categories.append({"title": "Mainstream Tremblers", "tracks": mt[:limit]})

        # 5. Recommended for you (Personalized)
        if user_id and history:
            ref_track = random.choice(history)
            def fetch_rec():
                wp = yt.get_watch_playlist(videoId=ref_track.get('youtube_id'), limit=20)
                return [format_track(t) for t in wp.get("tracks", []) if format_track(t)]
            rec = fetch_rec()
            if rec: categories.append({"title": "Recommended for you", "tracks": rec[:limit]})

        # 6. Hot & New (Generic)
        def fetch_hotnew():
            res = yt.search("Hot and new songs", filter="songs", limit=30)
            return [format_track(i) for i in res if format_track(i)]
        hn = get_cached("hotnew", 600, fetch_hotnew)
        if hn: categories.append({"title": "Hot & New", "tracks": hn[:limit]})

        # 7. Alike {Playlist Name} (Personalized)
        if user_id:
            db = get_db()
            if db:
                c = db.cursor(dictionary=True)
                c.execute("SELECT track_data FROM liked_songs WHERE user_id = %s LIMIT 50", (user_id,))
                liked = c.fetchall()
                c.close()
                db.close()
                if liked:
                    ref = random.choice(liked)
                    tdata = json.loads(ref['track_data'])
                    def fetch_alike():
                        res = yt.search(f"{tdata.get('title', '')} alike similar playlist", filter="playlists", limit=10)
                        return [format_track(i) for i in res if format_track(i)]
                    alike = fetch_alike()
                    if alike: categories.append({"title": f"Alike Liked Songs", "tracks": alike})

        # 8. Because you like {song name} (Personalized)
        if user_id and history:
            ref_track2 = history[0] # Most recent
            def fetch_because():
                wp = yt.get_watch_playlist(videoId=ref_track2.get('youtube_id'), limit=20)
                return [format_track(t) for t in wp.get("tracks", []) if format_track(t)]
            bec = fetch_because()
            if bec: categories.append({"title": f"Because you like {ref_track2.get('title')}", "tracks": bec[:limit]})

        # 9. Daily Top 100 (Generic)
        def fetch_top100():
            countries = ["World", "India", "Russia", "USA", "UK", "Japan", "Brazil", "France"]
            random.shuffle(countries)
            countries.remove("World")
            final_c = ["World"] + countries[:5]
            pls = []
            for c in final_c:
                res = yt.search(f"Daily Top 100 {c}", filter="playlists", limit=1)
                for r in res:
                    t = format_track(r)
                    if t:
                        t['is_top100'] = True
                        t['country'] = c
                        pls.append(t)
            return pls
        top100 = get_cached("top100", 86400, fetch_top100)
        # Always ensure World is left-most
        if top100:
            world = [x for x in top100 if x.get('country') == 'World']
            others = [x for x in top100 if x.get('country') != 'World']
            random.shuffle(others)
            categories.append({"title": "Daily Top 100", "tracks": world + others})

        return categories
    except Exception as e:
        print("Home Feed Error:", e)
        return []
"""

home_pattern = re.compile(r"@app\.get\(\"/home\"\).*?return \[\]\n", re.DOTALL)
if home_pattern.search(content):
    content = home_pattern.sub(new_home, content)


with open("C:/tremble/backend/main.py", "w", encoding="utf-8") as f:
    f.write(content)
