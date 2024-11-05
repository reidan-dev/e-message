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

        // CHANGE VALUES HERE
        nickName = data["nick_name"]
        colorBG = data["color_bg"]
        colorEnvelope = data["color_envelope"]
        colorLetter = data["color_letter"]
        colorMessage = data["color_message"]
        messageFront = data["message_front"]
        messageMain = data["message_main"]
        sender = data["sender"]
        closingRemarks = data["closing_remarks"]
        uri = data["uri"]

        let adjustedColors = adjustColor(colorEnvelope)
        console.log(adjustedColors.lighter)
        console.log(colorEnvelope)
        document.documentElement.style.setProperty('--envelope-base', colorEnvelope);
        document.documentElement.style.setProperty('--letter', colorLetter);
        document.documentElement.style.setProperty('--background', colorBG);
        document.documentElement.style.setProperty('--letter-font', colorMessage);
        document.documentElement.style.setProperty('--envelope-highlight', adjustedColors.lighter);
        document.documentElement.style.setProperty('--envelope-mid', adjustedColors.darker);
        document.documentElement.style.setProperty('--envelope-shadow', adjustedColors.muchDarker);
        
        document.title = document.title.replace("%NAME%", nickName)

        let message_front_element = document.querySelector(".message-front")
        let message_main_element = document.querySelector(".message-main")
        message_front_element.innerHTML = `<br/><br/> To <b>${nickName}</b>, <br/><br/>${messageFront}<br/>`
        message_main_element.innerHTML = `<br/>${messageMain}<br/><br/>${closingRemarks} <br/><b>- ${sender}</b>`

        // Spotify Embedded
        let isPlayed = false;
        window.onSpotifyIframeApiReady = (IFrameAPI) => {
            const embedElement = document.getElementById('embed-iframe');
            const spotifyOptions = {
                width: '75%',
                height: '100',
                uri: 'https://open.spotify.com/playlist/' + uri,
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

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error); // Handle errors
    }
};

fetchData(); // Call the async function



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
        translateY: -350,
        duration: 0.9,
        ease: "back.inOut(1.5)",
        height: letter2.offsetHeight + 55,
        rotateZ: 22
    })
    .set('#letter-2', { zIndex: 50 })
    .to('#letter-2', {
        duration: 0.7,
        ease: "back.out(0.4)",
        translateY: -5,
        translateZ: 250,
        delay: 0.2,
        rotateZ: -2
        
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

function adjustColor(hex, lightnessFactor = 0.2, darknessFactor = 0.2) {
    // Convert hex to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    // Function to convert RGB back to Hex
    const rgbToHex = (r, g, b) => {
        const toHex = (c) => {
            const hex = c.toString(16).padStart(2, '0');
            return hex.length === 2 ? hex : '00';
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    // Calculate lighter color
    const lighterColor = rgbToHex(
        Math.min(255, Math.round(r + (255 - r) * lightnessFactor)),
        Math.min(255, Math.round(g + (255 - g) * lightnessFactor)),
        Math.min(255, Math.round(b + (255 - b) * lightnessFactor))
    );

    // Calculate darker color (slightly darker)
    const darkerColor = rgbToHex(
        Math.max(0, Math.round(r - r * darknessFactor)),
        Math.max(0, Math.round(g - g * darknessFactor)),
        Math.max(0, Math.round(b - b * darknessFactor))
    );

    // Calculate much darker color
    const muchDarkerColor = rgbToHex(
        Math.max(0, Math.round(r - r * (darknessFactor * 3))),
        Math.max(0, Math.round(g - g * (darknessFactor * 3))),
        Math.max(0, Math.round(b - b * (darknessFactor * 3)))
    );

    return {
        lighter: lighterColor,
        darker: darkerColor,
        muchDarker: muchDarkerColor,
    };
}