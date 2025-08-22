class SpaceInvaders {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.width = canvas.width
    this.height = canvas.height

    this.gameState = "menu"
    this.score = 0
    this.hiScore = Number.parseInt(localStorage.getItem("spaceInvadersHiScore")) || 0
    this.lives = 3
    this.level = 1
    this.keys = {}
    this.bullets = []
    this.enemyBullets = []
    this.particles = []
    this.powerUps = []
    this.invaders = []
    this.barriers = []
    this.player = null
    this.ufo = null
    this.boss = null
    this.bossSpawnTimer = 0
    this.powerUpSpawnTimer = 0
    this.invaderDirection = 1
    this.invaderSpeed = 1
    this.invaderDropDistance = 20
    this.lastInvaderMoveTime = 0
    this.invaderMoveInterval = 500
    this.lastUfoSpawn = 0
    this.ufoSpawnInterval = 15000
    this.immortal = false
    this.inputSequence = ""
    this.alienShootTimer = 0
    this.alienShootInterval = 1000 + Math.random() * 2000
    this.immortalityTimer = 0

    this.sprites = this.initSprites()

    this.audioContext = null
    this.initAudio()

    this.setupEventListeners()
    this.updateUI()
    this.gameLoop()
  }

  initSprites() {
    return {
      // Player ship sprite - 11x8 pixels
      player: [
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],

      // Invader type 1 - top row alien
      invader1: [
        // Frame 1
        [
          [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
          [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
          [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
        ],
        // Frame 2
        [
          [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
          [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
          [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
          [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        ],
      ],

      // Invader type 2 - middle row alien
      invader2: [
        // Frame 1
        [
          [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
          [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
        ],
        // Frame 2
        [
          [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
          [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
        ],
      ],

      // Invader type 3 - bottom row alien
      invader3: [
        // Frame 1
        [
          [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
          [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
          [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        ],
        // Frame 2
        [
          [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
          [0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0],
          [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
        ],
      ],

      // UFO sprite - 16x8 pixels
      ufo: [
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 0], // 2 = blinking yellow pixels
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],

      // Boss sprite - 15x11 pixels
      boss1: [
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      ],

      boss2: [
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      ],

      boss3: [
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      ],

      boss4: [
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      ],
    }
  }

  playSound(frequency, duration, type = "square") {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      console.log("Audio not supported")
      this.audioContext = null
    }
  }

  init() {
    this.createPlayer()
    this.createInvaders()
    this.createBarriers()
  }

  createPlayer() {
    this.player = {
      x: this.width / 2 - 20,
      y: this.height - 60,
      width: 40,
      height: 20,
      speed: 5,
      shootCooldown: 0,
      powerUp: null,
      powerUpTimer: 0,
    }
  }

  createInvaders() {
    this.invaders = []
    const rows = this.level % 5 === 0 ? 0 : 5
    const cols = 11
    const invaderWidth = 30
    const invaderHeight = 20
    const spacing = 10
    const startX = (this.width - cols * (invaderWidth + spacing)) / 2
    const startY = 80

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let type = 0
        if (row === 0)
          type = 2
        else if (row <= 2) type = 1

        this.invaders.push({
          x: startX + col * (invaderWidth + spacing),
          y: startY + row * (invaderHeight + spacing),
          width: invaderWidth,
          height: invaderHeight,
          type: type,
          alive: true,
          animFrame: 0,
        })
      }
    }

    if (this.level % 5 === 0) {
      this.createBoss()
    }
  }

  createBoss() {
    const bossType = ((Math.floor(this.level / 5) - 1) % 4) + 1
    const difficultyMultiplier = Math.floor(this.level / 20) + 1

    this.boss = {
      x: this.width / 2 - 60,
      y: 100,
      width: 120,
      height: 80,
      health: (20 + this.level * 3) * difficultyMultiplier,
      maxHealth: (20 + this.level * 3) * difficultyMultiplier,
      speed: Math.min(2 + Math.floor(this.level / 10), 5),
      direction: 1,
      shootTimer: 0,
      pattern: 0,
      alive: true,
      type: bossType,
    }
  }

  createBarriers() {
    this.barriers = []
    const barrierCount = 4
    const barrierWidth = 60
    const barrierHeight = 40
    const spacing = (this.width - barrierCount * barrierWidth) / (barrierCount + 1)

    for (let i = 0; i < barrierCount; i++) {
      const barrier = {
        x: spacing + i * (barrierWidth + spacing),
        y: this.height - 200,
        width: barrierWidth,
        height: barrierHeight,
        pixels: this.createBarrierPixels(barrierWidth, barrierHeight),
      }

      this.barriers.push(barrier)
    }
  }

  createBarrierPixels(width, height) {
    const pixels = []
    const pixelSize = 2
    const cols = Math.floor(width / pixelSize)
    const rows = Math.floor(height / pixelSize)

    for (let row = 0; row < rows; row++) {
      pixels[row] = []
      for (let col = 0; col < cols; col++) {
        const centerX = cols / 2
        const centerY = rows / 2
        const distanceFromCenter = Math.sqrt((col - centerX) ** 2 + (row - centerY) ** 2)

        let isPixel = distanceFromCenter < cols * 0.4

        if (row > rows * 0.6 && Math.abs(col - centerX) < cols * 0.25) {
          isPixel = false
        }

        if (row < rows * 0.3 && Math.abs(col - centerX) < cols * 0.15) {
          isPixel = true
        }

        pixels[row][col] = isPixel ? 1 : 0
      }
    }

    return pixels
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true

      if (this.gameState === "playing") {
        // 666 easter egg
        if (e.key >= "0" && e.key <= "9") {
          this.inputSequence += e.key
          console.log("Number key pressed:", e.key, "Current sequence:", this.inputSequence)
          if (this.inputSequence.length > 3) {
            this.inputSequence = this.inputSequence.slice(-3)
            console.log("Sequence trimmed to:", this.inputSequence)
          }

          if (this.inputSequence === "666") {
            console.log("666 detected! Activating immortality")
            this.activateImmortality()
            this.inputSequence = ""
          }
        }
      }

      if (e.code === "Space") {
        e.preventDefault()
        if (this.gameState === "menu" || this.gameState === "gameOver" || this.gameState === "levelComplete") {
          this.startGame()
        } else if (this.gameState === "playing") {
          this.playerShoot()
        }
      }

      if (e.code === "KeyR") {
        this.resetGame()
      }

      if (e.code === "KeyP" && this.gameState === "playing") {
        this.pauseGame()
      } else if (e.code === "KeyP" && this.gameState === "paused") {
        this.resumeGame()
      }
    })

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false
    })

    document.addEventListener("touchstart", () => {
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume()
      }
    })
  }

  startGame() {
    if (this.gameState === "menu" || this.gameState === "gameOver") {
      this.score = 0
      this.lives = 3
      this.level = 1
    }

    this.gameState = "playing"
    this.bossLevel = this.level % 5 === 0
    this.bullets = []
    this.enemyBullets = []
    this.particles = []
    this.powerUps = []
    this.ufo = null
    this.boss = null

    this.createPlayer()
    this.createInvaders()
    this.createBarriers()

    this.immortal = false
    this.inputSequence = ""
    this.immortalityTimer = 0
    document.getElementById("immortalityMessage").style.display = "none"

    this.hideAllMenus()
    this.updateUI()
  }

  pauseGame() {
    this.gameState = "paused"
    document.getElementById("pauseMenu").style.display = "block"
    document.getElementById("gameOverlay").style.display = "flex"
  }

  resumeGame() {
    this.gameState = "playing"
    this.hideAllMenus()
  }

  gameOver() {
    this.gameState = "gameOver"
    document.getElementById("finalScore").textContent = `Final Score: ${this.score.toString().padStart(4, "0")}`
    document.getElementById("gameOverMenu").style.display = "block"
    document.getElementById("gameOverlay").style.display = "flex"

    if (this.score > this.hiScore) {
      this.hiScore = this.score
      localStorage.setItem("spaceInvadersHiScore", this.hiScore.toString())
    }

    this.playSound(200, 0.5, "sawtooth")
  }

  levelComplete() {
    this.gameState = "levelComplete"
    const bonus = this.lives * 100
    this.score += bonus

    document.getElementById("levelBonus").textContent = `Bonus: ${bonus}`
    document.getElementById("levelComplete").style.display = "block"
    document.getElementById("gameOverlay").style.display = "flex"

    this.level++
    this.playSound(800, 0.3)
  }

  hideAllMenus() {
    document.getElementById("gameOverlay").style.display = "none"
    document.getElementById("startMenu").style.display = "none"
    document.getElementById("gameOverMenu").style.display = "none"
    document.getElementById("pauseMenu").style.display = "none"
    document.getElementById("levelComplete").style.display = "none"
  }

  updateUI() {
    document.getElementById("score").textContent = this.score.toString().padStart(4, "0")
    document.getElementById("hiScore").textContent = this.hiScore.toString().padStart(4, "0")
    document.getElementById("level").textContent = this.level.toString()

    const livesContainer = document.getElementById("lives-container")
    livesContainer.innerHTML = ""
    for (let i = 0; i < this.lives; i++) {
      const lifeIcon = document.createElement("div")
      lifeIcon.className = "life-icon"
      livesContainer.appendChild(lifeIcon)
    }
  }

  update(deltaTime) {
    if (this.gameState !== "playing") return

    this.alienShootTimer += deltaTime
    if (this.alienShootTimer >= this.alienShootInterval) {
      if (this.invaders.some((inv) => inv.alive)) {
        this.invaderShoot()
      }
      if (this.boss && this.boss.alive && Math.random() < 0.3) {
        this.bossShoot()
      }
      this.alienShootTimer = 0
      this.alienShootInterval = 800 + Math.random() * 1500
    }

    this.updatePlayer(deltaTime)
    this.updateBullets(deltaTime)
    this.updateInvaders(deltaTime)
    this.updateBoss(deltaTime)
    this.updateUFO(deltaTime)
    this.updatePowerUps(deltaTime)
    this.updateParticles(deltaTime)
    this.checkCollisions()
    this.checkGameState()
  }

  updatePlayer(deltaTime) {
    if (this.keys["ArrowLeft"] && this.player.x > 0) {
      this.player.x -= this.player.speed
    }
    if (this.keys["ArrowRight"] && this.player.x < this.width - this.player.width) {
      this.player.x += this.player.speed
    }

    if (this.player.shootCooldown > 0) {
      this.player.shootCooldown -= deltaTime
    }

    if (this.player.powerUpTimer > 0) {
      this.player.powerUpTimer -= deltaTime
      if (this.player.powerUpTimer <= 0) {
        this.player.powerUp = null
      }
    }
  }

  updateBullets(deltaTime) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i]
      bullet.y -= bullet.speed

      if (bullet.y < 0) {
        this.bullets.splice(i, 1)
      }
    }

    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i]
      bullet.y += bullet.speed

      if (bullet.y > this.height) {
        this.enemyBullets.splice(i, 1)
      }
    }
  }

  updateInvaders(deltaTime) {
    if (this.invaders.length === 0 || this.level % 5 === 0) return

    this.lastInvaderMoveTime += deltaTime

    if (this.lastInvaderMoveTime > this.invaderMoveInterval) {
      let shouldDrop = false
      for (const invader of this.invaders) {
        if (!invader.alive) continue

        invader.x += this.invaderDirection * this.invaderSpeed
        invader.animFrame = (invader.animFrame + deltaTime * 0.002) % 2

        if (invader.x <= 0 || invader.x >= this.width - invader.width) {
          shouldDrop = true
        }
      }

      if (shouldDrop) {
        this.invaderDirection *= -1
        for (const invader of this.invaders) {
          if (invader.alive) {
            invader.y += this.invaderDropDistance
          }
        }
        this.lastInvaderMoveTime = 0
      }
    }
  }

  updateBoss(deltaTime) {
    if (!this.boss || !this.boss.alive) return

    this.boss.x += this.boss.direction * this.boss.speed
    if (this.boss.x <= 0 || this.boss.x >= this.width - this.boss.width) {
      this.boss.direction *= -1
    }

    this.boss.shootTimer += deltaTime
    if (this.boss.shootTimer > 800) {
      this.bossShoot()
      this.boss.shootTimer = 0
    }
  }

  updateUFO(deltaTime) {
    this.lastUfoSpawn += deltaTime

    if (!this.ufo && this.lastUfoSpawn > this.ufoSpawnInterval) {
      this.createUFO()
      this.lastUfoSpawn = 0
    }

    if (this.ufo) {
      this.ufo.x += this.ufo.speed
      if (this.ufo.x > this.width + 50 || this.ufo.x < -50) {
        this.ufo = null
      }
    }
  }

  updatePowerUps(deltaTime) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i]
      powerUp.y += powerUp.speed
      powerUp.rotation += deltaTime * 0.005

      if (powerUp.y > this.height) {
        this.powerUps.splice(i, 1)
      }
    }
  }

  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life -= deltaTime

      if (particle.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  playerShoot() {
    if (this.player.shootCooldown > 0) return

    const bulletCount = this.player.powerUp === "multiShot" ? 3 : 1
    const bulletSpeed = this.player.powerUp === "rapidFire" ? 12 : 8

    for (let i = 0; i < bulletCount; i++) {
      const angle = bulletCount === 1 ? 0 : (i - 1) * 0.3
      this.bullets.push({
        x: this.player.x + 11 - 2,
        y: this.player.y,
        width: 4,
        height: 10,
        speed: bulletSpeed,
        angle: angle,
      })
    }

    this.player.shootCooldown = this.player.powerUp === "rapidFire" ? 100 : 200
    this.playSound(800, 0.1)
  }

  invaderShoot() {
    const aliveInvaders = this.invaders.filter((inv) => inv.alive)
    if (aliveInvaders.length === 0) return

    const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)]
    this.enemyBullets.push({
      x: shooter.x + shooter.width / 2 - 2,
      y: shooter.y + shooter.height,
      width: 4,
      height: 10,
      speed: 3,
    })

    this.playSound(300, 0.1)
  }

  bossShoot() {
    const patterns = [
      () => {
        this.enemyBullets.push({
          x: this.boss.x + this.boss.width / 2 - 2,
          y: this.boss.y + this.boss.height,
          width: 6,
          height: 12,
          speed: 4,
        })
      },
      () => {
        for (let i = -1; i <= 1; i++) {
          this.enemyBullets.push({
            x: this.boss.x + this.boss.width / 2 - 2 + i * 20,
            y: this.boss.y + this.boss.height,
            width: 6,
            height: 12,
            speed: 4,
          })
        }
      },
      () => {
        for (let i = 0; i < 5; i++) {
          const angle = (i - 2) * 0.5
          this.enemyBullets.push({
            x: this.boss.x + this.boss.width / 2 - 2,
            y: this.boss.y + this.boss.height,
            width: 6,
            height: 12,
            speed: 4,
            angle: angle,
          })
        }
      },
    ]

    patterns[this.boss.pattern % patterns.length]()
    this.boss.pattern++
    this.playSound(250, 0.2)
  }

  createUFO() {
    this.ufo = {
      x: Math.random() > 0.5 ? -50 : this.width + 50,
      y: 50,
      width: 50,
      height: 20,
      speed: Math.random() > 0.5 ? 2 : -2,
      points: [50, 100, 150, 300][Math.floor(Math.random() * 4)],
    }
  }

  createPowerUp(x, y) {
    if (Math.random() < 0.03) {
      const types = ["rapidFire", "multiShot", "shield"]
      this.powerUps.push({
        x: x,
        y: y,
        width: 20,
        height: 20,
        speed: 2,
        type: types[Math.floor(Math.random() * types.length)],
        rotation: 0,
      })
    }
  }

  createExplosion(x, y, color = "#ffff00") {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 500,
        color: color,
      })
    }
  }

  checkCollisions() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i]

      for (const invader of this.invaders) {
        if (invader.alive && this.isColliding(bullet, invader)) {
          this.bullets.splice(i, 1)
          invader.alive = false

          const points = [10, 20, 30][invader.type]
          this.score += points

          this.createExplosion(invader.x + invader.width / 2, invader.y + invader.height / 2)
          this.createPowerUp(invader.x, invader.y)
          this.playSound(400, 0.2)
          break
        }
      }

      if (this.boss && this.boss.alive && this.isColliding(bullet, this.boss)) {
        this.bullets.splice(i, 1)
        this.boss.health--
        this.score += 10

        this.createExplosion(bullet.x, bullet.y, "#ff4444")
        this.playSound(600, 0.1)

        if (this.boss.health <= 0) {
          this.boss.alive = false
          this.score += 500
          this.createExplosion(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, "#ff0000")
          this.playSound(200, 1, "sawtooth")
        }
      }

      if (this.ufo && this.isColliding(bullet, this.ufo)) {
        this.bullets.splice(i, 1)
        this.score += this.ufo.points
        this.createExplosion(this.ufo.x + this.ufo.width / 2, this.ufo.y + this.ufo.height / 2, "#00ffff")
        this.playSound(1000, 0.3)
        this.ufo = null
      }

      this.checkBulletBarrierCollision(bullet, i, this.bullets)
    }

    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i]

      if (this.isColliding(bullet, this.player)) {
        this.enemyBullets.splice(i, 1)
        this.playerHit()
        continue
      }

      this.checkBulletBarrierCollision(bullet, i, this.enemyBullets)
    }

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i]
      if (this.isColliding(this.player, powerUp)) {
        this.powerUps.splice(i, 1)
        this.player.powerUp = powerUp.type
        this.player.powerUpTimer = 10000
        this.playSound(1200, 0.2)

        this.showPowerUpNotification(powerUp.type)
      }
    }

    // Check if invaders reached player
    for (const invader of this.invaders) {
      if (invader.alive && invader.y + invader.height >= this.player.y) {
        this.gameOver()
        return
      }
    }
  }

  checkBulletBarrierCollision(bullet, bulletIndex, bulletArray) {
    for (const barrier of this.barriers) {
      const pixelSize = 2
      const cols = Math.floor(barrier.width / pixelSize)
      const rows = Math.floor(barrier.height / pixelSize)

      const relativeX = bullet.x - barrier.x
      const relativeY = bullet.y - barrier.y

      if (relativeX >= 0 && relativeX < barrier.width && relativeY >= 0 && relativeY < barrier.height) {
        const pixelCol = Math.floor(relativeX / pixelSize)
        const pixelRow = Math.floor(relativeY / pixelSize)

        if (pixelRow >= 0 && pixelRow < rows && pixelCol >= 0 && pixelCol < cols) {
          if (barrier.pixels[pixelRow] && barrier.pixels[pixelRow][pixelCol]) {
            bulletArray.splice(bulletIndex, 1)

            this.damageBarrier(barrier, pixelCol, pixelRow, cols, rows)
            return true
          }
        }
      }
    }
    return false
  }

  playerHit() {
    console.log("Player hit! Immortal:", this.immortal)
    if (this.immortal) {
      console.log("Hit blocked by immortality!")
      return
    }

    this.lives--
    this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, "#ff0000")
    this.playSound(150, 0.5, "sawtooth")

    if (this.lives <= 0) {
      this.gameOver()
    } else {
      this.player.x = this.width / 2 - 20
      this.player.powerUp = null
      this.player.powerUpTimer = 0
    }
  }

  isColliding(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    )
  }

  checkGameState() {
    const aliveInvaders = this.invaders.filter((inv) => inv.alive)

    if (this.level % 5 === 0) {
      if (!this.boss || !this.boss.alive) {
        this.levelComplete()
      }
    } else if (aliveInvaders.length === 0) {
      this.levelComplete()
    }
  }

  render() {
    this.ctx.fillStyle = "#000"
    this.ctx.fillRect(0, 0, this.width, this.height)

    if (this.gameState === "playing") {
      this.renderPlayer()
      this.renderBullets()
      this.renderInvaders()
      this.renderBoss()
      this.renderUFO()
      this.renderBarriers()
      this.renderPowerUps()
      this.renderParticles()
      this.renderUI()
    }
  }

  renderPlayer() {
    const powerUpColors = {
      rapidFire: "#ff4444",
      multiShot: "#4444ff",
      shield: "#44ff44",
    }
    const color = this.player.powerUp ? powerUpColors[this.player.powerUp] || "#ffff00" : "#00ff00"
    this.renderSprite(this.sprites.player, this.player.x, this.player.y, 2, color)

    // Power-up indicator (shield line)
    if (this.player.powerUp) {
      const spriteWidth = 22 // 11 pixels * 2 scale
      const shieldX = this.player.x + (spriteWidth - 26) / 2
      this.ctx.fillStyle = powerUpColors[this.player.powerUp] || "#ffff00"
      this.ctx.fillRect(shieldX, this.player.y - 5, 26, 2)
    }
  }

  renderBullets() {
    // Player bullets
    this.ctx.fillStyle = "#ffff00"
    for (const bullet of this.bullets) {
      if (bullet.angle) {
        this.ctx.save()
        this.ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2)
        this.ctx.rotate(bullet.angle)
        this.ctx.fillRect(-bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height)
        this.ctx.restore()
      } else {
        this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
      }
    }

    // Enemy bullets
    this.ctx.fillStyle = "#ff4444"
    for (const bullet of this.enemyBullets) {
      if (bullet.angle) {
        this.ctx.save()
        this.ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2)
        this.ctx.rotate(bullet.angle)
        this.ctx.fillRect(-bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height)
        this.ctx.restore()
      } else {
        this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
      }
    }
  }

  renderInvaders() {
    for (const invader of this.invaders) {
      if (!invader.alive) continue

      const colors = ["#00ff00", "#ffff00", "#ff4444"]
      const spriteNames = ["invader3", "invader2", "invader1"]

      const spriteName = spriteNames[invader.type]
      const frame = Math.floor(invader.animFrame)
      const sprite = this.sprites[spriteName][frame]

      this.renderSprite(sprite, invader.x, invader.y, 2, colors[invader.type])
    }
  }

  renderBoss() {
    if (!this.boss || !this.boss.alive) return

    const bossSprites = [this.sprites.boss1, this.sprites.boss2, this.sprites.boss3, this.sprites.boss4]

    const currentBossSprite = bossSprites[this.boss.type - 1]
    this.renderSprite(currentBossSprite, this.boss.x, this.boss.y, 5, "#ff0000")

    const spriteVisualWidth = 15 * 5
    const healthBarWidth = spriteVisualWidth
    const healthPercent = this.boss.health / this.boss.maxHealth
    const healthBarX = this.boss.x + (spriteVisualWidth - healthBarWidth) / 2

    this.ctx.fillStyle = "#333"
    this.ctx.fillRect(healthBarX, this.boss.y - 15, healthBarWidth, 8)
    this.ctx.fillStyle = healthPercent > 0.5 ? "#00ff00" : healthPercent > 0.25 ? "#ffff00" : "#ff0000"
    this.ctx.fillRect(healthBarX, this.boss.y - 15, healthBarWidth * healthPercent, 8)
  }

  renderUFO() {
    if (!this.ufo) return

    this.renderSprite(this.sprites.ufo, this.ufo.x, this.ufo.y, 2, "#00ffff")
  }

  renderBarriers() {
    this.ctx.fillStyle = "#00ff00"
    for (const barrier of this.barriers) {
      const pixelSize = 2
      for (let row = 0; row < barrier.pixels.length; row++) {
        for (let col = 0; col < barrier.pixels[row].length; col++) {
          if (barrier.pixels[row][col]) {
            this.ctx.fillRect(barrier.x + col * pixelSize, barrier.y + row * pixelSize, pixelSize, pixelSize)
          }
        }
      }
    }
  }

  renderPowerUps() {
    for (const powerUp of this.powerUps) {
      this.ctx.save()
      this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2)
      this.ctx.rotate(powerUp.rotation)

      const colors = {
        rapidFire: "#ff4444",
        multiShot: "#4444ff",
        shield: "#44ff44",
      }

      this.ctx.fillStyle = colors[powerUp.type]
      this.ctx.fillRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height)

      this.ctx.restore()
    }
  }

  renderParticles() {
    for (const particle of this.particles) {
      this.ctx.fillStyle = particle.color
      this.ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2)
    }
  }

  renderUI() {
    if (this.player.powerUp && this.player.powerUpTimer > 0) {
      const timerWidth = 200
      const timerHeight = 8
      const timerX = this.width / 2 - timerWidth / 2
      const timerY = this.height - 15

      const powerUpColors = {
        rapidFire: "#ff4444",
        multiShot: "#4444ff",
        shield: "#44ff44",
      }
      const powerUpColor = powerUpColors[this.player.powerUp] || "#ffff00"

      this.ctx.fillStyle = "#333"
      this.ctx.fillRect(timerX, timerY, timerWidth, timerHeight)
      this.ctx.fillStyle = powerUpColor
      this.ctx.fillRect(timerX, timerY, timerWidth * (this.player.powerUpTimer / 10000), timerHeight)

      this.ctx.fillStyle = powerUpColor
      this.ctx.font = "12px monospace"
      this.ctx.textAlign = "center"
      this.ctx.fillText(this.player.powerUp.toUpperCase(), this.width / 2, timerY - 10)
    }

    if (this.powerUpNotification && this.powerUpNotification.timer > 0) {
      this.ctx.fillStyle = this.powerUpNotification.color
      this.ctx.font = "16px monospace"
      this.ctx.textAlign = "center"
      this.ctx.fillText(this.powerUpNotification.text, this.width / 2, this.powerUpNotification.y)
      this.powerUpNotification.timer -= 16
    }
  }

  gameLoop(currentTime = 0) {
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()
    this.updateUI()

    requestAnimationFrame((time) => this.gameLoop(time))
  }

  renderSprite(sprite, x, y, scale = 2, color = "#00ff00") {
    for (let row = 0; row < sprite.length; row++) {
      for (let col = 0; col < sprite[row].length; col++) {
        if (sprite[row][col] === 1) {
          this.ctx.fillStyle = color
          this.ctx.fillRect(x + col * scale, y + row * scale, scale, scale)
        } else if (sprite[row][col] === 2) {
          this.ctx.fillStyle = Math.floor(Date.now() / 200) % 2 ? "#ffff00" : color
          this.ctx.fillRect(x + col * scale, y + row * scale, scale, scale)
        }
      }
    }
  }

  damageBarrier(barrier, centerCol, centerRow, cols, rows) {
    const damageRadius = 3

    for (let row = Math.max(0, centerRow - damageRadius); row <= Math.min(rows - 1, centerRow + damageRadius); row++) {
      for (
        let col = Math.max(0, centerCol - damageRadius);
        col <= Math.min(cols - 1, centerCol + damageRadius);
        col++
      ) {
        const distance = Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2)

        if (distance <= damageRadius) {
          const destructionChance = 1 - (distance / damageRadius) * 0.7
          if (Math.random() < destructionChance) {
            if (barrier.pixels[row]) {
              barrier.pixels[row][col] = false
            }
          }
        }
      }
    }
  }

  activateImmortality() {
    console.log("Activating permanent immortality")
    this.immortal = true

    const overlayEl = document.getElementById("gameOverlay")
    const messageEl = document.getElementById("immortalityMessage")

    overlayEl.style.display = "flex"
    messageEl.style.display = "block"
    this.playSound(1000, 0.3, "sine")

    setTimeout(() => {
      messageEl.style.display = "none"
      overlayEl.style.display = "none"
    }, 4000)
  }

  resetGame() {
    this.gameState = "menu"
    this.score = 0
    this.lives = 3
    this.level = 1
    this.immortal = false
    this.inputSequence = ""
    this.bullets = []
    this.enemyBullets = []
    this.particles = []
    this.powerUps = []
    this.ufo = null
    this.boss = null
    this.invaders = []
    this.barriers = []

    document.getElementById("immortalityMessage").style.display = "none"

    this.hideAllMenus()
    document.getElementById("startMenu").style.display = "block"
    document.getElementById("gameOverlay").style.display = "flex"

    this.updateUI()
  }

  showPowerUpNotification(type) {
    const powerUpColors = {
      rapidFire: "#ff4444",
      multiShot: "#4444ff",
      shield: "#44ff44",
    }

    this.powerUpNotification = {
      text: type.toUpperCase() + " ACTIVATED!",
      timer: 2000,
      y: 80,
      color: powerUpColors[type] || "#ffff00",
    }
  }
}

window.addEventListener("load", () => {
  const canvas = document.getElementById("gameCanvas")
  new SpaceInvaders(canvas)
})
