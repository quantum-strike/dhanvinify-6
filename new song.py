import sqlite3
con = sqlite3.connect("static/dhanvinify.db", check_same_thread=False)
cur = con.cursor()

songs = [
    {
        'image': "https://github.com/Fantastiamask/songs/blob/main/images/thulli_thulli.jpeg?raw=true",
        'id': 5
    },
    {
        'image': "https://github.com/Fantastiamask/songs/blob/main/images/vaathi_coming.jpeg?raw=true",
        'id': 6
    },
    {
        'image': "https://github.com/Fantastiamask/songs/blob/main/images/varavaa_varavaa.jpeg?raw=true",
        'id': 7
    },
]

for song in songs:
    cur.execute("UPDATE songs SET image = ? WHERE rowid = ?", (song['image'], song['id']))
    con.commit()
    print("Added", song['id'], "\n")
