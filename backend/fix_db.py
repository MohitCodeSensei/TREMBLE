import mysql.connector
import json
from ytmusicapi import YTMusic
import time
import os

print("Starting duration fix...")

yt = YTMusic()
try:
    db = mysql.connector.connect(host='localhost', user='root', password='', database='tremble_db')
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT user_id, track_id, track_data FROM liked_songs")
    rows = cursor.fetchall()

    fixed_count = 0
    for row in rows:
        track_data = json.loads(row['track_data'])
        if track_data.get('duration') in [None, "0:00", "00:00"]:
            print(f"Fixing missing duration for: {track_data.get('title')} - {track_data.get('artist')}")
            try:
                # Search ytmusic
                search_q = f"{track_data.get('title')} {track_data.get('artist')}"
                res = yt.search(search_q, filter="songs", limit=1)
                
                if res and len(res) > 0:
                    found_duration = res[0].get('duration')
                    if found_duration:
                        track_data['duration'] = found_duration
                        cursor.execute(
                            "UPDATE liked_songs SET track_data = %s WHERE user_id = %s AND track_id = %s",
                            (json.dumps(track_data), row['user_id'], row['track_id'])
                        )
                        db.commit()
                        fixed_count += 1
                        print(f"-> Fixed to {found_duration}")
                    else:
                        print(f"-> Could not find duration from ytmusic search")
                else:
                    print(f"-> No search results found")
                
                time.sleep(1) # Prevent rate limiting
            except Exception as e:
                print(f"-> Error searching ytmusic: {e}")

    cursor.close()
    db.close()
    print(f"Finished! Fixed {fixed_count} songs.")
except Exception as e:
    print(f"Database error: {e}")
