// Preload the wallpaper image to ensure it's displayed properly
document.addEventListener("DOMContentLoaded", () => {
  const wallpaper = new Image()
  wallpaper.src = "assets/img/wallpaper.png"
  wallpaper.onload = () => {
    // Once the wallpaper is loaded, make sure it's applied to the desktop
    document.getElementById("desktop").style.backgroundImage = "url('assets/img/wallpaper.png')"
  }

  // If the wallpaper fails to load, fall back to the teal background
  wallpaper.onerror = () => {
    console.error("Failed to load wallpaper image")
    document.getElementById("desktop").style.backgroundColor = "#008080"
  }
})

// Constants
const MIN_WIDTH = 350
const MIN_HEIGHT = 275
let highestZIndex = 10
let activeWindow = null
let programsSubmenuTimeout // Declare the variable here
let gamesSubmenuTimeout // Declare the variable here
let gamesSubmenu // Declare the variable here

// DOM Elements
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

// Throttle function for performance optimization
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

// Start Menu Toggle
startButton.addEventListener("click", (e) => {
  e.stopPropagation()
  startMenu.style.display = startMenu.style.display === "block" ? "none" : "block"
})

// Close Start Menu when clicking elsewhere
document.addEventListener("click", (e) => {
  if (!startMenu.contains(e.target) && e.target !== startButton) {
    startMenu.style.display = "none"
    // Also hide the programs submenu
    if (programsSubmenu) {
      programsSubmenu.style.display = "none"
    }
    // Also hide the games submenu
    if (gamesSubmenu) {
      gamesSubmenu.style.display = "none"
    }
  }
})

// Create Programs submenu
function createProgramsSubmenu() {
  // Remove any existing submenu to prevent duplicates
  const existingSubmenu = document.getElementById("programs-submenu")
  if (existingSubmenu) {
    existingSubmenu.remove()
  }

  // Create submenu container
  const programsSubmenu = document.createElement("div")
  programsSubmenu.className = "submenu"
  programsSubmenu.id = "programs-submenu"
  programsSubmenu.style.display = "none"
  programsSubmenu.style.width = "180px" // Smaller width

  // Add Radio option
  const radioItem = document.createElement("div")
  radioItem.className = "submenu-item"
  radioItem.innerHTML = `
    <img src="assets/img/radio95.png" alt="Radio">
    <span>Radio</span>
  `

  // Add click event to open Radio
  radioItem.addEventListener("click", () => {
    createWindow("radio", "Radio", "radio.html", radioItem.querySelector("img").src)
    startMenu.style.display = "none"
    programsSubmenu.style.display = "none"
  })

  // Add Games option with submenu
  const gamesItem = document.createElement("div")
  gamesItem.className = "submenu-item has-submenu"
  gamesItem.innerHTML = `
    <img src="assets/img/joystick.png" alt="Games">
    <span>Games</span>
    <span class="submenu-arrow">►</span>
  `

  // Create Games submenu
  const gamesSubmenu = document.createElement("div")
  gamesSubmenu.className = "submenu"
  gamesSubmenu.id = "games-submenu"
  gamesSubmenu.style.display = "none"
  gamesSubmenu.style.width = "180px"

  // Add Minesweeper option inside Games
  const minesweeperItem = document.createElement("div")
  minesweeperItem.className = "submenu-item"
  minesweeperItem.innerHTML = `
    <img src="assets/img/minesweeper.png" alt="Minesweeper">
    <span>Minesweeper</span>
  `

  // Add click event to open Minesweeper
  minesweeperItem.addEventListener("click", () => {
    createWindow("minesweeper", "Minesweeper", "minesweeper.html", minesweeperItem.querySelector("img").src)
    startMenu.style.display = "none"
    programsSubmenu.style.display = "none"
    gamesSubmenu.style.display = "none"
  })

  const spaceInvadersItem = document.createElement("div")
  spaceInvadersItem.className = "submenu-item"
  spaceInvadersItem.innerHTML = `
    <img src="assets/img/spaceinv.png" alt="Space Invaders">
    <span>Space Invaders</span>
  `

  spaceInvadersItem.addEventListener("click", () => {
    createWindow(
      "space-invaders",
      "Space Invaders",
      "games/spaceinvaders/index.html",
      spaceInvadersItem.querySelector("img").src,
    )
    startMenu.style.display = "none"
    programsSubmenu.style.display = "none"
    gamesSubmenu.style.display = "none"
  })

  gamesSubmenu.appendChild(minesweeperItem)
  gamesSubmenu.appendChild(spaceInvadersItem) // Added Space Invaders to Games submenu

  document.body.appendChild(gamesSubmenu)

  // Games submenu hover events
  gamesItem.addEventListener("mouseenter", () => {
    const rect = gamesItem.getBoundingClientRect()
    gamesSubmenu.style.position = "absolute"
    gamesSubmenu.style.left = rect.right + "px"
    gamesSubmenu.style.top = rect.top + "px"
    gamesSubmenu.style.display = "block"
  })

  gamesItem.addEventListener("mouseleave", (e) => {
    const toElement = e.relatedTarget
    if (!gamesSubmenu.contains(toElement)) {
      gamesSubmenuTimeout = setTimeout(() => {
        gamesSubmenu.style.display = "none"
      }, 200)
    }
  })

  gamesSubmenu.addEventListener("mouseenter", () => {
    clearTimeout(gamesSubmenuTimeout)
    gamesSubmenu.style.display = "block"
  })

  gamesSubmenu.addEventListener("mouseleave", () => {
    gamesSubmenuTimeout = setTimeout(() => {
      gamesSubmenu.style.display = "none"
    }, 200)
  })

  programsSubmenu.appendChild(radioItem)
  programsSubmenu.appendChild(gamesItem)
  document.body.appendChild(programsSubmenu)

  return programsSubmenu
}

// Create the programs submenu
const programsSubmenu = createProgramsSubmenu()

// Handle Programs menu item hover
if (programsMenuItem) {
  programsMenuItem.addEventListener("mouseenter", () => {
    const rect = programsMenuItem.getBoundingClientRect()
    programsSubmenu.style.position = "absolute"
    programsSubmenu.style.left = rect.right + "px"
    programsSubmenu.style.top = rect.top + "px"
    programsSubmenu.style.display = "block"
  })

  programsMenuItem.addEventListener("mouseleave", (e) => {
    // Check if mouse is moving to the submenu or any nested submenu
    const toElement = e.relatedTarget
    const gamesSubmenu = document.getElementById("games-submenu")

    if (!programsSubmenu.contains(toElement) && !(gamesSubmenu && gamesSubmenu.contains(toElement))) {
      programsSubmenu.style.display = "none"
      // Also hide games submenu
      if (gamesSubmenu) {
        gamesSubmenu.style.display = "none"
      }
    }
  })
}

// Handle submenu hover
programsSubmenu.addEventListener("mouseenter", () => {
  programsSubmenu.style.display = "block"
})

programsSubmenu.addEventListener("mouseleave", (e) => {
  const toElement = e.relatedTarget
  const gamesSubmenu = document.getElementById("games-submenu")

  if (!(gamesSubmenu && gamesSubmenu.contains(toElement))) {
    programsSubmenu.style.display = "none"
    // Also hide games submenu
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

// Clock Window Toggle
clockElement.addEventListener("click", (e) => {
  e.stopPropagation()

  // Update clock display
  updateClockWindow()

  // Show clock window
  clockWindow.style.display = "block"

  // Position clock window
  const taskbarRect = document.querySelector(".taskbar").getBoundingClientRect()
  clockWindow.style.bottom = window.innerHeight - taskbarRect.top + "px"
  clockWindow.style.right = "5px"

  // Bring to front
  highestZIndex++
  clockWindow.style.zIndex = highestZIndex
})

// Close Clock Window
clockWindowClose.addEventListener("click", () => {
  clockWindow.style.display = "none"
})

// Clock OK Button
clockOkButton.addEventListener("click", () => {
  clockWindow.style.display = "none"
})

// Clock Cancel Button
clockCancelButton.addEventListener("click", () => {
  clockWindow.style.display = "none"
})

// Update Clock Window
function updateClockWindow() {
  const now = new Date()

  // Format date: Monday, May 19, 2025
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  dateDisplay.textContent = now.toLocaleDateString("en-US", options)

  // Format time: 3:21:02 AM
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  const period = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes
  const formattedSeconds = seconds < 10 ? "0" + seconds : seconds

  clockDisplay.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`
}

// Update Taskbar Clock
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

// Function to center a window
function centerWindow(win) {
  // Get the desktop dimensions
  const desktopWidth = desktop.offsetWidth
  const desktopHeight = desktop.offsetHeight

  // Calculate window size based on desktop size (30% larger than before)
  const winWidth = Math.min(desktopWidth * 0.65, 800) // 65% of desktop width, max 800px
  const winHeight = Math.min(desktopHeight * 0.65, 600) // 65% of desktop height, max 600px

  // Set window size
  win.style.width = `${winWidth}px`
  win.style.height = `${winHeight}px`

  // Calculate position to center the window
  const left = Math.max(0, (desktopWidth - winWidth) / 2)
  const top = Math.max(0, (desktopHeight - winHeight) / 2)

  win.style.left = `${left}px`
  win.style.top = `${top}px`

  // Ensure the window is fully visible
  ensureWindowInViewport(win)
}

// Function to ensure window is within viewport
function ensureWindowInViewport(win) {
  const rect = win.getBoundingClientRect()
  const desktopRect = desktop.getBoundingClientRect()

  // Check if window is outside viewport horizontally
  if (rect.left < desktopRect.left) {
    win.style.left = "0px"
  } else if (rect.right > desktopRect.right) {
    win.style.left = Math.max(0, desktopRect.width - rect.width) + "px"
  }

  // Check if window is outside viewport vertically
  if (rect.top < desktopRect.top) {
    win.style.top = "0px"
  } else if (rect.bottom > desktopRect.bottom) {
    win.style.top = Math.max(0, desktopRect.height - rect.height) + "px"
  }
}

// Function to bring window to front and set as active
function activateWindow(win) {
  // Deactivate current active window
  if (activeWindow && activeWindow !== win) {
    activeWindow.querySelector(".window-titlebar").classList.add("inactive")
    const activeButton = document.querySelector(`.window-button[data-id="${activeWindow.id}"]`)
    if (activeButton) activeButton.classList.remove("active")
  }

  // Set new active window
  activeWindow = win
  win.querySelector(".window-titlebar").classList.remove("inactive")

  // Update taskbar button
  const button = document.querySelector(`.window-button[data-id="${win.id}"]`)
  if (button) button.classList.add("active")

  // Bring to front
  highestZIndex++
  win.style.zIndex = highestZIndex
}

// Function to create a window button in the taskbar
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
        // Minimize/restore window if it's already active
        win.style.display = win.style.display === "none" ? "flex" : "none"
        button.classList.toggle("active", win.style.display !== "none")
      } else {
        // Activate window
        win.style.display = "flex"
        activateWindow(win)
      }
    }
  })

  openWindows.appendChild(button)
  return button
}

// Function to create a new window
function createWindow(id, title, url, icon) {
  // Check if window already exists
  if (document.getElementById(id)) {
    const existingWindow = document.getElementById(id)
    existingWindow.style.display = "flex"
    activateWindow(existingWindow)
    return
  }

  // Create window element
  const win = document.createElement("div")
  win.className = "window"
  win.id = id
  win.style.zIndex = ++highestZIndex

  // Special case for Minesweeper - use fixed size
  if (id === "minesweeper") {
    win.style.width = "340px"
    win.style.height = "380px"

    // Create window structure
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
      <div class="window-statusbar">Ready</div>
      <div class="window-resize"></div>
    `
  }
  // Special case for Space Invaders - use 15% taller height
  else if (id === "space-invaders") {
    // Calculate 15% taller than default size
    const desktopWidth = desktop.offsetWidth
    const desktopHeight = desktop.offsetHeight
    const winWidth = Math.min(desktopWidth * 0.65, 800)
    const defaultHeight = Math.min(desktopHeight * 0.65, 600)
    const winHeight = Math.floor(defaultHeight * 1.15) // 15% taller

    win.style.width = `${winWidth}px`
    win.style.height = `${winHeight}px`

    // Create window structure
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

    // Position the window manually
    const left = Math.max(0, (desktopWidth - winWidth) / 2)
    const top = Math.max(0, (desktopHeight - winHeight) / 2)

    win.style.left = `${left}px`
    win.style.top = `${top}px`
  }
  // Special case for Radio - use fixed size
  else if (id === "radio") {
    win.style.width = "320px"
    win.style.height = "220px"

    // Create window structure for Radio
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
      <div class="window-statusbar">Ready</div>
      <div class="window-resize"></div>
    `
  } else {
    // Default window structure for other windows
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
      <div class="window-statusbar">Ready</div>
      <div class="window-resize"></div>
    `
  }

  windowsContainer.appendChild(win)

  // Center the window in the visible area with responsive sizing
  if (id === "minesweeper") {
    // Position Minesweeper window in the center
    const desktopWidth = desktop.offsetWidth
    const desktopHeight = desktop.offsetHeight
    const winWidth = 340
    const winHeight = 380

    const left = Math.max(0, (desktopWidth - winWidth) / 2)
    const top = Math.max(0, (desktopHeight - winHeight) / 2)

    win.style.left = `${left}px`
    win.style.top = `${top}px`
  } else if (id === "space-invaders") {
    // Position Space Invaders window in the center
    const desktopWidth = desktop.offsetWidth
    const desktopHeight = desktop.offsetHeight
    const winWidth = Math.min(desktopWidth * 0.65, 800)
    const winHeight = Math.min(desktopHeight * 0.65, 600) * 1.15

    const left = Math.max(0, (desktopWidth - winWidth) / 2)
    const top = Math.max(0, (desktopHeight - winHeight) / 2)

    win.style.left = `${left}px`
    win.style.top = `${top}px`
  } else if (id === "radio") {
    // Position Radio window in the center
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

  // Create taskbar button
  createWindowButton(id, title, icon)

  // Add event listeners
  setupWindowEvents(win)

  // Activate the window
  activateWindow(win)

  // If this is the radio window, initialize the radio player
  if (id === "radio") {
    initializeRadioPlayer()
  }

  return win
}

// Setup window event listeners
function setupWindowEvents(win) {
  const titlebar = win.querySelector(".window-titlebar")
  const closeBtn = win.querySelector(".window-close")
  const minimizeBtn = win.querySelector(".window-minimize")
  const maximizeBtn = win.querySelector(".window-maximize")
  const resizeHandle = win.querySelector(".window-resize")
  const iframe = win.querySelector("iframe")

  // Activate window on click
  win.addEventListener("mousedown", () => {
    activateWindow(win)
  })

  // Close button
  closeBtn.addEventListener("click", () => {
    win.remove()
    const button = document.querySelector(`.window-button[data-id="${win.id}"]`)
    if (button) button.remove()
    if (activeWindow === win) activeWindow = null
  })

  // Minimize button
  minimizeBtn.addEventListener("click", () => {
    win.style.display = "none"
    const button = document.querySelector(`.window-button[data-id="${win.id}"]`)
    if (button) button.classList.remove("active")
  })

  // Maximize button (toggle between maximized and restored)
  let originalSize = { width: win.style.width, height: win.style.height, left: win.style.left, top: win.style.top }
  let isMaximized = false

  maximizeBtn.addEventListener("click", () => {
    if (!isMaximized) {
      // Save current size and position
      originalSize = {
        width: win.style.width,
        height: win.style.height,
        left: win.style.left,
        top: win.style.top,
      }

      // Maximize
      win.style.width = desktop.offsetWidth + "px"
      win.style.height = desktop.offsetHeight + "px"
      win.style.left = "0"
      win.style.top = "0"
      isMaximized = true
    } else {
      // Restore
      win.style.width = originalSize.width
      win.style.height = originalSize.height
      win.style.left = originalSize.left
      win.style.top = originalSize.top
      isMaximized = false
    }
  })

  // Double-click titlebar to maximize/restore
  titlebar.addEventListener("dblclick", () => {
    maximizeBtn.click()
  })

  // Dragging functionality
  titlebar.addEventListener("mousedown", (e) => {
    if (isMaximized) return // Don't allow dragging when maximized

    e.preventDefault()
    const rect = win.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    // Disable iframe pointer events while dragging
    if (iframe) iframe.style.pointerEvents = "none"

    const moveFn = throttle((e) => {
      win.style.left = e.clientX - offsetX + "px"
      win.style.top = e.clientY - offsetY + "px"
    }, 10)

    function onMouseUp() {
      document.removeEventListener("mousemove", moveFn)
      document.removeEventListener("mouseup", onMouseUp)

      // Re-enable iframe pointer events
      if (iframe) iframe.style.pointerEvents = "auto"

      // Ensure window is within viewport after dragging
      ensureWindowInViewport(win)
    }

    document.addEventListener("mousemove", moveFn)
    document.addEventListener("mouseup", onMouseUp)
  })

  // Resizing functionality
  resizeHandle.addEventListener("mousedown", (e) => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = Number.parseInt(win.style.width, 10) || win.offsetWidth
    const startHeight = Number.parseInt(win.style.height, 10) || win.offsetHeight

    // Disable iframe pointer events while resizing
    if (iframe) iframe.style.pointerEvents = "none"

    const resizeFn = throttle((e) => {
      let newWidth = startWidth + (e.clientX - startX)
      let newHeight = startHeight + (e.clientY - startY)

      // Enforce minimum dimensions
      newWidth = Math.max(newWidth, MIN_WIDTH)
      newHeight = Math.max(newHeight, MIN_HEIGHT)

      win.style.width = newWidth + "px"
      win.style.height = newHeight + "px"
    }, 10)

    function onMouseUp() {
      document.removeEventListener("mousemove", resizeFn)
      document.removeEventListener("mouseup", onMouseUp)

      // Re-enable iframe pointer events
      if (iframe) iframe.style.pointerEvents = "auto"

      // Ensure window is within viewport after resizing
      ensureWindowInViewport(win)
    }

    document.addEventListener("mousemove", resizeFn)
    document.addEventListener("mouseup", onMouseUp)
  })
}

// Initialize desktop icons
desktopIcons.forEach((icon) => {
  // Skip My Computer and Recycle Bin icons as they should do nothing
  if (icon.id === "my-computer" || icon.classList.contains("recycle-bin")) {
    icon.addEventListener("click", () => {
      // Just select the icon but don't open a window
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

  // Double-click handling
  let clickTimer = null
  icon.addEventListener("mousedown", () => {
    if (clickTimer === null) {
      clickTimer = setTimeout(() => {
        clickTimer = null
        // Single click - select icon
        desktopIcons.forEach((i) => i.classList.remove("selected"))
        icon.classList.add("selected")
      }, 200)
    } else {
      clearTimeout(clickTimer)
      clickTimer = null
      // Double click - open icon
      icon.click()
    }
  })
})

// Add selection rectangle functionality
let isSelecting = false
let startX, startY
let selectionRect = null

// Create selection rectangle
function createSelectionRectangle(x, y) {
  // Remove any existing selection rectangle first
  removeSelectionRectangle()

  selectionRect = document.createElement("div")
  selectionRect.className = "selection-rectangle"
  selectionRect.style.left = `${x}px`
  selectionRect.style.top = `${y}px`
  selectionRect.style.width = "0"
  selectionRect.style.height = "0"
  desktop.appendChild(selectionRect)
}

// Update selection rectangle
function updateSelectionRectangle(x, y) {
  if (!selectionRect) return

  const width = Math.abs(x - startX)
  const height = Math.abs(y - startY)

  // Determine the top-left corner based on drag direction
  const left = x < startX ? x : startX
  const top = y < startY ? y : startY

  selectionRect.style.left = `${left}px`
  selectionRect.style.top = `${top}px`
  selectionRect.style.width = `${width}px`
  selectionRect.style.height = `${height}px`
}

// Remove selection rectangle
function removeSelectionRectangle() {
  if (selectionRect) {
    selectionRect.remove()
    selectionRect = null
  }
}

// Handle desktop mouse events for selection rectangle
desktop.addEventListener("mousedown", (e) => {
  // Only proceed if clicking directly on the desktop or windows container
  // And only with left mouse button (button 0)
  if ((e.target === desktop || e.target === windowsContainer) && e.button === 0) {
    isSelecting = true
    startX = e.clientX
    startY = e.clientY
    createSelectionRectangle(startX, startY)

    // Clear icon selection
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

// Handle right-click to ensure selection rectangle is removed
desktop.addEventListener("contextmenu", (e) => {
  // Prevent default context menu
  e.preventDefault()

  // Ensure any existing selection rectangle is removed
  isSelecting = false
  removeSelectionRectangle()
})

// Add resize event listener to handle window resizing
window.addEventListener("resize", () => {
  const windows = document.querySelectorAll(".window")
  windows.forEach((win) => {
    ensureWindowInViewport(win)
  })
})

// Make the clock window draggable
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

      // Remove the bottom and right positioning when dragging
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

// Close clock window when clicking outside
document.addEventListener("mousedown", (e) => {
  if (clockWindow.style.display === "block" && !clockWindow.contains(e.target) && e.target !== clockElement) {
    clockWindow.style.display = "none"
  }
})

// Function to initialize the radio player
function initializeRadioPlayer() {
  // Audio setup
  const audio = new Audio()
  audio.src = "https://radiosource.atacko.cc/radio.mp3"
  audio.crossOrigin = "anonymous"
  audio.loop = true
  audio.volume = 0.5

  // DOM elements
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

  // Player state
  let isPlaying = false
  let isPaused = false
  let currentTime = 0
  let timer
  let isDraggingVolume = false

  // Update volume display
  function updateVolumeDisplay() {
    const volumePercent = Math.round(audio.volume * 100)
    volumeDisplay.textContent = `${volumePercent}%`

    // Update slider position
    const sliderTrackWidth = volumeSliderContainer.querySelector(".volume-slider-track").offsetWidth
    const thumbPosition = audio.volume * (sliderTrackWidth - volumeSliderThumb.offsetWidth)
    volumeSliderThumb.style.left = `${thumbPosition}px`
  }

  // Update time display
  function updateTimeDisplay() {
    if (isPlaying && !isPaused) {
      currentTime++
      const minutes = Math.floor(currentTime / 60)
      const seconds = currentTime % 60
      timeDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    }
  }

  // Start timer
  function startTimer() {
    timer = setInterval(updateTimeDisplay, 1000)
  }

  // Stop timer
  function stopTimer() {
    clearInterval(timer)
  }

  // Reset timer
  function resetTimer() {
    currentTime = 0
    timeDisplay.textContent = "0:00"
  }

  // Update player status
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

  // Play button click handler
  playButton.addEventListener("click", () => {
    if (!isPlaying || isPaused) {
      audio.play()
      isPlaying = true
      isPaused = false
      startTimer()
      updatePlayerStatus()
    }
  })

  // Stop button click handler
  stopButton.addEventListener("click", () => {
    audio.pause()
    audio.currentTime = 0
    isPlaying = false
    isPaused = false
    stopTimer()
    resetTimer()
    updatePlayerStatus()
  })

  // Pause button click handler
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

  // Previous button click handler (non-functional in this version)
  prevButton.addEventListener("click", function () {
    // This would typically go to the previous track
    // For now, just simulate a button press
    this.classList.add("active")
    setTimeout(() => this.classList.remove("active"), 200)
  })

  // Next button click handler (non-functional in this version)
  nextButton.addEventListener("click", function () {
    // This would typically go to the next track
    // For now, just simulate a button press
    this.classList.add("active")
    setTimeout(() => this.classList.remove("active"), 200)
  })

  // Volume button click handler
  volumeButton.addEventListener("click", () => {
    radioContainer.classList.toggle("volume-active")
    updateVolumeDisplay()
  })

  // Volume slider functionality
  volumeSliderThumb.addEventListener("mousedown", (e) => {
    e.preventDefault()
    isDraggingVolume = true

    // Calculate initial position
    const sliderTrack = volumeSliderContainer.querySelector(".volume-slider-track")
    const sliderRect = sliderTrack.getBoundingClientRect()
    const thumbWidth = volumeSliderThumb.offsetWidth

    function handleMouseMove(e) {
      if (isDraggingVolume) {
        const relativeX = Math.max(0, Math.min(e.clientX - sliderRect.left, sliderRect.width - thumbWidth))
        const newVolume = relativeX / (sliderRect.width - thumbWidth)

        // Set volume (0 to 1)
        audio.volume = Math.max(0, Math.min(1, newVolume))

        // Update display
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

  // Initialize
  updateVolumeDisplay()
  updatePlayerStatus()

  // Add button press effect
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
