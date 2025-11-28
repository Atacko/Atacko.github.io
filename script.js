document.addEventListener("DOMContentLoaded", () => {
  const wallpaper = new Image()
  wallpaper.src = "assets/img/wallpaper.png"
  wallpaper.onload = () => {
    document.getElementById("desktop").style.backgroundImage = "url('assets/img/wallpaper.png')"
  }

  wallpaper.onerror = () => {
    console.error("Failed to load wallpaper image")
    document.getElementById("desktop").style.backgroundColor = "#008080"
  }

  const gamesGrid = document.getElementById("gamesGrid")

  if (gamesGrid) {
    const games = [
      {
        id: "minesweeper",
        name: "Minesweeper",
        icon: "assets/img/minesweeper.png",
        url: "minesweeper.html",
      },
      {
        id: "space-invaders",
        name: "Space Invaders",
        icon: "assets/img/spaceinv.png",
        url: "games/spaceinvaders/index.html",
      },
      {
        id: "stack",
        name: "Stack",
        icon: "assets/img/stack.png",
        url: "games/Stack/index.html",
      },
      {
        id: "pong",
        name: "Pong",
        icon: "assets/img/pong.png",
        url: "games/Pong/index.html",
      },
    ]

    games.forEach((game) => {
      const gameIcon = document.createElement("div")
      gameIcon.className = "game-icon"
      gameIcon.innerHTML = `
        <img src="${game.icon}" alt="${game.name}">
        <p>${game.name}</p>
      `

      gameIcon.addEventListener("click", () => {
        window.parent.postMessage(
          { action: "openGame", gameId: game.id, gameTitle: game.name, gameUrl: game.url, gameIcon: game.icon },
          "*",
        )
      })

      gamesGrid.appendChild(gameIcon)
    })
  }
})

const MIN_WIDTH = 350
const MIN_HEIGHT = 275
let highestZIndex = 10
let activeWindow = null
let programsSubmenuTimeout
let gamesSubmenuTimeout
let gamesSubmenu

const startButton = document.getElementById("startButton")
const startMenu = document.getElementById("startMenu")
const desktopIcons = document.querySelectorAll(".desktop-icon")
const windowsContainer = document.getElementById("windows-container")
const openWindows = document.querySelector(".open-windows")
const clockElement = document.getElementById("clock")
const clockWindow = document.getElementById("clockWindow")
const clockWindowClose = document.getElementById("clockWindowClose")
const clockOkButton = document.getElementById("clockOkButton")
const clockCancelButton = document.getElementById("clockCancelButton")
const clockDisplay = document.getElementById("clockDisplay")
const dateDisplay = document.getElementById("dateDisplay")
const desktop = document.getElementById("desktop")
const myComputer = document.getElementById("my-computer")
const programsMenuItem = document.getElementById("programsMenuItem")

function throttle(fn, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

startButton.addEventListener("click", (e) => {
  e.stopPropagation()
  startMenu.style.display = startMenu.style.display === "block" ? "none" : "block"
})

document.addEventListener("click", (e) => {
  if (!startMenu.contains(e.target) && e.target !== startButton) {
    startMenu.style.display = "none"
    if (programsSubmenu) {
      programsSubmenu.style.display = "none"
    }
    if (gamesSubmenu) {
      gamesSubmenu.style.display = "none"
    }
  }
})

function createProgramsSubmenu() {
  const existingSubmenu = document.getElementById("programs-submenu")
  if (existingSubmenu) {
    existingSubmenu.remove()
  }

  const programsSubmenu = document.createElement("div")
  programsSubmenu.className = "submenu"
  programsSubmenu.id = "programs-submenu"
  programsSubmenu.style.display = "none"
  programsSubmenu.style.width = "180px"

  const radioItem = document.createElement("div")
  radioItem.className = "submenu-item"
  radioItem.innerHTML = `
    <img src="assets/img/radio95.png" alt="Radio">
    <span>Mini Radio</span>
  `

  radioItem.addEventListener("click", () => {
    createWindow("radio", "Radio", "radio.html", radioItem.querySelector("img").src)
    startMenu.style.display = "none"
    programsSubmenu.style.display = "none"
  })

  const legacyRadioItem = document.createElement("div")
  legacyRadioItem.className = "submenu-item"
  legacyRadioItem.innerHTML = `
    <img src="assets/img/LegacyRadio.png" alt="Legacy Radio">
    <span>Legacy Radio</span>
  `

  legacyRadioItem.addEventListener("click", () => {
    window.open("LegacyRadio/index.html", "_blank")
    startMenu.style.display = "none"
    programsSubmenu.style.display = "none"
  })

  const gamesItem = document.createElement("div")
  gamesItem.className = "submenu-item"
  gamesItem.innerHTML = `
    <img src="assets/img/joystick.png" alt="Games">
    <span>Games</span>
  `

  gamesItem.addEventListener("click", () => {
    createWindow("games", "Games", "games.html", gamesItem.querySelector("img").src)
    startMenu.style.display = "none"
    programsSubmenu.style.display = "none"
  })

  programsSubmenu.appendChild(radioItem)
  programsSubmenu.appendChild(legacyRadioItem)
  programsSubmenu.appendChild(gamesItem)
  document.body.appendChild(programsSubmenu)

  return programsSubmenu
}

const programsSubmenu = createProgramsSubmenu()

if (programsMenuItem) {
  programsMenuItem.addEventListener("mouseenter", () => {
    const rect = programsMenuItem.getBoundingClientRect()
    programsSubmenu.style.position = "absolute"
    programsSubmenu.style.left = rect.right + "px"
    programsSubmenu.style.top = rect.top + "px"
    programsSubmenu.style.display = "block"
  })

  programsMenuItem.addEventListener("mouseleave", (e) => {
    const toElement = e.relatedTarget
    const gamesSubmenu = document.getElementById("games-submenu")

    if (!programsSubmenu.contains(toElement) && !(gamesSubmenu && gamesSubmenu.contains(toElement))) {
      programsSubmenu.style.display = "none"
      if (gamesSubmenu) {
        gamesSubmenu.style.display = "none"
      }
    }
  })
}

programsSubmenu.addEventListener("mouseenter", () => {
  programsSubmenu.style.display = "block"
})

programsSubmenu.addEventListener("mouseleave", (e) => {
  const toElement = e.relatedTarget
  const gamesSubmenu = document.getElementById("games-submenu")

  if (!(gamesSubmenu && gamesSubmenu.contains(toElement))) {
    programsSubmenu.style.display = "none"
    if (gamesSubmenu) {
      gamesSubmenu.style.display = "none"
    }
  }
})

const mainMenuItems = document.querySelectorAll(".start-menu-item:not(#programsMenuItem)")
mainMenuItems.forEach((item) => {
  item.addEventListener("mouseenter", () => {
    programsSubmenu.style.display = "none"
    const gamesSubmenu = document.getElementById("games-submenu")
    if (gamesSubmenu) {
      gamesSubmenu.style.display = "none"
    }
  })
})

clockElement.addEventListener("click", (e) => {
  e.stopPropagation()

  updateClockWindow()

  clockWindow.style.display = "block"

  const taskbarRect = document.querySelector(".taskbar").getBoundingClientRect()
  clockWindow.style.bottom = window.innerHeight - taskbarRect.top + "px"
  clockWindow.style.right = "5px"

  highestZIndex++
  clockWindow.style.zIndex = highestZIndex
})

clockWindowClose.addEventListener("click", () => {
  clockWindow.style.display = "none"
})

clockOkButton.addEventListener("click", () => {
  clockWindow.style.display = "none"
})

clockCancelButton.addEventListener("click", () => {
  clockWindow.style.display = "none"
})

function updateClockWindow() {
  const now = new Date()

  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  dateDisplay.textContent = now.toLocaleDateString("en-US", options)

  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  const period = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes
  const formattedSeconds = seconds < 10 ? "0" + seconds : seconds

  clockDisplay.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`
}

function updateClock() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const period = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes

  document.getElementById("time").textContent = `${formattedHours}:${formattedMinutes} ${period}`
}

setInterval(updateClock, 1000)
updateClock()

function centerWindow(win) {
  const desktopWidth = desktop.offsetWidth
  const desktopHeight = desktop.offsetHeight

  const winWidth = Math.min(desktopWidth * 0.65, 800)
  const winHeight = Math.min(desktopHeight * 0.65, 600)

  win.style.width = `${winWidth}px`
  win.style.height = `${winHeight}px`

  const left = Math.max(0, (desktopWidth - winWidth) / 2)
  const top = Math.max(0, (desktopHeight - winHeight) / 2)

  win.style.left = `${left}px`
  win.style.top = `${top}px`

  ensureWindowInViewport(win)
}

function ensureWindowInViewport(win) {
  const rect = win.getBoundingClientRect()
  const desktopRect = desktop.getBoundingClientRect()

  if (rect.left < desktopRect.left) {
    win.style.left = "0px"
  } else if (rect.right > desktopRect.right) {
    win.style.left = Math.max(0, desktopRect.width - rect.width) + "px"
  }

  if (rect.top < desktopRect.top) {
    win.style.top = "0px"
  } else if (rect.bottom > desktopRect.bottom) {
    win.style.top = Math.max(0, desktopRect.height - rect.height) + "px"
  }
}

function activateWindow(win) {
  if (activeWindow && activeWindow !== win) {
    activeWindow.querySelector(".window-titlebar").classList.add("inactive")
    const activeButton = document.querySelector(`.window-button[data-id="${activeWindow.id}"]`)
    if (activeButton) activeButton.classList.remove("active")
  }

  activeWindow = win
  win.querySelector(".window-titlebar").classList.remove("inactive")

  const button = document.querySelector(`.window-button[data-id="${win.id}"]`)
  if (button) button.classList.add("active")

  highestZIndex++
  win.style.zIndex = highestZIndex
}

function createWindowButton(id, title, icon) {
  const button = document.createElement("div")
  button.className = "window-button"
  button.setAttribute("data-id", id)

  if (icon) {
    const img = document.createElement("img")
    img.src = icon
    img.alt = title
    button.appendChild(img)
  }

  const span = document.createElement("span")
  span.textContent = title
  button.appendChild(span)

  button.addEventListener("click", () => {
    const win = document.getElementById(id)
    if (win) {
      if (activeWindow === win) {
        win.style.display = win.style.display === "none" ? "flex" : "none"
        button.classList.toggle("active", win.style.display !== "none")
      } else {
        win.style.display = "flex"
        activateWindow(win)
      }
    }
  })

  openWindows.appendChild(button)
  return button
}

function createWindow(id, title, url, icon) {
  if (document.getElementById(id)) {
    const existingWindow = document.getElementById(id)
    existingWindow.style.display = "flex"
    activateWindow(existingWindow)
    return
  }

  const win = document.createElement("div")
  win.className = "window"
  win.id = id
  win.style.zIndex = ++highestZIndex

  if (id === "minesweeper") {
    win.style.width = "340px"
    win.style.height = "380px"

    win.innerHTML = `
      <div class="window-titlebar">
        <div class="window-title">${title}</div>
        <div class="window-controls">
          <div class="window-control window-minimize">_</div>
          <div class="window-control window-maximize">□</div>
          <div class="window-control window-close">×</div>
        </div>
      </div>
      <div class="window-menu">
        <div class="window-menu-item">Game</div>
        <div class="window-menu-item">Help</div>
      </div>
      <div class="window-content">
        <iframe src="${url}" frameborder="0"></iframe>
      </div>
      <div class="window-statusbar"></div>
      <div class="window-resize"></div>
    `
  } else if (id === "space-invaders") {
    const desktopWidth = desktop.offsetWidth
    const desktopHeight = desktop.offsetHeight
    const winWidth = Math.min(desktopWidth * 0.65, 800)
    const winHeight = Math.min(desktopHeight * 0.65, 600) * 1.15

    win.style.width = `${winWidth}px`
    win.style.height = `${winHeight}px`

    win.innerHTML = `
      <div class="window-titlebar">
        <div class="window-title">${title}</div>
        <div class="window-controls">
          <div class="window-control window-minimize">_</div>
          <div class="window-control window-maximize">□</div>
          <div class="window-control window-close">×</div>
        </div>
      </div>
      <div class="window-content">
        <iframe src="${url}" frameborder="0"></iframe>
      </div>
      <div class="window-resize"></div>
    `

    const left = Math.max(0, (desktopWidth - winWidth) / 2)
    const top = Math.max(0, (desktopHeight - winHeight) / 2)

    win.style.left = `${left}px`
    win.style.top = `${top}px`
  } else if (id === "stack") {
    const desktopWidth = desktop.offsetWidth
    const desktopHeight = desktop.offsetHeight
    const winWidth = Math.min(desktopWidth * 0.65, 800)
    const winHeight = Math.min(desktopHeight * 0.65, 600) * 1.15

    win.style.width = `${winWidth}px`
    win.style.height = `${winHeight}px`

    win.innerHTML = `
      <div class="window-titlebar">
        <div class="window-title">${title}</div>
        <div class="window-controls">
          <div class="window-control window-minimize">_</div>
          <div class="window-control window-maximize">□</div>
          <div class="window-control window-close">×</div>
        </div>
      </div>
      <div class="window-content">
        <iframe src="${url}" frameborder="0"></iframe>
      </div>
      <div class="window-resize"></div>
    `

    const left = Math.max(0, (desktopWidth - winWidth) / 2)
    const top = Math.max(0, (desktopHeight - winHeight) / 2)

    win.style.left = `${left}px`
    win.style.top = `${top}px`
  } else if (id === "pong") {
    const desktopWidth = desktop.offsetWidth
    const desktopHeight = desktop.offsetHeight
    const winWidth = Math.min(desktopWidth * 0.65, 800)
    const winHeight = Math.min(desktopHeight * 0.65, 600) * 1.15

    win.style.width = `${winWidth}px`
    win.style.height = `${winHeight}px`

    win.innerHTML = `
      <div class="window-titlebar">
        <div class="window-title">${title}</div>
        <div class="window-controls">
          <div class="window-control window-minimize">_</div>
          <div class="window-control window-maximize">□</div>
          <div class="window-control window-close">×</div>
        </div>
      </div>
      <div class="window-content">
        <iframe src="${url}" frameborder="0"></iframe>
      </div>
      <div class="window-resize"></div>
    `

    const left = Math.max(0, (desktopWidth - winWidth) / 2)
    const top = Math.max(0, (desktopHeight - winHeight) / 2)

    win.style.left = `${left}px`
    win.style.top = `${top}px`
  } else if (id === "radio") {
    win.style.width = "320px"
    win.style.height = "220px"

    win.innerHTML = `
      <div class="window-titlebar">
        <div class="window-title">${title}</div>
        <div class="window-controls">
          <div class="window-control window-minimize">_</div>
          <div class="window-control window-maximize">□</div>
          <div class="window-control window-close">×</div>
        </div>
      </div>
      <div class="window-menu">
        <div class="window-menu-item">File</div>
        <div class="window-menu-item">Options</div>
        <div class="window-menu-item help-menu">Help</div>
      </div>
      <div class="window-content" style="padding:0; background-color:#c0c0c0;">
        <div class="radio-container" style="height:100%;">
          <div class="display">
            <div class="track-info">
              <div class="track-label">TRACK</div>
              <div class="track-number">01</div>
            </div>
            <div class="time-info">
              <div id="time-display">0:00</div>
            </div>
            <div class="mode-info">
              <div class="mode-label">MODE</div>
              <div class="mode-value">ST</div>
            </div>
            <div class="khz-info">
              <div class="khz-label">KHz</div>
              <div class="khz-value">44</div>
            </div>
            <div class="kbps-info">
              <div class="kbps-label">Kbps</div>
              <div class="kbps-value">128</div>
            </div>
          </div>
          
          <div class="controls">
            <button id="play-button" class="control-button">▶</button>
            <button id="stop-button" class="control-button">■</button>
            <button id="pause-button" class="control-button">❚❚</button>
            <button id="prev-button" class="control-button">◀◀</button>
            <button id="next-button" class="control-button">▶▶</button>
            <button id="volume-button" class="control-button">🔊</button>
          </div>
          
          <div id="volume-slider-container" class="volume-slider-container">
            <div class="volume-slider-track">
              <div id="volume-slider-thumb" class="volume-slider-thumb"></div>
            </div>
            <div id="volume-display">50%</div>
          </div>
          
          <div class="status-bar">
            <div class="status-indicator"></div>
          </div>
        </div>
      </div>
      <div class="window-statusbar"></div>
      <div class="window-resize"></div>
    `
  } else if (id === "window5") {
    win.innerHTML = `
      <div class="window-titlebar">
        <div class="window-title">${title}</div>
        <div class="window-controls">
          <div class="window-control window-minimize">_</div>
          <div class="window-control window-maximize">□</div>
          <div class="window-control window-close">×</div>
        </div>
      </div>
      <div class="window-menu">
        <div class="window-menu-item">File</div>
        <div class="window-menu-item">Edit</div>
        <div class="window-menu-item">View</div>
        <div class="window-menu-item">Help</div>
      </div>
      <div class="window-content" style="display: flex; flex-direction: column; align-items: flex-start; padding: 10px; gap: 10px; background-color: #c0c0c0; overflow-y: auto;" id="toolsGrid">
      </div>
      <div class="window-statusbar"></div>
      <div class="window-resize"></div>
    `
  } else {
    win.innerHTML = `
      <div class="window-titlebar">
        <div class="window-title">${title}</div>
        <div class="window-controls">
          <div class="window-control window-minimize">_</div>
          <div class="window-control window-maximize">□</div>
          <div class="window-control window-close">×</div>
        </div>
      </div>
      <div class="window-menu">
        <div class="window-menu-item">File</div>
        <div class="window-menu-item">Edit</div>
        <div class="window-menu-item">View</div>
        <div class="window-menu-item">Help</div>
      </div>
      <div class="window-content">
        <iframe src="${url}" frameborder="0"></iframe>
      </div>
      <div class="window-statusbar"></div>
      <div class="window-resize"></div>
    `
    centerWindow(win)
  }

  windowsContainer.appendChild(win)

  if (id === "minesweeper") {
    const desktopWidth = desktop.offsetWidth
    const desktopHeight = desktop.offsetHeight
    const winWidth = 340
    const winHeight = 380

    const left = Math.max(0, (desktopWidth - winWidth) / 2)
    const top = Math.max(0, (desktopHeight - winHeight) / 2)

    win.style.left = `${left}px`
    win.style.top = `${top}px`
  } else if (id === "space-invaders") {
    const desktopWidth = desktop.offsetWidth
    const desktopHeight = desktop.offsetHeight
    const winWidth = Math.min(desktopWidth * 0.65, 800)
    const winHeight = Math.min(desktopHeight * 0.65, 600) * 1.15

    const left = Math.max(0, (desktopWidth - winWidth) / 2)
    const top = Math.max(0, (desktopHeight - winHeight) / 2)

    win.style.left = `${left}px`
    win.style.top = `${top}px`
  } else if (id === "stack") {
    const desktopWidth = desktop.offsetWidth
    const desktopHeight = desktop.offsetHeight
    const winWidth = Math.min(desktopWidth * 0.65, 800)
    const winHeight = Math.min(desktopHeight * 0.65, 600) * 1.15

    const left = Math.max(0, (desktopWidth - winWidth) / 2)
    const top = Math.max(0, (desktopHeight - winHeight) / 2)

    win.style.left = `${left}px`
    win.style.top = `${top}px`
  } else if (id === "pong") {
    const desktopWidth = desktop.offsetWidth
    const desktopHeight = desktop.offsetHeight
    const winWidth = Math.min(desktopWidth * 0.65, 800)
    const winHeight = Math.min(desktopHeight * 0.65, 600) * 1.15

    const left = Math.max(0, (desktopWidth - winWidth) / 2)
    const top = Math.max(0, (desktopHeight - winHeight) / 2)

    win.style.left = `${left}px`
    win.style.top = `${top}px`
  } else if (id === "radio") {
    const desktopWidth = desktop.offsetWidth
    const desktopHeight = desktop.offsetHeight
    const winWidth = 320
    const winHeight = 220

    const left = Math.max(0, (desktopWidth - winWidth) / 2)
    const top = Math.max(0, (desktopHeight - winHeight) / 2)

    win.style.left = `${left}px`
    win.style.top = `${top}px`
  } else {
    centerWindow(win)
  }

  createWindowButton(id, title, icon)

  setupWindowEvents(win)

  if (id === "window5") {
    initializeToolbox()
  }

  activateWindow(win)

  if (id === "radio") {
    initializeRadioPlayer()
  }

  if (id === "window5") {
    centerWindow(win)
  }

  return win
}

function setupWindowEvents(win) {
  const titlebar = win.querySelector(".window-titlebar")
  const closeBtn = win.querySelector(".window-close")
  const minimizeBtn = win.querySelector(".window-minimize")
  const maximizeBtn = win.querySelector(".window-maximize")
  const resizeHandle = win.querySelector(".window-resize")
  const iframe = win.querySelector("iframe")

  win.addEventListener("mousedown", () => {
    activateWindow(win)
  })

  closeBtn.addEventListener("click", () => {
    win.remove()
    const button = document.querySelector(`.window-button[data-id="${win.id}"]`)
    if (button) button.remove()
    if (activeWindow === win) activeWindow = null
  })

  minimizeBtn.addEventListener("click", () => {
    win.style.display = "none"
    const button = document.querySelector(`.window-button[data-id="${win.id}"]`)
    if (button) button.classList.remove("active")
  })

  let originalSize = { width: win.style.width, height: win.style.height, left: win.style.left, top: win.style.top }
  let isMaximized = false

  maximizeBtn.addEventListener("click", () => {
    if (!isMaximized) {
      originalSize = {
        width: win.style.width,
        height: win.style.height,
        left: win.style.left,
        top: win.style.top,
      }

      win.style.width = desktop.offsetWidth + "px"
      win.style.height = desktop.offsetHeight + "px"
      win.style.left = "0"
      win.style.top = "0"
      isMaximized = true
    } else {
      win.style.width = originalSize.width
      win.style.height = originalSize.height
      win.style.left = originalSize.left
      win.style.top = originalSize.top
      isMaximized = false
    }
  })

  titlebar.addEventListener("dblclick", () => {
    maximizeBtn.click()
  })

  titlebar.addEventListener("mousedown", (e) => {
    if (isMaximized) return

    e.preventDefault()
    const rect = win.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    if (iframe) iframe.style.pointerEvents = "none"

    const moveFn = throttle((e) => {
      win.style.left = e.clientX - offsetX + "px"
      win.style.top = e.clientY - offsetY + "px"
    }, 10)

    function onMouseUp() {
      document.removeEventListener("mousemove", moveFn)
      document.removeEventListener("mouseup", onMouseUp)

      if (iframe) iframe.style.pointerEvents = "auto"

      ensureWindowInViewport(win)
    }

    document.addEventListener("mousemove", moveFn)
    document.addEventListener("mouseup", onMouseUp)
  })

  resizeHandle.addEventListener("mousedown", (e) => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = Number.parseInt(win.style.width, 10) || win.offsetWidth
    const startHeight = Number.parseInt(win.style.height, 10) || win.offsetHeight

    if (iframe) iframe.style.pointerEvents = "none"

    const resizeFn = throttle((e) => {
      let newWidth = startWidth + (e.clientX - startX)
      let newHeight = startHeight + (e.clientY - startY)

      newWidth = Math.max(newWidth, MIN_WIDTH)
      newHeight = Math.max(newHeight, MIN_HEIGHT)

      win.style.width = newWidth + "px"
      win.style.height = newHeight + "px"
    }, 10)

    function onMouseUp() {
      document.removeEventListener("mousemove", resizeFn)
      document.removeEventListener("mouseup", onMouseUp)

      if (iframe) iframe.style.pointerEvents = "auto"

      ensureWindowInViewport(win)
    }

    document.addEventListener("mousemove", resizeFn)
    document.addEventListener("mouseup", onMouseUp)
  })
}

desktopIcons.forEach((icon) => {
  if (icon.id === "my-computer" || icon.classList.contains("recycle-bin")) {
    icon.addEventListener("click", () => {
      desktopIcons.forEach((i) => i.classList.remove("selected"))
      icon.classList.add("selected")
    })
    return
  }

  icon.addEventListener("click", function () {
    const url = this.getAttribute("data-url")
    const isNewTab = this.getAttribute("target") === "_blank"

    if (isNewTab) {
      window.open(url, "_blank")
    } else {
      const windowId = this.getAttribute("data-window") || `window-${Math.random().toString(36).substr(2, 9)}`
      const windowTitle = this.querySelector("p").textContent
      const iconSrc = this.querySelector("img").src

      createWindow(windowId, windowTitle, url, iconSrc)
    }
  })

  let clickTimer = null
  icon.addEventListener("mousedown", () => {
    if (clickTimer === null) {
      clickTimer = setTimeout(() => {
        clickTimer = null
        desktopIcons.forEach((i) => i.classList.remove("selected"))
        icon.classList.add("selected")
      }, 200)
    } else {
      clearTimeout(clickTimer)
      clickTimer = null
      icon.click()
    }
  })
})

let isSelecting = false
let startX, startY
let selectionRect = null

function createSelectionRectangle(x, y) {
  removeSelectionRectangle()

  selectionRect = document.createElement("div")
  selectionRect.className = "selection-rectangle"
  selectionRect.style.left = `${x}px`
  selectionRect.style.top = `${y}px`
  selectionRect.style.width = "0"
  selectionRect.style.height = "0"
  desktop.appendChild(selectionRect)
}

function updateSelectionRectangle(x, y) {
  if (!selectionRect) return

  const width = Math.abs(x - startX)
  const height = Math.abs(y - startY)

  const left = x < startX ? x : startX
  const top = y < startY ? y : startY

  selectionRect.style.left = `${left}px`
  selectionRect.style.top = `${top}px`
  selectionRect.style.width = `${width}px`
  selectionRect.style.height = `${height}px`
}

function removeSelectionRectangle() {
  if (selectionRect) {
    selectionRect.remove()
    selectionRect = null
  }
}

desktop.addEventListener("mousedown", (e) => {
  if ((e.target === desktop || e.target === windowsContainer) && e.button === 0) {
    isSelecting = true
    startX = e.clientX
    startY = e.clientY
    createSelectionRectangle(startX, startY)

    desktopIcons.forEach((icon) => icon.classList.remove("selected"))
    startMenu.style.display = "none"
  }
})

desktop.addEventListener(
  "mousemove",
  throttle((e) => {
    if (isSelecting) {
      updateSelectionRectangle(e.clientX, e.clientY)
    }
  }, 10),
)

document.addEventListener("mouseup", (e) => {
  if (isSelecting) {
    isSelecting = false
    removeSelectionRectangle()
  }
})

desktop.addEventListener("contextmenu", (e) => {
  e.preventDefault()

  isSelecting = false
  removeSelectionRectangle()
})

window.addEventListener("resize", () => {
  const windows = document.querySelectorAll(".window")
  windows.forEach((win) => {
    ensureWindowInViewport(win)
  })
})

const clockWindowTitlebar = document.querySelector(".clock-window-titlebar")
if (clockWindowTitlebar) {
  clockWindowTitlebar.addEventListener("mousedown", (e) => {
    e.preventDefault()
    const rect = clockWindow.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    const moveFn = throttle((e) => {
      clockWindow.style.left = e.clientX - offsetX + "px"
      clockWindow.style.top = e.clientY - offsetY + "px"

      clockWindow.style.bottom = "auto"
      clockWindow.style.right = "auto"
    }, 10)

    function onMouseUp() {
      document.removeEventListener("mousemove", moveFn)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", moveFn)
    document.addEventListener("mouseup", onMouseUp)
  })
}

document.addEventListener("mousedown", (e) => {
  if (clockWindow.style.display === "block" && !clockWindow.contains(e.target) && e.target !== clockElement) {
    clockWindow.style.display = "none"
  }
})

function initializeRadioPlayer() {
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
  const radioContainer = document.querySelector(".radio-container")

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
    radioContainer.classList.remove("playing", "paused", "stopped")

    if (isPlaying) {
      if (isPaused) {
        radioContainer.classList.add("paused")
      } else {
        radioContainer.classList.add("playing")
      }
    } else {
      radioContainer.classList.add("stopped")
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
    radioContainer.classList.toggle("volume-active")
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

  updateVolumeDisplay()
  updatePlayerStatus()

  const buttons = document.querySelectorAll(".control-button")
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
}

function initializeToolbox() {
  const toolsGrid = document.getElementById("toolsGrid")

  if (!toolsGrid) return

  toolsGrid.style.display = "flex"
  toolsGrid.style.flexDirection = "row"
  toolsGrid.style.flexWrap = "wrap"
  toolsGrid.style.width = "100%"
  toolsGrid.style.gap = "10px" 
  toolsGrid.style.alignContent = "flex-start" 
  toolsGrid.style.padding = "10px" 

  const tools = [
    {
      id: "asciigen",
      name: "ASCII Art Generator",
      icon: "assets/img/ascii.png",
      url: "Tools/ASCIIGen/asciigen.html",
    },
    {
      id: "qrgen",
      name: "QR Code Generator",
      icon: "assets/img/qr-code.png",
      url: "Tools/qrgen/qrgen.html",
    },
    {
      id: "passgen",
      name: "Password Generator",
      icon: "assets/img/key_padlock-0.png",
      url: "Tools/passgen/passgen.html",
    },
  ]

  tools.forEach((tool) => {
    const toolIcon = document.createElement("div")
    toolIcon.className = "game-icon"
    toolIcon.style.width = "90px"
    toolIcon.style.height = "110px"
    toolIcon.style.display = "flex"
    toolIcon.style.flexDirection = "column"
    toolIcon.style.alignItems = "center"
    toolIcon.style.justifyContent = "flex-start"
    toolIcon.style.cursor = "pointer"
    toolIcon.style.padding = "5px"
    toolIcon.style.flexShrink = "0"
    
    toolIcon.innerHTML = `
      <img src="${tool.icon}" alt="${tool.name}" style="width: 40px; height: 40px; margin-bottom: 8px;">
      <p style="text-align: center; font-size: 14px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: normal; word-wrap: break-word; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${tool.name}</p>
    `

    toolIcon.addEventListener("click", () => {
      createWindow(tool.id, tool.name, tool.url, tool.icon)
    })

    toolsGrid.appendChild(toolIcon)
  })
}

window.addEventListener("message", (event) => {
  if (event.data && event.data.action === "openGame") {
    const { gameId, gameTitle, gameUrl, gameIcon } = event.data
    createWindow(gameId, gameTitle, gameUrl, gameIcon)
  }
})
