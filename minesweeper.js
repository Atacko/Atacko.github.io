const GAME_CONFIG = {
    beginner: {
      rows: 9,
      cols: 9,
      mines: 10,
    },
    intermediate: {
      rows: 16,
      cols: 16,
      mines: 40,
    },
    expert: {
      rows: 16,
      cols: 30,
      mines: 99,
    },
  }
  
  let gameState = {
    board: [],
    mineLocations: [],
    flaggedCells: [],
    questionCells: [],
    uncoveredCells: [],
    gameOver: false,
    gameWon: false,
    difficulty: "beginner",
    timer: 0,
    timerInterval: null,
    minesRemaining: 0,
  }

  const gameBoard = document.getElementById("game-board")
  const face = document.getElementById("face")
  const mineHundreds = document.getElementById("mine-hundreds")
  const mineTens = document.getElementById("mine-tens")
  const mineOnes = document.getElementById("mine-ones")
  const timerHundreds = document.getElementById("timer-hundreds")
  const timerTens = document.getElementById("timer-tens")
  const timerOnes = document.getElementById("timer-ones")
  
  function initGame(difficulty = "beginner") {
    gameState = {
      board: [],
      mineLocations: [],
      flaggedCells: [],
      questionCells: [],
      uncoveredCells: [],
      gameOver: false,
      gameWon: false,
      difficulty: difficulty,
      timer: 0,
      timerInterval: null,
      minesRemaining: GAME_CONFIG[difficulty].mines,
    }
  
    gameBoard.innerHTML = ""
  
    const { rows, cols } = GAME_CONFIG[difficulty]
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`
  
    createBoard()
  
    placeMines()
  
    calculateNumbers()
  
    updateMineCounter()
  
    resetTimer()
  
    face.textContent = "😊"
  }
  
  function createBoard() {
    const { rows, cols } = GAME_CONFIG[gameState.difficulty]
  
    gameState.board = Array(rows)
      .fill()
      .map(() => Array(cols).fill(0))
  
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = document.createElement("div")
        cell.className = "cell cell-covered"
        cell.dataset.row = row
        cell.dataset.col = col
  
        cell.addEventListener("mousedown", handleMouseDown)
        cell.addEventListener("mouseup", handleMouseUp)
        cell.addEventListener("contextmenu", handleRightClick)
  
        gameBoard.appendChild(cell)
      }
    }
  }
  
  function placeMines() {
    const { rows, cols, mines } = GAME_CONFIG[gameState.difficulty]
    const totalCells = rows * cols
  
    while (gameState.mineLocations.length < mines) {
      const randomPos = Math.floor(Math.random() * totalCells)
      const row = Math.floor(randomPos / cols)
      const col = randomPos % cols
  
      const posKey = `${row},${col}`
      if (!gameState.mineLocations.includes(posKey)) {
        gameState.mineLocations.push(posKey)
        gameState.board[row][col] = -1
      }
    }
  }
  
  function calculateNumbers() {
    const { rows, cols } = GAME_CONFIG[gameState.difficulty]
  
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (gameState.board[row][col] === -1) continue
  
        let count = 0
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
            if (gameState.board[r][c] === -1) count++
          }
        }
  
        gameState.board[row][col] = count
      }
    }
  }
  
  function handleMouseDown(e) {
    if (gameState.gameOver) return
  
    if (e.button === 0) {
      face.textContent = "😮"
    }
  }
  
  function handleMouseUp(e) {
    if (gameState.gameOver) return
  
    face.textContent = "😊"
  
    if (e.button === 0) {
      const row = Number.parseInt(this.dataset.row)
      const col = Number.parseInt(this.dataset.col)
  
      if (gameState.uncoveredCells.length === 0) {
        startTimer()
      }
  
      const posKey = `${row},${col}`
      if (gameState.flaggedCells.includes(posKey) || gameState.questionCells.includes(posKey)) {
        return
      }
  
      uncoverCell(row, col)
    }
  }
  
  function handleRightClick(e) {
    e.preventDefault()
    if (gameState.gameOver) return
  
    const row = Number.parseInt(this.dataset.row)
    const col = Number.parseInt(this.dataset.col)
    const posKey = `${row},${col}`
  
    if (gameState.uncoveredCells.includes(posKey)) {
      return
    }
  
    if (
      gameState.uncoveredCells.length === 0 &&
      gameState.flaggedCells.length === 0 &&
      gameState.questionCells.length === 0
    ) {
      startTimer()
    }
  
    if (gameState.flaggedCells.includes(posKey)) {
      gameState.flaggedCells = gameState.flaggedCells.filter((pos) => pos !== posKey)
      gameState.questionCells.push(posKey)
      this.classList.remove("cell-flagged")
      this.classList.add("cell-question")
      gameState.minesRemaining++
    } else if (gameState.questionCells.includes(posKey)) {
      gameState.questionCells = gameState.questionCells.filter((pos) => pos !== posKey)
      this.classList.remove("cell-question")
    } else {
      gameState.flaggedCells.push(posKey)
      this.classList.add("cell-flagged")
      gameState.minesRemaining--
    }
  
    updateMineCounter()
  }
  
  function uncoverCell(row, col) {
    const { rows, cols } = GAME_CONFIG[gameState.difficulty]
    const posKey = `${row},${col}`
  
    if (gameState.uncoveredCells.includes(posKey)) {
      return
    }
  
    gameState.uncoveredCells.push(posKey)
  
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)
  
    cell.classList.remove("cell-covered")
    cell.classList.add("cell-uncovered")
  
    if (gameState.board[row][col] === -1) {
      gameOver(false)
      cell.classList.add("cell-mine")
      return
    }

    if (gameState.board[row][col] > 0) {
      cell.textContent = gameState.board[row][col]
      cell.classList.add(`cell-${gameState.board[row][col]}`)
    }

    if (gameState.board[row][col] === 0) {
      for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
          if (r !== row || c !== col) {
            uncoverCell(r, c)
          }
        }
      }
    }
  
    checkWin()
  }
  
  function checkWin() {
    const { rows, cols, mines } = GAME_CONFIG[gameState.difficulty]
    const totalCells = rows * cols
  
    if (gameState.uncoveredCells.length === totalCells - mines) {
      gameOver(true)
    }
  }
  
  function gameOver(isWin) {
    gameState.gameOver = true
    gameState.gameWon = isWin
  
    clearInterval(gameState.timerInterval)
  
    face.textContent = isWin ? "😎" : "😵"
  
    if (!isWin) {
      revealAllMines()
    } else {
      flagAllMines()
    }
  }
  
  function revealAllMines() {
    gameState.mineLocations.forEach((posKey) => {
      const [row, col] = posKey.split(",").map(Number)
      const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)
  
      if (gameState.flaggedCells.includes(posKey)) {
        return
      }
  
      cell.classList.remove("cell-covered")
      cell.classList.add("cell-uncovered", "cell-mine")
    })

    gameState.flaggedCells.forEach((posKey) => {
      if (!gameState.mineLocations.includes(posKey)) {
        const [row, col] = posKey.split(",").map(Number)
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)
  
        cell.classList.remove("cell-covered", "cell-flagged")
        cell.classList.add("cell-uncovered")
        cell.textContent = "❌"
      }
    })
  }
  
  function flagAllMines() {
    gameState.mineLocations.forEach((posKey) => {
      if (!gameState.flaggedCells.includes(posKey)) {
        const [row, col] = posKey.split(",").map(Number)
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)
  
        cell.classList.add("cell-flagged")
        gameState.flaggedCells.push(posKey)
      }
    })
  
    gameState.minesRemaining = 0
    updateMineCounter()
  }
  
  function startTimer() {
    gameState.timerInterval = setInterval(() => {
      gameState.timer++
      updateTimer()
  
      if (gameState.timer >= 999) {
        clearInterval(gameState.timerInterval)
      }
    }, 1000)
  }

  function resetTimer() {
    clearInterval(gameState.timerInterval)
    gameState.timer = 0
    updateTimer()
  }
  
  function updateTimer() {
    const hundreds = Math.floor(gameState.timer / 100)
    const tens = Math.floor((gameState.timer % 100) / 10)
    const ones = gameState.timer % 10
  
    timerHundreds.textContent = hundreds
    timerTens.textContent = tens
    timerOnes.textContent = ones
  }
  
  function updateMineCounter() {
    const mines = gameState.minesRemaining
    const hundreds = Math.floor(Math.abs(mines) / 100)
    const tens = Math.floor((Math.abs(mines) % 100) / 10)
    const ones = Math.abs(mines) % 10
  
    mineHundreds.textContent = mines < 0 ? "-" : hundreds
    mineTens.textContent = tens
    mineOnes.textContent = ones
  }
  
  face.addEventListener("click", () => {
    initGame(gameState.difficulty)
  })
  
  gameBoard.addEventListener("contextmenu", (e) => e.preventDefault())
  
  initGame()
  