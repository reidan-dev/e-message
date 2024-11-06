const currentUrl = window.location.href;
const url = new URL(currentUrl);
const params = new URLSearchParams(url.search);
const idParam = params.get('id');

let hidingPage = document.querySelector(".hiding-page");

if (idParam) {
    hidingPage.classList.toggle('hidden', true); // Forces add
}

const eMessageApiUrl = "https://reidan-dev.vercel.app/api/google_sheets/eMessage/" + idParam;

const fetchData = async () => {
    try {
        const response = await fetch(eMessageApiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};

async function processData() {
    const data = await fetchData();
    if (!data || "ERROR" in data) {
        hidingPage.classList.remove("hidden");
        return;
    }

    // Set up dynamic values from API response
    let {
        nick_name: nickName,
        color_bg: colorBG,
        color_envelope: colorEnvelope,
        color_letter: colorLetter,
        color_message: colorMessage,
        message_front: messageFront,
        message_main: messageMain,
        sender,
        closing_remarks: closingRemarks,
        bg_chars: bgChars = "",
        bg_mode: bgMode = "falling",
        uri
    } = data;

    let adjustedColors = adjustColor(colorEnvelope);
    document.documentElement.style.setProperty('--envelope-base', colorEnvelope);
    document.documentElement.style.setProperty('--letter', colorLetter);
    document.documentElement.style.setProperty('--background', colorBG);
    document.documentElement.style.setProperty('--letter-font', colorMessage);
    document.documentElement.style.setProperty('--envelope-highlight', adjustedColors.lighter);
    document.documentElement.style.setProperty('--envelope-mid', adjustedColors.darker);
    document.documentElement.style.setProperty('--envelope-shadow', adjustedColors.muchDarker);

    document.title = `e-Message for ${nickName}`;

    document.querySelector(".message-front").innerHTML = `<br/><br/> To <b>${nickName}</b>, <br/><br/>${messageFront}<br/>`;
    document.querySelector(".message-main").innerHTML = `<br/>${messageMain}<br/><br/>${closingRemarks} <br/><b>- ${sender}</b>`;

    // // Spotify iframe initialization
    // window.onSpotifyIframeApiReady = (IFrameAPI) => {
    //     const embedElement = document.getElementById('embed-iframe');
    //     const spotifyOptions = {
    //         width: '75%',
    //         height: '100',
    //         uri: 'https://open.spotify.com/playlist/' + uri,
    //     };

    //     // Function to create Spotify player and set up playback controls
    //     const createSpotifyPlayer = () => {
    //         IFrameAPI.createController(embedElement, spotifyOptions, (EmbedController) => {
    //             const triggerPlay = () => {
    //                 EmbedController.play(); // Trigger playback
    //                 playOnClickOrTouch(bgMode, bgChars); // Any additional playback actions
    //             };

    //             // Add event listeners for 'click' and 'touchstart' to play the track
    //             const containerElement = document.getElementById("container");
    //             containerElement.addEventListener('touchstart', triggerPlay, { once: true });
    //             containerElement.addEventListener('click', triggerPlay, { once: true });
    //         });
    //     };

    //     createSpotifyPlayer();
    // };
    // Check if the device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const containerElement = document.getElementById("container");

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
        const embedElement = document.getElementById('embed-iframe');
        const spotifyOptions = {
            width: '75%',
            height: '100',
            uri: 'https://open.spotify.com/playlist/' + uri,
        };

        // Show play button if on mobile
        if (isMobile) {
            const playOverlay = document.createElement('div');
            playOverlay.innerText = 'Tap to play 🎶';
            playOverlay.classList.add('play-overlay');
            containerElement.appendChild(playOverlay);

            playOverlay.addEventListener('click', () => {
                // Initialize the Spotify player on click
                IFrameAPI.createController(embedElement, spotifyOptions, (EmbedController) => {
                    EmbedController.play();
                    playOnClickOrTouch(bgMode, bgChars);
                });
                playOverlay.remove(); // Remove overlay after play
            });
        } else {
            // Default behavior for desktop
            IFrameAPI.createController(embedElement, spotifyOptions, (EmbedController) => {
                const triggerPlay = () => {
                    EmbedController.play(); // Trigger playback
                    playOnClickOrTouch(bgMode, bgChars);
                };
                containerElement.addEventListener('touchstart', triggerPlay, { once: true });
                containerElement.addEventListener('click', triggerPlay, { once: true });
            });
        }
    };

}

processData();

function playOnClickOrTouch(bgMode, bgChars) {
    const others = document.getElementById("others");
    others.classList.remove('hidden');
    playAnimation(bgMode, bgChars);
}

// Timeline animations
const letter1 = document.querySelector('#letter-1');
const letter2 = document.querySelector('#letter-2');

const openEnvelopeTimeline = gsap.timeline({ paused: true });
openEnvelopeTimeline
    .to(".envelope-flap", { duration: 0.2, rotateX: 180 })
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
    delay: 1.1,
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
        ease: "back.inOut(1.2)",
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

// Background Animation
// Configurations
const CHARACTERS = ["💌💖💫❤️✨🌸"]; // Customize with any emojis, strings, or letters
const characterCount = 20; // Number of animated characters
const animationModes = {
    falling: animateFalling,
    rising: animateRising,
    random: animateRandom,
    diagonal: animateDiagonal,
    spiral: animateSpiral,
    bounce: animateBounce,
    wave: animateWave,
    orbit: animateOrbit,
    flash: animateFlash,
    zoom: animateZoom,
    spin: animateSpin
};


function playAnimation(mode, chars) {
    document.querySelector('.animated-background').innerHTML = '';
    chars = chars.split(",") || [""];
    if (chars){
        for (let i = 0; i < characterCount; i++) {
            const char = document.createElement('div');
            char.classList.add('animated-character');
            char.innerText = chars[Math.floor(Math.random() * chars.length)];
            document.querySelector('.animated-background').appendChild(char);

            // Look up and execute the animation function based on the mode
            const animationFunction = animationModes[mode];
            if (animationFunction) {
                animationFunction(char); // Execute the mode's animation function
            } else {
                console.warn(`Unknown mode: ${mode}`);
                animateFalling(char);
            }
        }
    }
}


// Animation Modes
function animateFalling(char) {
    gsap.set(char, {
        x: Math.random() * window.innerWidth,
        y: -50,
        opacity: Math.random() + 0.5,
    });
    gsap.to(char, {
        y: window.outerHeight + 50,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        ease: 'none',
        delay: Math.random() * 2,
    });
}

function animateRising(char) {
    gsap.set(char, {
        x: Math.random() * window.outerWidth,
        y: window.outerHeight + 50,
        opacity: Math.random() + 0.5,
    });
    gsap.to(char, {
        y: -50,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        ease: 'none',
        delay: Math.random() * 2,
    });
}

function animateRandom(char) {
    gsap.set(char, {
        x: Math.random() * window.outerWidth,
        y: Math.random() * window.outerHeight,
        opacity: Math.random() + 0.5,
    });
    gsap.to(char, {
        x: 'random(0, ' + window.outerWidth + ')',
        y: 'random(0, ' + window.outerHeight + ')',
        duration: Math.random() * 3 + 2,
        repeat: -1,
        ease: 'power1.inOut',
        delay: Math.random() * 2,
    });
}

function animateDiagonal(char) {
    gsap.set(char, {
        x: -50,
        y: Math.random() * window.outerHeight,
        opacity: Math.random() + 0.5,
    });
    gsap.to(char, {
        x: window.outerWidth + 50,
        y: 'random(0, ' + window.outerHeight + ')',
        duration: Math.random() * 4 + 3,
        repeat: -1,
        ease: 'none',
        delay: Math.random() * 2,
    });
}

function animateSpin(char) {
    gsap.set(char, {
        x: Math.random() * window.outerWidth,
        y: Math.random() * window.outerHeight,
        rotation: Math.random() * 360,
        opacity: Math.random() + 0.5,
    });
    gsap.to(char, {
        rotation: '+=360',
        duration: Math.random() * 2 + 1,
        repeat: -1,
        ease: 'none',
    });
}

function animateZoom(char) {
    gsap.set(char, {
        x: Math.random() * window.outerWidth,
        y: Math.random() * window.outerHeight,
        scale: 0.1,
        opacity: Math.random() + 0.5,
    });
    gsap.to(char, {
        scale: Math.random() * 1.5 + 0.5,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: Math.random() * 1,
    });
}

function animateFlash(char) {
    gsap.set(char, {
        x: Math.random() * window.outerWidth,
        y: Math.random() * window.outerHeight,
        opacity: 0,
    });
    gsap.to(char, {
        opacity: Math.random(),
        duration: Math.random() * 0.5 + 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: Math.random() * 1,
    });
}

function animateOrbit(char) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.random() * 150 + 150; // Random orbit radius
    const angle = Math.random() * 360; // Starting angle
    gsap.set(char, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        opacity: Math.random() + 0.5,
    });
    gsap.to(char, {
        rotation: 360,
        duration: Math.random() * 3 + 2,
        modifiers: {
            x: gsap.utils.unitize(() => centerX + Math.cos(angle) * radius),
            y: gsap.utils.unitize(() => centerY + Math.sin(angle) * radius),
        },
        repeat: -1,
        ease: 'linear',
    });
}

function animateWave(char) {
    const startY = Math.random() * window.innerHeight;
    gsap.set(char, {
        x: -50,
        y: startY,
        opacity: Math.random() + 0.5,
    });
    gsap.to(char, {
        x: window.innerWidth + 50,
        y: startY + Math.sin(Math.random() * 360) * 50,
        duration: Math.random() * 4 + 3,
        repeat: -1,
        ease: 'sine.inOut',
        delay: Math.random() * 1,
    });
}

function animateBounce(char) {
    gsap.set(char, {
        x: Math.random() * window.outerWidth,
        y: Math.random() * (window.outerHeight - 50) + 50,
        opacity: Math.random() + 0.5,
    });
    gsap.to(char, {
        y: '+=100',
        yoyo: true,
        repeat: -1,
        duration: Math.random() * 1.5 + 1,
        ease: 'bounce.inOut',
    });
}

function animateSpiral(char) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const angle = Math.random() * 360;
    gsap.set(char, {
        x: centerX,
        y: centerY,
        opacity: Math.random() + 0.5,
    });
    gsap.to(char, {
        x: `+=${Math.cos(angle) * 500}`,
        y: `+=${Math.sin(angle) * 500}`,
        rotation: 360,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        ease: 'power1.inOut',
        delay: Math.random() * 2,
    });
}
