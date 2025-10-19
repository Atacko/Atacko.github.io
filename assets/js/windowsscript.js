document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".btn")
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
  
    const header = document.querySelector(".header")
    if (header) {
      header.style.borderTop = "1px solid #ffffff"
      header.style.borderLeft = "1px solid #ffffff"
      header.style.borderRight = "1px solid #808080"
      header.style.borderBottom = "1px solid #808080"
    }
  
    const cards = document.querySelectorAll(".mod-card")
    cards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.borderColor = "#0000aa"
      })
  
      card.addEventListener("mouseleave", function () {
        this.style.borderColor = "#ffffff"
      })
    })
  })
  