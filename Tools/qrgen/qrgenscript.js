const dataInput = document.getElementById("dataInput")
const errorCorrectionSelect = document.getElementById("errorCorrection")
const sizeInput = document.getElementById("sizeInput")
const fgColorInput = document.getElementById("fgColorInput")
const bgColorInput = document.getElementById("bgColorInput")
const generateBtn = document.getElementById("generateBtn")
const downloadBtn = document.getElementById("downloadBtn")
const qrCodeContainer = document.getElementById("qrCodeContainer")

let generatedDataURL = null

function resetToDefaults() {
  dataInput.value = ""
  errorCorrectionSelect.value = "M"
  sizeInput.value = "200"
  fgColorInput.value = "#000000"
  bgColorInput.value = "#ffffff"
  qrCodeContainer.innerHTML = "<p>Enter data and click 'Generate QR Code'</p>"
  downloadBtn.disabled = true
  generatedDataURL = null
}

resetToDefaults()

function generateQRCode() {
  const data = dataInput.value.trim()
  
  if (!data) {
    qrCodeContainer.innerHTML = "<p>Please enter text or a URL!</p>"
    downloadBtn.disabled = true
    generatedDataURL = null
    return
  }
  
  const size = Number.parseInt(sizeInput.value)
  const errorCorrection = errorCorrectionSelect.value
  const fgColor = fgColorInput.value
  const bgColor = bgColorInput.value

  qrCodeContainer.innerHTML = ""
  downloadBtn.disabled = true
  generatedDataURL = null
    
  const qrCanvas = document.createElement('canvas');
  qrCodeContainer.appendChild(qrCanvas);
  
  QRCode.toCanvas(qrCanvas, data, {
    errorCorrectionLevel: errorCorrection,
    width: size,
    margin: 1,
    color: {
      dark: fgColor,
      light: bgColor
    }
  }, function (error) {
    if (error) {
      console.error(error)
      qrCodeContainer.innerHTML = "<p>Error generating QR Code.</p>"
    } else {
      generatedDataURL = qrCanvas.toDataURL("image/png")
      downloadBtn.disabled = false
    }
  })
}

function downloadQRCode() {
  if (!generatedDataURL) return

  const link = document.createElement("a")
  link.href = generatedDataURL
  link.download = "qr-code.png"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

generateBtn.addEventListener("click", generateQRCode)
downloadBtn.addEventListener("click", downloadQRCode)

dataInput.addEventListener("input", () => {
  if (generatedDataURL) generateQRCode()
})
errorCorrectionSelect.addEventListener("change", () => {
  if (generatedDataURL) generateQRCode()
})
sizeInput.addEventListener("change", () => {
  if (generatedDataURL) generateQRCode()
})
fgColorInput.addEventListener("change", () => {
  if (generatedDataURL) generateQRCode()
})
bgColorInput.addEventListener("change", () => {
  if (generatedDataURL) generateQRCode()
})