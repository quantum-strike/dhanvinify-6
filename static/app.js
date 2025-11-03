// DON'T USE
const player = document.getElementById('player');
const albumArt = document.getElementById('album-art-bottom');
const songName = document.getElementById('song-name-bottom');
const albumArt1 = document.getElementById('album-art');
const songName1 = document.getElementById('song-name');
const songArtist = document.getElementById('song-artist');
const playPauseButton = document.getElementById('play-pause-button');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const shuffleButton = document.getElementById('shuffle-button');
const duration_text = document.getElementById('duration');
const loopButton = document.getElementById('loop-button');
let show = false
const seekBar = document.getElementById('seek-bar');
let isShuffle = false
let isLoop=false

let playlist = [];
let currentSongIndex = 0;
let playlistEnded = false;
let play_id = 0
check = 0
window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    if (check == false) {
        window.location.replace("/");

    }
  };
window.onload = window.mobileCheck;
function show_modal() {
    const modal = document.getElementById('myModal');
    const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
    modalInstance.show();
}
let newstatus = localStorage.getItem("new_status")
if (newstatus != 'true') {
    localStorage.removeItem("new_status")
    localStorage.setItem("new_status", "true")
    show_modal()
}
function clear() {
    localStorage.clear()
}

function searchAuto(){
    let input = document.getElementById('searchInput');
    let lang = document.getElementById('lang');
    let resultsList = document.getElementById('searchResults');
    input.addEventListener('keyup', function(event) {
        let html = '';
        if (input.value) {
            fetch(`/search_api?search=${input.value}&lang=${lang.value}`)
                .then(response => response.json())
                .then(data => {
                    list = data;
                    console.log(list)
                    for (const song of list) {
                        let name = song.name;
                        artist = song.artist
                        id = song.id
                        html += `
                        <li class="list-group-item d-flex justify-content-between align-items-start greyish-back text-white">
                            <div class="ms-2 me-auto">
                              <div class="fw-bold"><button onclick="startSong(${id})" style="background-color: transparent; color: white; border-style: none;">${name}</button></div>
                              ${artist}
                            </div>
                            <span class="badge text-bg-primary rounded-pill" ><button style="color: white; background-color: transparent; border-style:none;" onclick="startSong('${id}')"><i class="fa-solid fa-play"></i></button></span>
                         </li>
                        `;
                    }
                    resultsList.innerHTML = html;
                });
        } else {
            resultsList.innerHTML = `
                        <li class="list-group-item d-flex justify-content-between align-items-start greyish-back text-white">
                            <div class="ms-2 me-auto">
                              <div class="fw-bold">Type to Search</div>
                              Start typing to search DhanTune
                            </div>
                         </li>
                        `;
        }
    });


}
function openURL(url){

    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById('main').innerHTML = html;
            if (url == '/html/search') {
                searchAuto()
            }
            if (url == '/html/mobile/search') {
                searchAuto()
            }
        })
        .catch(error => console.error('Error fetching HTML:', error));
;
}

function setStatus(){
    check = document.querySelector('body').getAttribute('check')
}
// Fetch playlist data


//     <tr>
//     <td><a class="btn btn-outline-secondary btn-sm" role="button" aria-disabled="true" href="/play?p={{song['id']}}"><i class="fa-solid fa-circle-play"></i></a></td>
//     <td>{{song['name']}}</td>
//     <td>{{song['artist']}}</td>
//     <td>
//   </tr>

function calculateTotalDuration(playlist) {
    // Sum the duration of all songs in the playlist
    const totalSeconds = playlist.reduce((total, song) => total + song.duration, 0);

    // Convert total seconds to hours, minutes, and seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Construct the duration string
    let totalduration;
    if (hours === 0) {
        totalduration = `about ${minutes} min`;
    } else {
        totalduration = `about ${hours} hours and ${minutes} min`;
    }

    return totalduration;
}
function displayQueue() {
    const container = document.getElementById("queue");
    // Clear previous content
    container.innerHTML = '';

    for (const song of playlist) {
        // Create table row element
        const que = document.createElement("tr");

        // Create table cell element for the song title
        const title = document.createElement("td");
        title.innerHTML = `<button onclick="startSong(${song.id})" style="background-color: transparent; color: white; border-style: none;">${song.name}</button>`;

        // Create table cell element for the artist name
        const artist = document.createElement("td");
        artist.innerHTML = `${song.artist}`;

        // // Create table cell element with a link to play the song
        // const listen = document.createElement("td");
        // const playLink = document.createElement("a");
        // playLink.className = "btn btn-outline-secondary btn-sm";
        // playLink.setAttribute("role", "button");
        // playLink.setAttribute("aria-disabled", "true");
        // playLink.href = `/play?p=${encodeURIComponent(song.id)}`;
        // playLink.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
        // listen.appendChild(playLink);

        // // Append the cells to the row
        // que.appendChild(listen);
        que.appendChild(title);
        que.appendChild(artist);


        // Append the row to the container
        container.appendChild(que);
    }
}

function loadCurrentSong() {
    if (playlist.length === 0) return;

    const song = playlist[currentSongIndex];
    albumArt.src = song.image;
    songName.textContent = song.name;
    albumArt1.src = song.image;
    songName1.textContent = song.name;
    songArtist.textContent = song.artist;
    player.src = song.url;
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.artist,
            album: 'DhanTune',
            artwork: [
                { src: song.image, sizes: '96x96', type: 'image/jpeg' }
            ]
        });
    }
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    console.log(playlist);
  }

function playSong() {
    player.play();
    playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseSong() {
    player.pause();
    playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
}

function playPause() {
    if (player.paused) {
        playSong();
    } else {
        pauseSong();
    }
}
function shuffleToggle() {
    if (isShuffle === false) {
        isShuffle = true
        shuffleArray(playlist)
        loadCurrentSong();
        setTimeout(() => {
            playPause()
            console.log("starting song")
        }, 10);


        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        shuffleButton.style.color = "green";
    } else {
        isShuffle = false
        playPlaylist(play_id)
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        shuffleButton.style.color = "#007bff";
    }
}
function loopToggle() {
    if (isLoop === false) {
        isLoop = true
        loopButton.style.color = "green";
    } else {
        isLoop = false
        loopButton.style.color = "#007bff";
    }
}

function nextSong() {
    if (check == 0){

    if (playlist.length === 0) return;

    currentSongIndex = (currentSongIndex + 1) % playlist.length;

    if (currentSongIndex === 0) {
        // End of playlist reached
        playlistEnded = true;
    } else {
        playlistEnded = false;
    }

    loadCurrentSong();
    playSong();
} else{
    albumArt.src = icon.png;
    songName.textContent = 'Nothing Playing';
    pauseSong();
}
}

function prevSong() {
    if (playlist.length === 0) return;

    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    playlistEnded = false; // Reset flag as we are navigating within the playlist
    loadCurrentSong();
    playSong();
}

// Update seek bar as the song plays
player.addEventListener('timeupdate', () => {
    const percent = (player.currentTime / player.duration) * 100;
    seekBar.value = percent;
});

// Change song position when seek bar is adjusted
seekBar.addEventListener('input', () => {
    const newTime = (seekBar.value / 100) * player.duration;
    player.currentTime = newTime;
});

player.addEventListener('ended', () => {
    if (playlistEnded) {
        // Do nothing if playlist has ended
        if(isLoop == false){
            pauseSong();
        } else{
            setTimeout(nextSong, 100);
        }
    } else {
        // Schedule the next song after a short delay to ensure the flag update
        setTimeout(nextSong, 100);
    }
});

playPauseButton.addEventListener('click', playPause);
nextButton.addEventListener('click', nextSong);
prevButton.addEventListener('click', prevSong);
shuffleButton.addEventListener('click', shuffleToggle);
// loopButton.addEventListener('click', loopToggle);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        if (player.paused) {
            playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        }
        if(!player.paused) {
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';

        }
    }
});

if (check == 0 || 1) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
            // Handle play action
            player.play();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            // Handle pause action
            player.pause();
        });
        if (check == 0){
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            // Handle previous track action
            prevSong();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            // Handle next track action
            nextSong();
        });
        }
    }
    setInterval(() => {
        if (player.paused) {
            playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }, 200);

}





function myFunction() {
    var x = document.getElementById("object1");
    var y = document.getElementById("object2");
    if (show == false) {
      x.className = x.className.replace(" hide1", " show1");
      y.className = y.className.replace(" hide1", " show2");

      show = true
    } else {
        x.className = x.className.replace(" show1", " hide1");
        y.className = y.className.replace(" show2", " hide1");

      show = false
    }
  }

function playPlaylist(id) {
    check = 0
    play_id = id
    fetch(`/playlist_data?id=${id}`)
    .then(response => response.json())
    .then(data => {
        playlist = data;


        if (isShuffle === true) {
            shuffleArray(playlist)

        }
        loadCurrentSong();
        setTimeout(() => {
            playPause()
            console.log("starting song")
        }, 10);

    });
}

function startSong(id) {
    check = 1
    isShuffle = false

    playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    shuffleButton.style.color = "#007bff";
    fetch(`/song_data?id=${id}`)
    .then(response => response.json())
    .then(data => {
        playlist = data;
        loadCurrentSong();
        setTimeout(() => {
            playPause()
            console.log("starting song")
        }, 1000);

    });
}

function add_deleteSong(song, list, reload) {

    const encodedSong = encodeURIComponent(song);
    const encodedList = encodeURIComponent(list);

    fetch(`/add?song=${encodedSong}&list=${encodedList}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // Use text() for string responses
        })
        .then(data => {
            console.log(data); // Log the raw string
            if (data.trim() === 'true' || data.trim() === 'false') {
                if (reload) {
                    openURL(`/html/playlist?p=${encodedList}`);
                }
            }
            if (data.trim() === 'true') {
                show_notify('Song added', 5000)
            }
            if (data.trim() === 'false') {
                show_notify('Song removed', 5000)
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

}

function show_notify(message, time){

    const notify = document.getElementById('notify')
    notify.style.backgroundImage = 'linear-gradient(#E91E63, #6A3CE8)'

    notify.style.display = 'block'
    notify.innerText = message
    setTimeout(() => {
        notify.innerText = ""
        notify.style.display = 'none'
    }, time);
}


function tooltip(message){
    const notify = document.getElementById('notify')
    notify.style.backgroundImage = 'linear-gradient(#69B9EF, #6A3CE8)'
    // notify.style.backgroundColor = 'black'

    notify.style.display = 'block'
    notify.innerText = message
}

function playlist_tooltip(message){
    const notify = document.getElementById('notify')
    notify.style.backgroundImage = 'linear-gradient(#0A2C4D, #20A8CD)'
    notify.style.display = 'block'
    notify.innerText = message
}

function tooltipClose() {
    const notify = document.getElementById('notify')
        notify.innerText = ""
        notify.style.display = 'none'

}

{/* <div class="w3-bar" style="height: 70px; background-color:#000; position: fixed">
<button onclick="openURL('/')" class="w3-bar-item w3-hover-none w3-button w3-text-white w3-hover-text-white" style="margin-left: 25px;margin-right: 25px;"><img src="/static/icon-512.png" alt="" id="icon"></button>
<button onmouseenter="tooltip('Action: Home')" onmouseleave="tooltipClose()" onclick="openURL('/html/home')" class="w3-bar-item w3-button w3-hover-none w3-text-white w3-hover-text-white"> <i class="fa fa-home"></i></button>
<button onmouseenter="tooltip('Action: Report')" onmouseleave="tooltipClose()" onclick="openURL('/html/report')" class="w3-bar-item w3-button w3-hover-none w3-text-white w3-hover-text-white"><i class="material-icons">contact_support</i></button>
<button onmouseenter="tooltip('Action: Request')" onmouseleave="tooltipClose()" onclick="openURL('/html/request')" class="w3-bar-item w3-button w3-hover-none w3-text-white w3-hover-text-white"><i class="material-icons">forum</i></button>

<!-- <div id="Demo" class="">
<span id="object2" class=" hide">{{name}}</span>
<div class=" hide" id="object1">
    <a href="/logout" class="w3-bar-item w3-button w3-hover-none w3-text-white w3-hover-text-white" ><i class="fa-solid fa-right-from-bracket"></i></a>

</div>
</div> -->
<a href=""></a>
<button onclick="myFunction()" class="w3-button w3-hover-none w3-button w3-text-white w3-hover-text-white user"><i class="material-icons">person</i>            </button>
</div> */}


function addQueue(song_id) {
    fetch(`/song_data?id=${song_id}`)
    .then(response => response.json())
    .then(data => {
        playlist.push(data[0])
        check = 0
        tooltip("Added to Queue")
        setTimeout(() => {
            tooltipClose()
        }, 2000);

    });

}

function findSongIndex(id_Song) {
    return playlist.findIndex(song => song.id == id_Song);
}

function playfromPLaylist(playlist_id, song_id) {

    check = 0
    fetch(`/playlist_data?id=${playlist_id}`)
    .then(response => response.json())
    .then(data => {
        playlist = data;
        if (isShuffle === true) {
            shuffleArray(playlist)

        }
        let index = findSongIndex(song_id)
        currentSongIndex = index
        loadCurrentSong();
        setTimeout(() => {
            playPause()
            console.log("starting song")
        }, 10);

    });


}