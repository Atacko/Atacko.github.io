document.addEventListener("DOMContentLoaded", () => {
    const audio = new Audio()
    audio.src = "https://radiosource.atacko.cc/radio.mp3"
    audio.crossOrigin = "anonymous"
    audio.loop = true
    audio.volume = 0.5
  
    const playButton = document.getElementById("play-button")
    const stopButton = document.getElementById("stop-button")
    const pauseButton = document.getElementById("pause-button")
    const prevButton = document.getElementById("prev-button")
    const nextButton = document.getElementById("next-button")
    const volumeButton = document.getElementById("volume-button")
    const volumeSliderContainer = document.getElementById("volume-slider-container")
    const volumeSliderThumb = document.getElementById("volume-slider-thumb")
    const volumeDisplay = document.getElementById("volume-display")
    const timeDisplay = document.getElementById("time-display")
    const radioPlayer = document.querySelector(".radio-player")
  
    const closeButton = document.querySelector(".window-button.close")
    const minimizeButton = document.querySelector(".window-button.minimize")
    const maximizeButton = document.querySelector(".window-button.maximize")
  
    let isPlaying = false
    let isPaused = false
    let currentTime = 0
    let timer
    let isDraggingVolume = false
  
    function updateVolumeDisplay() {
      const volumePercent = Math.round(audio.volume * 100)
      volumeDisplay.textContent = `${volumePercent}%`
  
      const sliderTrackWidth = volumeSliderContainer.querySelector(".volume-slider-track").offsetWidth
      const thumbPosition = audio.volume * (sliderTrackWidth - volumeSliderThumb.offsetWidth)
      volumeSliderThumb.style.left = `${thumbPosition}px`
    }
  
    function updateTimeDisplay() {
      if (isPlaying && !isPaused) {
        currentTime++
        const minutes = Math.floor(currentTime / 60)
        const seconds = currentTime % 60
        timeDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
      }
    }
  
    function startTimer() {
      timer = setInterval(updateTimeDisplay, 1000)
    }
  
    function stopTimer() {
      clearInterval(timer)
    }
  
    function resetTimer() {
      currentTime = 0
      timeDisplay.textContent = "0:00"
    }
  
    function updatePlayerStatus() {
      radioPlayer.classList.remove("playing", "paused", "stopped")
  
      if (isPlaying) {
        if (isPaused) {
          radioPlayer.classList.add("paused")
        } else {
          radioPlayer.classList.add("playing")
        }
      } else {
        radioPlayer.classList.add("stopped")
      }
    }
  
    playButton.addEventListener("click", () => {
      if (!isPlaying || isPaused) {
        audio.play()
        isPlaying = true
        isPaused = false
        startTimer()
        updatePlayerStatus()
      }
    })
  
    stopButton.addEventListener("click", () => {
      audio.pause()
      audio.currentTime = 0
      isPlaying = false
      isPaused = false
      stopTimer()
      resetTimer()
      updatePlayerStatus()
    })
  
    pauseButton.addEventListener("click", () => {
      if (isPlaying && !isPaused) {
        audio.pause()
        isPaused = true
        stopTimer()
        updatePlayerStatus()
      } else if (isPlaying && isPaused) {
        audio.play()
        isPaused = false
        startTimer()
        updatePlayerStatus()
      }
    })
  
    prevButton.addEventListener("click", function () {
      this.classList.add("active")
      setTimeout(() => this.classList.remove("active"), 200)
    })
  
    nextButton.addEventListener("click", function () {
      this.classList.add("active")
      setTimeout(() => this.classList.remove("active"), 200)
    })
  
    volumeButton.addEventListener("click", () => {
      radioPlayer.classList.toggle("volume-active")
      updateVolumeDisplay()
    })
  
    volumeSliderThumb.addEventListener("mousedown", (e) => {
      e.preventDefault()
      isDraggingVolume = true
  
      const sliderTrack = volumeSliderContainer.querySelector(".volume-slider-track")
      const sliderRect = sliderTrack.getBoundingClientRect()
      const thumbWidth = volumeSliderThumb.offsetWidth
  
      function handleMouseMove(e) {
        if (isDraggingVolume) {
          const relativeX = Math.max(0, Math.min(e.clientX - sliderRect.left, sliderRect.width - thumbWidth))
          const newVolume = relativeX / (sliderRect.width - thumbWidth)
  
          audio.volume = Math.max(0, Math.min(1, newVolume))
  
          updateVolumeDisplay()
        }
      }
  
      function handleMouseUp() {
        isDraggingVolume = false
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
  
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    })
  
    closeButton.addEventListener("click", () => {
      audio.pause()
      isPlaying = false
      isPaused = false
      stopTimer()
      resetTimer()
      updatePlayerStatus()
    })

    updateVolumeDisplay()
    updatePlayerStatus()
  
    const buttons = document.querySelectorAll("button")
    buttons.forEach((button) => {
      button.addEventListener("mousedown", function () {
        this.style.borderStyle = "inset"
      })
  
      button.addEventListener("mouseup", function () {
        this.style.borderStyle = "outset"
      })
  
      button.addEventListener("mouseleave", function () {
        this.style.borderStyle = "outset"
      })
    })
  
    const menuItems = document.querySelectorAll(".menu-item")
    menuItems.forEach((item) => {
      item.addEventListener("mouseenter", function () {
        this.style.backgroundColor = "#000080"
        this.style.color = "white"
      })
  
      item.addEventListener("mouseleave", function () {
        this.style.backgroundColor = ""
        this.style.color = ""
      })
    })
  })
  