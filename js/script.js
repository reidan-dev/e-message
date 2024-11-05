const currentUrl = window.location.href;
const url = new URL(currentUrl);
const params = new URLSearchParams(url.search);
const idParam = params.get('id');

if (!idParam){
    const container = document.querySelector(".container")
    container.classList.add("hidden")
}

const eMessageApiUrl = "https://reidan-dev.vercel.app/api/google_sheets/eMessage/" + idParam
const fetchData = async () => {
    try {
        const response = await fetch(eMessageApiUrl); // Replace with your API URL
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json(); // Parse JSON response
        console.log(data); // Handle the data from the response
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error); // Handle errors
    }
};

fetchData(); // Call the async function

// Spotify Embedded
let isPlayed = false;
window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const embedElement = document.getElementById('embed-iframe');
    const spotifyOptions = {
        width: '75%',
        height: '100',
        uri: 'https://open.spotify.com/playlist/1f8AQhDqH5NU5UIq9Dj0RQ',
    };

    const setupSpotifyPlayer = (EmbedController) => {
        const playSpotify = () => {
            const player = document.getElementById("player");
            player.classList.remove('hidden');
            if (!isPlayed) {
                EmbedController.play();
                isPlayed = true;
            }
        };

        document.querySelector("#envelope").addEventListener('click', playSpotify);
        document.querySelector("#envelope").addEventListener('touchstart', playSpotify);
    };

    IFrameAPI.createController(embedElement, spotifyOptions, setupSpotifyPlayer);
};

// Timeline animations
const letter1 = document.querySelector('#letter-1');
const letter2 = document.querySelector('#letter-2');

const openEnvelopeTimeline = gsap.timeline({ paused: true });
openEnvelopeTimeline
    .to(".envelope-flap", { duration: 0.5, rotateX: 180 })
    .set(".envelope-flap", { zIndex: 10 })
    .to('#letter-1', {
        translateY: -300,
        duration: 0.9,
        ease: "back.inOut(1.5)",
        height: letter1.offsetHeight + 60
    })
    .set('#letter-1', { zIndex: 40 })
    .to('#letter-1', {
        duration: 0.7,
        ease: "back.out(0.4)",
        translateY: -5,
        translateZ: 250
    });

const shadowAnimationTimeline = gsap.timeline({ paused: true });
shadowAnimationTimeline.to('.shadow', {
    delay: 1.4,
    width: 450,
    boxShadow: "-75px 200px 10px 5px var(--drop-shadow)",
    ease: "back.out(0.2)",
    duration: 0.7
});

const openSecondLetterTimeline = gsap.timeline({ paused: true });
openSecondLetterTimeline
    .to('#letter-2', {
        translateY: -300,
        duration: 0.9,
        ease: "back.inOut(1.5)",
        height: letter2.offsetHeight + 55
    })
    .set('#letter-2', { zIndex: 40 })
    .to('#letter-2', {
        duration: 0.7,
        ease: "back.out(0.4)",
        translateY: -5,
        translateZ: 250,
        delay: 0.2
    });

// Card open and close functions
function openCard() {
    openEnvelopeTimeline.play();
    shadowAnimationTimeline.play();
}

function closeCard() {
    openEnvelopeTimeline.reverse();
    shadowAnimationTimeline.reverse();
    openSecondLetterTimeline.reverse();
}

function openLetter2() {
    openSecondLetterTimeline.play();
}
