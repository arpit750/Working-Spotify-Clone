let currentSong = new Audio()
let songs
let currFolder

function SecondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    // Calculate minutes
    const minutes = Math.floor(seconds / 60);
    // Calculate remaining seconds
    const remainingSeconds = Math.floor(seconds % 60);

    // Pad with leading zeros if necessary
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    // Return formatted time
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Song Artist</div>
            </div>
            <div class="playnow flex items-center">
                <span>Play now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
            </li>`
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
            play.src = "img/pause.svg"
        })
    })
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    let cardContainer = document.querySelector(".cardContainer")
    div.innerHTML = response
    // console.log(div);
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = (e.href.split("/").slice(-2)[0])
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" height="48px" width="48px" viewBox="0 0 48 48">
                                <circle cx="24" cy="24" r="20" fill="green" />
                                <path d="M19 16l14 8-14 8V16Z" fill="black" transform="translate(0, 0)" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    // adding an event listener to load songs from folder
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(item,item.currentTarget.dataset.folder)
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            play.src = "img/pause.svg"
        })
    })
}

async function main() {
    // get the list of all the songs
    await getSongs("songs/bleach")
    playMusic(songs[0], true)

    // display all the albums
    displayAlbums()

    // attach an event listener to play, next and previous buttons
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // attaching event listener to update time

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${SecondsToMinutesSeconds(currentSong.currentTime)} / ${SecondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
        if (currentSong.currentTime == currentSong.duration) {
            play.src = "img/play.svg"
        }
    })

    // adding event listener to seekbar to seek
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = currentSong.duration * percent / 100
    })

    // adding event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"
    })

    // adding event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // adding event listener to previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) > 1) {
            playMusic(songs[index - 1], true)
            play.src = "img/play.svg"
            document.querySelector(".circle").style.left = "0%"
        }
    })

    // adding event listener to next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1], true)
            play.src = "img/play.svg"
            document.querySelector(".circle").style.left = "0%"
        }
    })

    // adding an event to volume 
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // adding an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        // console.log(e.target.src)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg")
            currentSong.volume = 0
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg")
            currentSong.volume = 0.2
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 20
        }
    })
}

main()