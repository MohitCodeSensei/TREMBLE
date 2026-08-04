import mysql.connector
import json

def clean_playlists():
    try:
        db = mysql.connector.connect(host='localhost', user='root', password='', database='tremble_db')
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, user_id, title, tracks FROM user_playlists")
        rows = cursor.fetchall()
        
        print(f"Read {len(rows)} playlists from DB.")
        
        # Group by user_id and track key
        groups = {}
        for r in rows:
            user_id = r['user_id']
            try:
                tracks = json.loads(r['tracks'])
            except Exception as e:
                print(f"Error parsing tracks for ID {r['id']}:", e)
                tracks = []
            if not tracks: continue
            
            # Create a sorted track key
            track_ids = []
            for t in tracks:
                tid = t.get('youtube_id') or t.get('id') or t.get('videoId')
                if tid: track_ids.append(str(tid))
            track_ids.sort()
            track_key = ",".join(track_ids)
            
            group_key = (user_id, track_key)
            if group_key not in groups:
                groups[group_key] = []
            groups[group_key].append(r)
            
        delete_ids = []
        for group_key, plist in groups.items():
            if len(plist) > 1:
                # Sort by title length descending
                plist.sort(key=lambda x: len(x['title']), reverse=True)
                longest = plist[0]
                for p in plist[1:]:
                    if longest['title'].lower().startswith(p['title'].lower()):
                        delete_ids.append(p['id'])
                        
        if delete_ids:
            format_strings = ','.join(['%s'] * len(delete_ids))
            cursor.execute(f"DELETE FROM user_playlists WHERE id IN ({format_strings})", tuple(delete_ids))
            db.commit()
            print(f"Deleted {len(delete_ids)} duplicate prefix playlists: {delete_ids}")
        else:
            print("No corrupted/duplicate playlists found in DB.")
            
        cursor.close()
        db.close()
    except Exception as e:
        print("Database error:", e)

if __name__ == '__main__':
    clean_playlists()
