const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 64;
const frequencyData = new Uint8Array(analyser.frequencyBinCount);

const bars = document.querySelectorAll(".bar");
const reels = document.querySelectorAll(".reel");
let audioSource;

const audio = new Audio();
audio.src = "https://radiosource.atacko.cc/radio.mp3"; 
audio.crossOrigin = "anonymous";
audio.loop = true;
audio.volume = 0.5;

// Create BiquadFilter nodes for bass and treble
const bassFilter = audioContext.createBiquadFilter();
bassFilter.type = "lowshelf";
bassFilter.frequency.value = 100;
bassFilter.gain.value = 0;

const trebleFilter = audioContext.createBiquadFilter();
trebleFilter.type = "highshelf";
trebleFilter.frequency.value = 5000;
trebleFilter.gain.value = 0;

audio.addEventListener("canplay", () => {
  if (!audioSource) {
    audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(bassFilter);
    bassFilter.connect(trebleFilter);
    trebleFilter.connect(analyser);
    analyser.connect(audioContext.destination);
  }
});

const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const powerButton = document.getElementById("power-button");

powerButton.addEventListener("click", () => {
  const stereoContainer = document.querySelector(".stereo-container");
  const volumeKnob = document.querySelector(".volume-knob");
  const stereoButtons = document.querySelectorAll(".stereo-button");
  const bassKnob = document.querySelector(".bass-knob");
  const trebleKnob = document.querySelector(".treble-knob");

  if (powerButton.src.includes("powerOFF.png")) {
    powerButton.src = "assets/img/powerON.png";

    document.querySelector(".reel-container").style.display = "flex";
    document.querySelectorAll(".bar").forEach((bar) => {
      bar.style.display = "block";
    });

    // Add 'powered-on' class
    stereoContainer.classList.add("powered-on");
    volumeKnob.classList.add("powered-on");
    bassKnob.classList.add("powered-on");
    trebleKnob.classList.add("powered-on");
    stereoButtons.forEach((button) => {
      button.classList.add("powered-on");
    });
  } else {
    powerButton.src = "assets/img/powerOFF.png";

    // Hide reel-container and bars
    document.querySelector(".reel-container").style.display = "none";
    document.querySelectorAll(".bar").forEach((bar) => {
      bar.style.display = "none";
    });

    // Remove 'powered-on' class
    stereoContainer.classList.remove("powered-on");
    volumeKnob.classList.remove("powered-on");
    bassKnob.classList.remove("powered-on");
    trebleKnob.classList.remove("powered-on");
    stereoButtons.forEach((button) => {
      button.classList.remove("powered-on");
    });
  }
});

playButton.addEventListener("click", async () => {
  try {
    // Ensure the AudioContext is resumed after a user gesture
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    
    await audio.play();

    reels.forEach((reel) => reel.classList.add("spin"));

    animateSpectrum();
  } catch (error) {
    console.error("Error playing audio:", error);
  }
});

pauseButton.addEventListener("click", () => {
  audio.pause();
  reels.forEach((reel) => reel.classList.remove("spin"));
});

function animateSpectrum() {
  analyser.getByteFrequencyData(frequencyData);

  const barCount = bars.length;
  const halfBarCount = Math.floor(barCount / 2);
  const frequencyStep = Math.floor(frequencyData.length / barCount);

  bars.forEach((bar, index) => {
    const freqIndex =
      index < halfBarCount
        ? index * frequencyStep
        : (barCount - 1 - index) * frequencyStep;

    const value = frequencyData[freqIndex];
    const scaledValue = Math.pow(value / 255, 0.7) * 80;
    const jitter = (Math.random() * 20 - 10) * (scaledValue / 100);
    const scaledHeight = Math.min(scaledValue + jitter, 100);

    bar.style.setProperty("--height", `${scaledHeight}%`);
  });

  requestAnimationFrame(animateSpectrum);
}

const volumeKnob = document.getElementById("volume-knob");
const bassKnob = document.getElementById("bass-knob");
const trebleKnob = document.getElementById("treble-knob");

let isDraggingVolume = false;
let isDraggingBass = false;
let isDraggingTreble = false;
let startYVolume = 0;
let startXVolume = 0; // Horizontal tracking for volume
let startYBass = 0;
let startXBass = 0; // Horizontal tracking for bass
let startYTreble = 0;
let startXTreble = 0; // Horizontal tracking for treble
let currentRotationVolume = 0;
let currentRotationBass = 0;
let currentRotationTreble = 0;

// calculate knob rotation
const calculateRotation = (start, end, currentRotation) => {
  const delta = start - end;
  return Math.min(Math.max(currentRotation + delta, -100), 100);
};

// handle scroll rotation
const handleScroll = (event, knob, setFunction, currentRotation) => {
  const scrollDelta = event.deltaY > 0 ? -5 : 5; // Scroll up or down
  currentRotation = Math.min(Math.max(currentRotation + scrollDelta, -100), 100);
  knob.style.transform = `rotate(${currentRotation}deg)`;
  setFunction(currentRotation);
  return currentRotation;
};

// Volume knob
volumeKnob.addEventListener("mousedown", (event) => {
  isDraggingVolume = true;
  startYVolume = event.clientY;
  startXVolume = event.clientX;
  volumeKnob.classList.add("active");
});

document.addEventListener("mousemove", (event) => {
  if (isDraggingVolume) {
    const deltaX = event.clientX - startXVolume; // Swiping right -> positive deltaX
    const deltaY = startYVolume - event.clientY; // Swiping up -> positive deltaY
    startYVolume = event.clientY;
    startXVolume = event.clientX;

    const delta = deltaX - deltaY; // Adjusted to match intuitive swiping
    currentRotationVolume = Math.min(Math.max(currentRotationVolume + delta, -100), 100);
    volumeKnob.style.transform = `rotate(${currentRotationVolume}deg)`;

    setVolume(currentRotationVolume);
  }
});

volumeKnob.addEventListener("wheel", (event) => {
  currentRotationVolume = handleScroll(event, volumeKnob, setVolume, currentRotationVolume);
});

document.addEventListener("mouseup", () => {
  isDraggingVolume = false;
  volumeKnob.classList.remove("active");
});

// Bass knob
bassKnob.addEventListener("mousedown", (event) => {
  isDraggingBass = true;
  startYBass = event.clientY;
  startXBass = event.clientX;
  bassKnob.classList.add("active");
});

document.addEventListener("mousemove", (event) => {
  if (isDraggingBass) {
    const deltaX = event.clientX - startXBass; // Swiping right -> positive deltaX
    const deltaY = startYBass - event.clientY; // Swiping up -> positive deltaY
    startYBass = event.clientY;
    startXBass = event.clientX;

    const delta = deltaX - deltaY; // Adjusted to match intuitive swiping
    currentRotationBass = Math.min(Math.max(currentRotationBass + delta, -100), 100);
    bassKnob.style.transform = `rotate(${currentRotationBass}deg)`;

    setBass(currentRotationBass);
  }
});

bassKnob.addEventListener("wheel", (event) => {
  currentRotationBass = handleScroll(event, bassKnob, setBass, currentRotationBass);
});

document.addEventListener("mouseup", () => {
  isDraggingBass = false;
  bassKnob.classList.remove("active");
});

// Treble knob
trebleKnob.addEventListener("mousedown", (event) => {
  isDraggingTreble = true;
  startYTreble = event.clientY;
  startXTreble = event.clientX;
  trebleKnob.classList.add("active");
});

document.addEventListener("mousemove", (event) => {
  if (isDraggingTreble) {
    const deltaX = event.clientX - startXTreble; // Swiping right -> positive deltaX
    const deltaY = startYTreble - event.clientY; // Swiping up -> positive deltaY
    startYTreble = event.clientY;
    startXTreble = event.clientX;

    const delta = deltaX - deltaY; // Adjusted to match intuitive swiping
    currentRotationTreble = Math.min(Math.max(currentRotationTreble + delta, -100), 100);
    trebleKnob.style.transform = `rotate(${currentRotationTreble}deg)`;

    setTreble(currentRotationTreble);
  }
});

trebleKnob.addEventListener("wheel", (event) => {
  currentRotationTreble = handleScroll(event, trebleKnob, setTreble, currentRotationTreble);
});

document.addEventListener("mouseup", () => {
  isDraggingTreble = false;
  trebleKnob.classList.remove("active");
});

function setVolume(value) {
  audio.volume = (value + 100) / 200;
}

function setBass(value) {
  bassFilter.gain.value = value / 10;
}

function setTreble(value) {
  trebleFilter.gain.value = value / 10;
}

const mp3Input = document.getElementById("mp3-source");
const updateSourceButton = document.getElementById("update-source");

updateSourceButton.addEventListener("click", () => {
  const newSource = mp3Input.value.trim();

  if (newSource) {
    audio.src = newSource; 
    audio.crossOrigin = "anonymous"; 
    audio.load(); 
    audio.play(); 

    // Resume reels animation if power is ON
    if (powerButton.src.includes("powerON.png")) {
      reels.forEach((reel) => reel.classList.add("spin"));
      animateSpectrum();
    }
  } else {
    alert("Please enter a valid MP3 URL.");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const themePopup = document.getElementById("theme-popup");
  const closePopupBtn = document.getElementById("close-popup");
  const themeButton = document.getElementById("theme-button"); // Ensure this is the button that triggers the popup

  if (themeButton) {
      themeButton.addEventListener("click", function () {
          themePopup.style.display = "block";
      });
  }

  if (closePopupBtn) {
      closePopupBtn.addEventListener("click", function () {
          themePopup.style.display = "none";
      });
  }

  // Close the popup when clicking outside of it
  window.addEventListener("click", function (event) {
      if (event.target === themePopup) {
          themePopup.style.display = "none";
      }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const themeButtons = document.querySelectorAll(".load-theme");
  const themeLink = document.getElementById("theme-style");
  const resetButton = document.getElementById("reset-theme");

  if (!themeLink) {
      console.error("Theme link element (#theme-style) not found.");
      return;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const themeButtons = document.querySelectorAll(".load-theme");
  const resetButton = document.getElementById("reset-theme");

  // Create a new <link> element for theme switching
  let themeLink = document.createElement("link");
  themeLink.rel = "stylesheet";
  themeLink.id = "theme-style";
  document.head.appendChild(themeLink);

  // Load a new theme when a button is clicked
  themeButtons.forEach(button => {
      button.addEventListener("click", (event) => {
          const themeFile = event.target.closest("li").dataset.css; // Get theme file
          if (themeFile) {
              console.log(`Applying theme: ${themeFile}`);
              themeLink.setAttribute("href", themeFile); // Change to new CSS file
              localStorage.setItem("selectedTheme", themeFile); // Save theme
          } else {
              console.error("No theme file found in dataset.");
          }
      });
  });

  // Reset to default theme
  if (resetButton) {
      resetButton.addEventListener("click", () => {
          console.log("Resetting to default theme.");
          themeLink.setAttribute("href", ""); // Remove theme override
          localStorage.removeItem("selectedTheme"); // Remove saved theme
      });
  } else {
      console.error("Reset button (#reset-theme) not found.");
  }

  // Load the saved theme on page load
  const savedTheme = localStorage.getItem("selectedTheme");
  if (savedTheme) {
      console.log(`Loading saved theme: ${savedTheme}`);
      themeLink.setAttribute("href", savedTheme);
  }
});

//css import

// Handle CSS import
document.getElementById("import-css").addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".css";

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".css")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const cssContent = e.target.result;

        // Remove existing custom style if any
        let customStyleTag = document.getElementById("custom-css");
        if (customStyleTag) {
          customStyleTag.remove();
        }

        // Apply the new CSS
        customStyleTag = document.createElement("style");
        customStyleTag.id = "custom-css";
        customStyleTag.innerHTML = cssContent;
        document.head.appendChild(customStyleTag);

        // Save the uploaded CSS in localStorage
        localStorage.setItem("customCSS", cssContent);

        // Deactivate current theme
        disableTheme();
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid .css file.");
    }
  });

  fileInput.click();
});

// Load saved custom CSS on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedCSS = localStorage.getItem("customCSS");
  if (savedCSS) {
    applyCustomCSS(savedCSS);
  }

  // Load saved theme if available
  const savedTheme = localStorage.getItem("selectedTheme");
  if (savedTheme) {
    applyTheme(savedTheme);
  }
});

// Apply custom CSS function
function applyCustomCSS(cssContent) {
  let styleTag = document.getElementById("custom-css");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "custom-css";
    document.head.appendChild(styleTag);
  }
  styleTag.innerHTML = cssContent;
}

// Disable theme styles when custom CSS is applied
function disableTheme() {
  const themeLink = document.getElementById("theme-style");
  if (themeLink) {
    themeLink.setAttribute("href", "");
    localStorage.removeItem("selectedTheme");
  }
}

// Apply predefined theme
function applyTheme(themeFile) {
  let themeLink = document.getElementById("theme-style");
  if (!themeLink) {
    themeLink = document.createElement("link");
    themeLink.rel = "stylesheet";
    themeLink.id = "theme-style";
    document.head.appendChild(themeLink);
  }
  themeLink.setAttribute("href", themeFile);
  localStorage.setItem("selectedTheme", themeFile);

  // Remove custom CSS temporarily
  const customStyleTag = document.getElementById("custom-css");
  if (customStyleTag) {
    customStyleTag.remove();
  }
}

// Handle theme switching
document.querySelectorAll(".load-theme").forEach((button) => {
  button.addEventListener("click", (event) => {
    const themeFile = event.target.closest("li").dataset.css;
    if (themeFile) {
      applyTheme(themeFile);
    }
  });
});

// Handle reset theme
document.getElementById("reset-theme").addEventListener("click", () => {
  // Remove both theme and custom CSS
  disableTheme();

  const customStyleTag = document.getElementById("custom-css");
  if (customStyleTag) {
    customStyleTag.remove();
  }
  localStorage.removeItem("customCSS");
});

// Handle CSS Download
document.getElementById("download-css").addEventListener("click", () => {
  window.open("https://github.com/Atacko/Radio-Taco/blob/main/app/custom.css", "_blank");
});