const ASCII_CHARS = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ","]
const html2canvas = window.html2canvas

let currentImageData = null
let generatedOutput = null

const imageInput = document.getElementById("imageInput")
const widthInput = document.getElementById("widthInput")
const textColorInput = document.getElementById("textColorInput")
const bgColorInput = document.getElementById("bgColorInput")
const invertCheckbox = document.getElementById("invertCheckbox")
const contrastCheckbox = document.getElementById("contrastCheckbox")
const artType = document.getElementById("artType")
const generateBtn = document.getElementById("generateBtn")
const downloadBtn = document.getElementById("downloadBtn")
const downloadPngBtn = document.getElementById("downloadPngBtn")
const htmlDownloadPngBtn = document.getElementById("htmlDownloadPngBtn")
const fullscreenBtn = document.getElementById("fullscreenBtn")
const asciiPreview = document.getElementById("asciiPreview")
const previewContainer = document.getElementById("previewContainer")
const imagePreviewThumb = document.querySelector(".image-preview-thumb")
const htmlOptionsContainer = document.getElementById("htmlOptionsContainer")
const colorOptionsContainer = document.getElementById("colorOptionsContainer")
const charactersInput = document.getElementById("charactersInput")
const randomizeCheckbox = document.getElementById("randomizeCheckbox")
const fontSizeSelect = document.getElementById("fontSizeSelect")

function resetToDefaults() {
  imageInput.value = ""
  widthInput.value = "80"
  textColorInput.value = "#ffffff"
  bgColorInput.value = "#000000"
  invertCheckbox.checked = false
  contrastCheckbox.checked = false
  artType.value = "ascii"
  fontSizeSelect.value = "medium"
  charactersInput.value = "01"
  randomizeCheckbox.checked = false
  imagePreviewThumb.innerHTML = ""
  currentImageData = null
  generatedOutput = null
  asciiPreview.textContent = 'Click "Generate ASCII Art" to see preview...'
}

resetToDefaults()

function updateButtonStates() {
  if (artType.value === "html") {
    downloadBtn.textContent = "Download as HTML"
    downloadPngBtn.style.display = "none"
    htmlDownloadPngBtn.style.display = "inline-block"
    fullscreenBtn.style.display = "inline-block"
    htmlOptionsContainer.style.display = "block"
    colorOptionsContainer.style.display = "none"
  } else {
    downloadBtn.textContent = "Download as .txt"
    downloadPngBtn.style.display = "inline-block"
    htmlDownloadPngBtn.style.display = "none"
    fullscreenBtn.style.display = "none"
    htmlOptionsContainer.style.display = "none"
    colorOptionsContainer.style.display = "block"
  }
}

updateButtonStates()

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      imagePreviewThumb.innerHTML = ""
      const thumbImg = img.cloneNode()
      thumbImg.style.maxWidth = "100%"
      thumbImg.style.maxHeight = "100%"
      thumbImg.style.objectFit = "contain"
      imagePreviewThumb.appendChild(thumbImg)

      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0)
      currentImageData = ctx.getImageData(0, 0, img.width, img.height)
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(file)
})

function getGrayscale(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function resizeImage(imageData, newWidth) {
  const originalWidth = imageData.width
  const originalHeight = imageData.height
  const aspectRatio = originalHeight / originalWidth
  const newHeight = Math.floor(newWidth * aspectRatio * 0.55)

  const canvas = document.createElement("canvas")
  canvas.width = originalWidth
  canvas.height = originalHeight
  const ctx = canvas.getContext("2d")
  ctx.putImageData(imageData, 0, 0)

  const tempCanvas = document.createElement("canvas")
  tempCanvas.width = newWidth
  tempCanvas.height = newHeight
  const tempCtx = tempCanvas.getContext("2d")
  tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight)

  return tempCtx.getImageData(0, 0, newWidth, newHeight)
}

function brightnessToChar(brightness, isHtml = false) {
  let chars = ASCII_CHARS

  if (isHtml) {
    chars = charactersInput.value.split("")
    if (randomizeCheckbox.checked) {
      chars = [...chars].sort(() => Math.random() - 0.5)
    }
  }

  const index = Math.floor((brightness / 255) * (chars.length - 1))
  return chars[index]
}

function generateASCII() {
  if (!currentImageData) {
    asciiPreview.textContent = "Please select an image first!"
    downloadBtn.disabled = true
    downloadPngBtn.disabled = true
    htmlDownloadPngBtn.disabled = true
    fullscreenBtn.disabled = true
    return
  }

  const width = Number.parseInt(widthInput.value)
  const invert = invertCheckbox.checked
  const contrast = contrastCheckbox.checked
  const isHtml = artType.value === "html"

  const resized = resizeImage(currentImageData, width)
  const data = resized.data
  const resizedWidth = resized.width
  const resizedHeight = resized.height

  let ascii = ""
  let htmlContent = ""

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    let gray = getGrayscale(r, g, b)

    if (contrast) {
      gray = gray < 128 ? Math.max(0, gray - 30) : Math.min(255, gray + 30)
    }

    if (invert) {
      gray = 255 - gray
    }

    const char = brightnessToChar(gray, isHtml)

    if (isHtml) {
      const rgb = `rgb(${r}, ${g}, ${b})`
      htmlContent += `<span style="color: ${rgb};">${escapeHtml(char)}</span>`
    } else {
      ascii += char
    }

    if ((i / 4 + 1) % resizedWidth === 0) {
      if (isHtml) {
        htmlContent += "<br>"
      } else {
        ascii += "\n"
      }
    }
  }

  generatedOutput = isHtml ? htmlContent : ascii

  if (isHtml) {
    displayHTMLPreview(htmlContent)
  } else {
    displayASCIIPreview(ascii)
  }

  downloadBtn.disabled = false
  downloadPngBtn.disabled = false
  htmlDownloadPngBtn.disabled = false
  fullscreenBtn.disabled = false
}

function displayASCIIPreview(ascii) {
  asciiPreview.innerHTML = ""
  asciiPreview.textContent = ascii
  previewContainer.style.backgroundColor = bgColorInput.value
  previewContainer.style.color = textColorInput.value
}

function displayHTMLPreview(htmlContent) {
  const fontSize = {
    smallest: "6px",
    small: "8px",
    medium: "10px",
    large: "12px",
    largest: "14px",
  }[fontSizeSelect.value]

  const html = `<pre style="background-color: ${bgColorInput.value}; color: white; margin: 0; padding: 8px; font-family: 'Courier New', monospace; font-size: ${fontSize}; line-height: 1;">${htmlContent}</pre>`
  asciiPreview.innerHTML = html
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

function downloadAsPNG() {
  if (!generatedOutput) return

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  const fontSize = 10
  const charWidth = 6
  const charHeight = fontSize + 2

  const lines = generatedOutput.split("\n")
  const maxWidth = Math.max(...lines.map((l) => l.length))

  canvas.width = maxWidth * charWidth + 16
  canvas.height = lines.length * charHeight + 16

  ctx.fillStyle = bgColorInput.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = `${fontSize}px "Courier New", monospace`
  ctx.fillStyle = textColorInput.value

  lines.forEach((line, i) => {
    ctx.fillText(line, 8, 8 + (i + 1) * charHeight)
  })

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "ascii-art.png"
    link.click()
    URL.revokeObjectURL(url)
  })
}

function downloadHTMLAsPNG() {
  if (!generatedOutput) return

  const originalPreviewStyle = asciiPreview.style.cssText
  const originalContainerStyle = previewContainer.style.cssText
  
  previewContainer.style.maxHeight = 'none'
  previewContainer.style.overflow = 'visible'
  asciiPreview.style.maxHeight = 'none'
  asciiPreview.style.overflow = 'visible'
  
  const elementToCapture = previewContainer 

  const scrollHeight = elementToCapture.scrollHeight
  const scrollWidth = elementToCapture.scrollWidth

  html2canvas(elementToCapture, {
    backgroundColor: bgColorInput.value,
    scale: 2,
    useCORS: true,
    allowTaint: true,
    width: scrollWidth,
    height: scrollHeight,
    windowHeight: scrollHeight, 
    windowWidth: scrollWidth,
  }).then((canvas) => {
    asciiPreview.style.cssText = originalPreviewStyle
    previewContainer.style.cssText = originalContainerStyle

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "html-art.png"
      link.click()
      URL.revokeObjectURL(url)
    })
  }).catch(() => {
    asciiPreview.style.cssText = originalPreviewStyle
    previewContainer.style.cssText = originalContainerStyle
  })
}

function openFullscreenPreview() {
  if (!generatedOutput) return

  const fontSize = {
    smallest: "6px",
    small: "8px",
    medium: "10px",
    large: "12px",
    largest: "14px",
  }[fontSizeSelect.value]

  const htmlString = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ASCII Art Full Screen Preview</title>
  <style>
    body { margin: 0; padding: 20px; background-color: #000000; }
    pre { font-family: 'Courier New', monospace; font-size: ${fontSize}; line-height: 1; white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body>
  <pre>${generatedOutput}</pre>
</body>
</html>`

  const blob = new Blob([htmlString], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank")
}

function downloadOutput() {
  if (!generatedOutput) return

  const isHtml = artType.value === "html"
  const element = document.createElement("a")

  if (isHtml) {
    const fontSize = {
      smallest: "6px",
      small: "8px",
      medium: "10px",
      large: "12px",
      largest: "14px",
    }[fontSizeSelect.value]

    const htmlString = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ASCII Art</title>
  <style>
    body { margin: 0; padding: 20px; background-color: #000000; }
    pre { font-family: 'Courier New', monospace; font-size: ${fontSize}; line-height: 1; white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body>
  <pre>${generatedOutput}</pre>
</body>
</html>`
    element.setAttribute("href", "data:text/html;charset=utf-8," + encodeURIComponent(htmlString))
    element.setAttribute("download", "ascii-art.html")
  } else {
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(generatedOutput))
    element.setAttribute("download", "ascii-art.txt")
  }

  element.style.display = "none"
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

generateBtn.addEventListener("click", generateASCII)
downloadBtn.addEventListener("click", downloadOutput)
downloadPngBtn.addEventListener("click", downloadAsPNG)
htmlDownloadPngBtn.addEventListener("click", downloadHTMLAsPNG)
fullscreenBtn.addEventListener("click", openFullscreenPreview)

widthInput.addEventListener("change", () => {
  if (generatedOutput) generateASCII()
})
invertCheckbox.addEventListener("change", () => {
  if (generatedOutput) generateASCII()
})
contrastCheckbox.addEventListener("change", () => {
  if (generatedOutput) generateASCII()
})
charactersInput.addEventListener("change", () => {
  if (generatedOutput) generateASCII()
})
randomizeCheckbox.addEventListener("change", () => {
  if (generatedOutput) generateASCII()
})
fontSizeSelect.addEventListener("change", () => {
  if (generatedOutput) generateASCII()
})

artType.addEventListener("change", () => {
  generatedOutput = null
  asciiPreview.innerHTML = ""
  asciiPreview.textContent = 'Click "Generate ASCII Art" to see preview...'
  updateButtonStates()
})

textColorInput.addEventListener("change", () => {
  if (generatedOutput) {
    if (artType.value === "html") {
      displayHTMLPreview(generatedOutput)
    } else {
      displayASCIIPreview(generatedOutput)
    }
  }
})

bgColorInput.addEventListener("change", () => {
  if (generatedOutput) {
    if (artType.value === "html") {
      displayHTMLPreview(generatedOutput)
    } else {
      displayASCIIPreview(generatedOutput)
    }
  }
})
