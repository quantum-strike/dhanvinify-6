from fuzzywuzzy import fuzz
from flask import Flask, render_template, jsonify, Response, request, redirect, session, render_template_string
import sqlite3
import random
con = sqlite3.connect('/home/dhanTune/dhanvinify/static/dhanvinify.db', check_same_thread=False)
cur = con.cursor()
from flask_session import Session
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"]="filesystem"
Session(app)
song = []

allsong = []
playlist = []
playlist_name = 0
playlists = 0
artists = []


## backend functions
def job():
    cur.execute("SELECT artist FROM songs")
    artists_raw = cur.fetchall()

    artist_list = []
    seen_names = set()  # Use a set to track unique names

    for row in artists_raw:
        artist_string = row[0]  # Fetching the artist name from the row
        names_list = [name.strip() for name in artist_string.split(",")]

        for name in names_list:
            if name not in seen_names:
                seen_names.add(name)  # Add the name to the set
                artist_list.append(name)  # Add to the final list
    return artist_list
def verify():
    if session.get("username", False):
        if session.get("pin", False):
            return True
    return False

def hehe(playlist_id):
    global playlist, playlist_name, songs
    cur.execute("SELECT count(*) FROM playlists WHERE rowid=?", (playlist_id,))
    check = cur.fetchone()
    if check[0] == 0:
        return False
    cur.execute("SELECT name FROM playlists WHERE rowid=?", (playlist_id,))
    playlist_name = cur.fetchone()
    playlist_name = playlist_name[0]
    cur.execute("SELECT count(*) FROM playlists_data WHERE playlist_id=?", (playlist_id,))
    check = cur.fetchone()
    if check[0] == 0:
        songs = {}
        return "none"
    cur.execute("SELECT song_id FROM playlists_data WHERE playlist_id=?",  (playlist_id,))
    playlist_songs = cur.fetchall()
    playlist_data = []
    for id in playlist_songs:
        cur.execute("SELECT rowid, name, artist, url, image, duration FROM songs WHERE rowid= (?)", (id))
        playlist_data.append(cur.fetchone())
    playlist = [
    {
        "id": row[0],
        "name": row[1],
        "artist": row[2],
        "url": row[3],
        "image": row[4],
        "duration": row[5]
    }
    for row in playlist_data
    ]
    cur.execute("SELECT song_id FROM playlists_data WHERE playlist_id=?", (playlist_id,))
    songs_id = cur.fetchall()
    songs_data = []
    for id in songs_id:
        cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
        songs_data.append(cur.fetchone())
    songs = [
    {
        "id": row[0],
        "name": row[1],
        "artist": row[2],
    }
    for row in songs_data
    ]
    return True

    # with open(f'static/{file}') as f:
    #     playlist = json.load(f)

def songPlay(song_id):
    global playlist, playlist_name
    cur.execute("SELECT count(*) FROM songs WHERE rowid=?", (song_id, ))
    check = cur.fetchone()
    if check[0] == 0:
        return False
    # cur.execute("SELECT name FROM playlists WHERE id=?", (song_id))
    # playlist_name = cur.fetchone()
    # playlist_name = playlist_name[0]
    cur.execute("SELECT rowid FROM songs WHERE rowid=?",  (song_id, ))
    playlist_songs = cur.fetchall()
    playlist_data = []
    for id in playlist_songs:
        cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
        playlist_data.append(cur.fetchone())
    playlist = [
    {
        "id": row[0],
        "name": row[1],
        "artist": row[2],
        "url": row[3],
        "image": row[4]
    }
    for row in playlist_data
    ]
    return True

def all_songs():
    global song, allsong
    # cur.execute("SELECT name FROM playlists WHERE id=?", (song_id))
    # playlist_name = cur.fetchone()
    # playlist_name = playlist_name[0]
    cur.execute("SELECT rowid FROM songs")
    playlist_songs = cur.fetchall()
    playlist_data = []
    for id in playlist_songs:
        cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
        playlist_data.append(cur.fetchone())
    allsong = [
    {
        "id": row[0],
        "name": row[1],
        "artist": row[2],
    }
    for row in playlist_data
    ]
    return True

def auth_user(name, pin):
    cur.execute("SELECT COUNT(*) FROM users WHERE email=?", (name, ))
    res = cur.fetchone()
    result = res[0]
    if result == 0:
        return "No Account"
    cur.execute("SELECT password FROM users WHERE email=?", (name, ))
    res = cur.fetchone()
    result = res[0]
    if result != pin:
        return "Incorrect pin"
    if result == pin:
        return True

## User Routes
@app.route('/')
def index():
    message1 = request.args.get("message")
    if message1:
        message = message1
    else:
        message=""
    if session.get("username", False):
        username = session.get("username")
        pin = session.get("pin")
        return redirect(f"/home?message={message}")
    return render_template('login.html', message=message)

@app.route('/login', methods=['POST', 'GET'])
def login():
    name = request.form.get("email", "Not Found")
    pin = request.form.get("password", "Not F0und")

    auth = auth_user(name, pin)
    if auth == "Incorrect pin":
        return redirect("/?message=Incorrect+Password!")
    elif auth == "No Account":
        return redirect("/?message=Account+Not+Found!")
    else:
        session["username"] = name
        session["pin"] = pin
        cur.execute("SELECT username, profile FROM users WHERE email=?", (session["username"], ))
        username = cur.fetchall()
        session["name"] = username[0][0]
        session["icon"] = username[0][1]
        return redirect("/home")

@app.route('/sigma/alpha/verify')
def verify_user():
    name = request.args.get("email", "Not Found")
    pin = request.args.get("password", "Not Found")

    auth = auth_user(name, pin)
    if auth == "Incorrect pin":
        return {'status': 'Incorrect Pin'}
    elif auth == "No Account":
        return {'status': 'No Account'}
    else:
        cur.execute("SELECT username FROM users WHERE email=?", (name, ))
        res = cur.fetchone()
        result = res[0]
        return {'status': 'Verified', 'info': result}

@app.route('/get/user_playlists')
def get_user_playlists():
    email = request.args.get("email")
    cur.execute("SELECT username FROM users WHERE email = ?", (email, ))
    username = cur.fetchone()
    username = username[0]
    cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
    playlists = cur.fetchall()
    return jsonify(playlists)

@app.route('/home')
def home():
    if verify():
        username = session.get("name")
        icon = session.get("icon")
        message1 = request.args.get("message")
        if message1:
            message = message1
        else:
            message=""
        cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
        playlists = cur.fetchall()
        cur.execute("SELECT count(rowid) FROM songs")
        count = cur.fetchone()
        count = count[0]
        song1_id = random.randint(1, count)
        song2_id = random.randint(1, count)
        cur.execute("SELECT rowid FROM songs WHERE rowid=? OR rowid=?",  (song1_id, song2_id))
        playlist_songs = cur.fetchall()
        playlist_data = []
        for id in playlist_songs:
            cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
            playlist_data.append(cur.fetchone())
        reccomend = [
        {
            "id": row[0],
            "name": row[1],
            "artist": row[2],
            "url": row[3],
            "image": row[4]
        }
        for row in playlist_data
        ]
        return render_template('index.html', name=username, playlist=playlists, message=message, reccomend=reccomend, icon=icon)
    redirect('/')

@app.route('/logout', methods=['POST', 'GET'])
def logout():
    session.clear()
    return redirect("/")

@app.route('/settings', methods=['POST', 'GET'])
def settings():
    if verify():
        username = session.get("name")
        icon = session.get("icon")
        return render_template('settings.html', name=username, profile=icon)
    else:
        return redirect("/")

@app.route('/user/icon')
def icon():
    if verify():
        user = request.args.get("user")  # Ensure you use the correct parameter name
        new_icon = request.args.get("new")  # Changed from icon to new_icon for clarity

        # Validate inputs
        if not user or not new_icon:
            return redirect("/")

        try:
            # Use parameterized query to prevent SQL injection
            cur.execute("UPDATE users SET profile = ? WHERE username = ?", (new_icon, user))
            con.commit()
        except Exception as e:
            print(f"Error updating icon: {e}")  # Log the error for debugging
            return jsonify({"error": "Failed to update icon"}), 500  # Return a JSON error message
        session["icon"] = new_icon
        return jsonify({"success": True})  # Return a success response
    else:
        return redirect("/")


#mobile_routes
@app.route('/mobile')
def mobile():
    message1 = request.args.get("message")
    if message1:
        message = message1
    else:
        message=""
    if session.get("username", False):
        username = session.get("username")
        pin = session.get("pin")
        return redirect(f"/mobile/home?message={message}")
    return render_template('mobile/login.html', message=message)

@app.route('/mobile/login', methods=['POST', 'GET'])
def mobile_login():
    name = request.form.get("email", "Not Found")
    pin = request.form.get("password", "Not F0und")

    auth = auth_user(name, pin)
    if auth == "Incorrect pin":
        return redirect("/mobile?message=Incorrect+Password!")
    elif auth == "No Account":
        return redirect("/mobile?message=Account+Not+Found!")
    else:
        session["username"] = name
        session["pin"] = pin
        cur.execute("SELECT username FROM users WHERE email=?", (session["username"], ))
        username = cur.fetchone()
        session["name"] = username[0]
        return redirect("/mobile/home")

@app.route('/mobile/home')
def mobile_home():
    if verify():
        username = session.get("name")
        message1 = request.args.get("message")
        if message1:
            message = message1
        else:
            message=""
        cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
        playlists = cur.fetchall()
        cur.execute("SELECT count(rowid) FROM songs")
        count = cur.fetchone()
        count = count[0]
        song1_id = random.randint(1, count)
        song2_id = random.randint(1, count)
        cur.execute("SELECT rowid FROM songs WHERE rowid=? OR rowid=?",  (song1_id, song2_id))
        playlist_songs = cur.fetchall()
        playlist_data = []
        for id in playlist_songs:
            cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
            playlist_data.append(cur.fetchone())
        reccomend = [
        {
            "id": row[0],
            "name": row[1],
            "artist": row[2],
            "url": row[3],
            "image": row[4]
        }
        for row in playlist_data
        ]
        return render_template('mobile/index.html', name=username, playlist=playlists, message=message, reccomend=reccomend)
    redirect('/')

@app.route('/app')
def app_slash():
    message1 = request.args.get("message")
    if message1:
        message = message1
    else:
        message=""
    if session.get("username", False):
        username = session.get("username")
        pin = session.get("pin")
        return redirect(f"/app/home?message={message}")
    return render_template('mobile/login.html', message=message)

@app.route('/app/login', methods=['POST', 'GET'])
def applogin():
    name = request.form.get("email", "Not Found")
    pin = request.form.get("password", "Not F0und")

    auth = auth_user(name, pin)
    if auth == "Incorrect pin":
        return redirect("/app?message=Incorrect+Password!")
    elif auth == "No Account":
        return redirect("/app?message=Account+Not+Found!")
    else:
        session["username"] = name
        session["pin"] = pin
        cur.execute("SELECT username FROM users WHERE email=?", (session["username"], ))
        username = cur.fetchone()
        session["name"] = username[0]
        return redirect("/app/home")

@app.route('/app/home')
def app_home():
    if verify():
        username = session.get("name")
        message1 = request.args.get("message")
        if message1:
            message = message1
        else:
            message=""
        cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
        playlists = cur.fetchall()
        cur.execute("SELECT count(rowid) FROM songs")
        count = cur.fetchone()
        count = count[0]
        song1_id = random.randint(1, count)
        song2_id = random.randint(1, count)
        cur.execute("SELECT rowid FROM songs WHERE rowid=? OR rowid=?",  (song1_id, song2_id))
        playlist_songs = cur.fetchall()
        playlist_data = []
        for id in playlist_songs:
            cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
            playlist_data.append(cur.fetchone())
        reccomend = [
        {
            "id": row[0],
            "name": row[1],
            "artist": row[2],
            "url": row[3],
            "image": row[4]
        }
        for row in playlist_data
        ]
        return render_template('app/index.html', name=username, playlist=playlists, message=message, reccomend=reccomend)
    redirect('/')


#api
@app.route('/get/artist/list')
def get_artist():
    artists = job()
    search_term = request.args.get("term", "")
    term = search_term.lower().strip()  # Normalize the search term

    new_list = []

    for artist in artists:
        name = artist.lower().strip()  # Normalize artist names

        # Use fuzzy matching to determine if the artist matches the search term
        if fuzz.partial_ratio(term, name) > 70:  # Adjust threshold as needed
            new_list.append(artist)  # Add the original artist name to the results

    return jsonify(new_list)
@app.route('/playlist_data')
def get_playlist():
    playlist_id = request.args.get("id")

    hehe(playlist_id)
    return jsonify (playlist)
@app.route('/song_data')
def get_song():
    song_id = request.args.get("id")

    songPlay(song_id)
    return jsonify (playlist)

@app.route("/add_playlist")
def add_playlist():
    if verify():
        username = session.get("name")
        cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
        playlists = cur.fetchall()
        return render_template("new_playlist.html", name=username, playlist=playlists)
    else:
        return redirect("/")
@app.route("/new_playlist")
def new_playlist():
    if verify():
        name = request.args.get("name", False)
        username = session.get("name")
        if not name:
            return redirect("/")
        cur.execute("INSERT INTO playlists(name, username) VALUES(?, ?)", (name, username))
        con.commit()
        return redirect("/browse")
    else:
        return redirect("/")
@app.route("/add_song")
def add_song():
    if verify():
        name = request.args.get("name", False)
        artist = request.args.get("artist", False)
        lang = request.args.get("lang", False)
        track = request.args.get("track", False)
        image = request.args.get("image", False)
        duration = request.args.get("duration", False)
        if not name:
            return redirect("/")
        if not artist:
            return redirect("/")
        if not track:
            return redirect("/")
        if not image:
            return redirect("/")
        if not duration:
            return redirect("/")
        if not lang:
            return redirect("/")
        cur.execute("INSERT INTO songs(name, artist, url, image, duration, lang) VALUES(?, ?, ?, ?, ?, ?)", (name, artist, track, image, duration, lang))
        con.commit()
        return redirect("/?message=Added!")
    else:
        return redirect("/")
@app.route("/api/add_song")
def api_add_song():
    name = request.args.get("name", False)
    artist = request.args.get("artist", False)
    lang = request.args.get("lang", False)
    track = request.args.get("track", False)
    image = request.args.get("image", False)
    duration = request.args.get("duration", False)
    if not name:
        return jsonify({"success": False}), 404
    if not artist:
        return jsonify({"success": False}), 404
    if not track:
        return jsonify({"success": False}), 404
    if not image:
        return jsonify({"success": False}), 404
    if not duration:
        return jsonify({"success": False}), 404
    if not lang:
        return jsonify({"success": False}), 404
    cur.execute("INSERT INTO songs(name, artist, url, image, duration, lang) VALUES(?, ?, ?, ?, ?, ?)", (name, artist, track, image, duration, lang))
    con.commit()
    return jsonify({"success": True}), 200
@app.route("/add_song_render")
def add_song_render():
    username = session.get("name")
    cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
    playlists = cur.fetchall()
    return render_template("add_song.html", name=username, playlist=playlists)
@app.route("/add_user")
def add_user():
    username = request.args.get("username", False)
    email = request.args.get("email", False)
    password = request.args.get("password", False)
    if not username:
        return redirect("/")
    if not email:
        return redirect("/")
    if not password:
        return redirect("/")
    cur.execute("INSERT INTO users(username, email, password) VALUES(?, ?, ?)", (username, email, password))
    con.commit()
    return redirect("/?message=Added!")
@app.route("/add_user_render")
def add_user_render():
    username = session.get("name")
    cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
    playlists = cur.fetchall()
    return render_template("add_user.html", name=username, playlist=playlists)
@app.route("/add")
def add():
    song = request.args.get("song", False)
    playlist = request.args.get("list", False)
    if not song:
        return redirect("/?message=error1")
    if not playlist:
        return redirect("/?message=error2")
    cur.execute("SELECT count(*) FROM songs WHERE rowid=?", (song, ))
    check = cur.fetchone()
    if check[0] == 0:
        return redirect("/?message=error3")
    cur.execute("SELECT count(*) FROM playlists WHERE rowid=?", (playlist, ))
    check = cur.fetchone()
    if check[0] == 0:
        return 'error'
    cur.execute("SELECT count(*) FROM playlists_data WHERE song_id=? AND playlist_id=?", (song, playlist))
    check = cur.fetchone()
    if check[0] != 0:
        cur.execute("DELETE FROM playlists_data WHERE song_id=?", (song, ))
        con.commit()
        return 'false'
    cur.execute("INSERT INTO playlists_data(playlist_id, song_id) VALUES(?, ?)", (playlist, song))
    con.commit()
    return 'true'

@app.route("/del_playlist")
def del_playlist():
    id = request.args.get("id", False)
    username = session.get("name")
    if not id:
        return redirect("/")
    cur.execute("DELETE FROM playlists WHERE rowid=?", (id, ))
    cur.execute("DELETE FROM playlists_data WHERE playlist_id=?", (id, ))
    con.commit()
    return redirect("/your_playlists")



    app.run(debug=True)

@app.route("/all_data")
def search_data():
    search_term = request.args.get("search", False)
    if not search_term:
        return redirect("/")
    search = "%" + search_term + "%"
    cur.execute("SELECT rowid FROM songs WHERE name LIKE ?", (search,))
    songs_id = cur.fetchall()
    songs_data = []
    for id in songs_id:
        cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
        songs_data.append(cur.fetchone())
    songs = [
    {
        "id": row[0],
        "name": row[1],
        "artist": row[2],
    }
    for row in songs_data
    ]
    return jsonify(songs)


@app.route("/search_api")
def search_api():
    search_term = request.args.get("search")
    lang_term = request.args.get("lang")

    # Return error response if search or lang term is missing
    if not search_term or not lang_term:
        return jsonify({"error": "Missing search or language parameter"}), 400

    # Prepare the search query parameters
    search = f"%{search_term}%"

    # Use a conditional to handle 'all' language term
    if lang_term != "all":
        lang = f"%{lang_term}%"
        query = "SELECT rowid, name, artist FROM songs WHERE name LIKE ? AND lang LIKE ?"
        params = (search, lang)
    else:
        query = "SELECT rowid, name, artist FROM songs WHERE name LIKE ?"
        params = (search,)

    # Execute the query
    cur.execute(query, params)
    songs_data = cur.fetchall()

    # Build the response list from fetched data
    songs = [
        {
            "id": row[0],
            "name": row[1],
            "artist": row[2],
        }
        for row in songs_data
    ]

    return jsonify(songs)

## /html renders

@app.route("/html/artist")
def artist():
    artist_name = request.args.get("artist")

    # Query to fetch songs by the specified artist
    cur.execute("SELECT name, image, url, duration, lang, rowid, artist FROM songs WHERE artist LIKE ?", ('%' + artist_name + '%',))
    songs = cur.fetchall()

    # Check if any songs were found
    if not songs:
        return jsonify({"message": "No songs found for the artist."}), 404

    # Constructing a list of songs
    song_list = []
    for song in songs:
        song_data = {
            "name": song[0],
            "image": song[1],
            "url": song[2],
            "duration": song[3],
            "lang": song[4],
            "id": song[5],
            "artist": song[6]
        }
        song_list.append(song_data)
    return render_template('stripped/artist.html', artist_name=artist_name, song_list=song_list)

@app.route("/html/request")
def test():
    return render_template('stripped/request.html')

@app.route("/html/report")
def report():
    return render_template('stripped/report.html')

@app.route("/html/search")
def search_auto():
    username = session.get("name")
    cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
    playlists = cur.fetchall()
    return render_template("stripped/search_api.html", name=username, playlist=playlists)
@app.route("/html/mobile/search")
def search_auto_mobile():
    username = session.get("name")
    cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
    playlists = cur.fetchall()
    return render_template("mobile/search_api.html", name=username, playlist=playlists)

@app.route("/html/your_playlists")
def user_playlists():
    username = session.get("name")
    cur.execute("SELECT count(*) FROM playlists WHERE username = ?", (username, ))
    check1 = cur.fetchone()
    if check1[0] == 0:
        check = 'none'
        return render_template("playlist.html", check=check)
    else:
        cur.execute("SELECT rowid FROM playlists WHERE username=?", (username, ))
        ids = cur.fetchall()
        cur.execute("SELECT rowid FROM playlists WHERE username=?", (username, ))
        data = []
        for id in ids:
            cur.execute("SELECT rowid, name FROM playlists WHERE rowid= (?)", (id))
            data.append(cur.fetchone())
        songs = [
        {
            "id": row[0],
            "name": row[1],
        }
        for row in data
        ]
        username = session.get("name")
        cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
        playlists = cur.fetchall()
        return render_template("stripped/playlist.html", songs=songs, name=username, playlist=playlists)

@app.route('/html/browse')
def browse():
    if verify():

        if all_songs():
            username = session.get("name")
            cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
            playlists = cur.fetchall()
            return render_template('stripped/browse.html', songs=allsong, check=1, playlist=playlists, name=username)
        else:
            return redirect("/")
        return redirect("/")

    else:
        return redirect("/")

@app.route('/html/playlist')
def selecter():
    if verify():

        playlist_id = request.args.get("p")
        if playlist_id:
            he = hehe(playlist_id)
            if he == True:
                name = playlist_name
                username = session.get("name")
                cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
                playlists = cur.fetchall()
                cur.execute("SELECT song_id FROM playlists_data WHERE playlist_id = ?", (playlist_id,))
                playlist_songs = cur.fetchall()
                playlist_song_ids = {row[0] for row in playlist_songs}  # Convert to a set of IDs for faster lookup

                # Fetch all songs that are NOT in the playlist
                query = "SELECT rowid, name, artist, url, image FROM songs WHERE rowid NOT IN ({seq})"
                seq = ','.join(['?'] * len(playlist_song_ids))  # Create a sequence of placeholders
                cur.execute(query.format(seq=seq), tuple(playlist_song_ids))
                not_in_playlist_songs = cur.fetchall()

                # Format the data into a list of dictionaries
                allsong = [
                    {
                        "id": row[0],
                        "name": row[1],
                        "artist": row[2],
                    }
                    for row in not_in_playlist_songs
                ]

                return render_template('stripped/play.html', name=username, song_name=name, playlist=playlists, check=0, songs=playlist, list=songs, all_songs=allsong, play_id=playlist_id)
            if he == "none":
                return redirect("/html/home?message=That+playlist+is+empty!+Add+some+songs!")
            else:
                return redirect("/html/home?message=Playlist+Not+Found!")
        return redirect("/html/home?message=Error!")
    else:
        return redirect("/")

@app.route('/html/home')
def htmlhome():
    if verify():
        username = session.get("name")
        message1 = request.args.get("message")
        if message1:
            message = message1
        else:
            message=""
        cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
        playlists = cur.fetchall()
        cur.execute("SELECT count(rowid) FROM songs")
        count = cur.fetchone()
        count = count[0]
        song1_id = random.randint(1, count)
        song2_id = random.randint(1, count)
        cur.execute("SELECT rowid FROM songs WHERE rowid=? OR rowid=?",  (song1_id, song2_id))
        playlist_songs = cur.fetchall()
        playlist_data = []
        for id in playlist_songs:
            cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
            playlist_data.append(cur.fetchone())
        reccomend = [
        {
            "id": row[0],
            "name": row[1],
            "artist": row[2],
            "url": row[3],
            "image": row[4]
        }
        for row in playlist_data
        ]
        return render_template('stripped/index.html', name=username, playlist=playlists, message=message, reccomend=reccomend)

