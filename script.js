const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const clearCanvas = document.getElementById("clearCanvas");
const eraser = document.getElementById("eraser");
const download = document.getElementById("download");
const undo = document.getElementById("undo");
const redo = document.getElementById("redo");
const shapeSelect = document.getElementById("shapeSelect");
const backgroundColorPicker = document.getElementById("backgroundColorPicker");

// Canvas settings
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;
ctx.fillStyle = backgroundColorPicker.value;
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let currentColor = colorPicker.value;
let currentBrushSize = brushSize.value;
let currentShape = shapeSelect.value;
let isErasing = false;
let history = [];
let redoStack = [];
let startX, startY;

// Start/Stop drawing
function startDrawing(e) {
  drawing = true;
  startX = e.clientX - canvas.offsetLeft;
  startY = e.clientY - canvas.offsetTop;
  if (currentShape === 'freehand') draw(e);
}

function stopDrawing(e) {
  if (drawing) {
    saveState();
  }
  drawing = false;
  ctx.beginPath();
}

// Drawing function
function draw(e) {
  if (!drawing) return;

  let x = e.clientX - canvas.offsetLeft;
  let y = e.clientY - canvas.offsetTop;

  if (currentShape === 'freehand') {
    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = isErasing ? '#ffffff' : currentColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  } else if (currentShape === 'line' || currentShape === 'rectangle' || currentShape === 'circle') {
    // Clear canvas and draw shape preview
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    restoreState();
    ctx.lineWidth = currentBrushSize;
    ctx.strokeStyle = isErasing ? '#ffffff' : currentColor;

    if (currentShape === 'line') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentShape === 'rectangle') {
      ctx.strokeRect(startX, startY, x - startX, y - startY);
    } else if (currentShape === 'circle') {
      ctx.beginPath();
      let radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// Save and Restore Canvas State for Undo/Redo
function saveState() {
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  redoStack = []; // Clear redo stack
}

function restoreState() {
  if (history.length > 0) {
    ctx.putImageData(history[history.length - 1], 0, 0);
  }
}

// Undo and Redo
undo.addEventListener("click", () => {
  if (history.length > 0) {
    redoStack.push(history.pop());
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    restoreState();
  }
});

redo.addEventListener("click", () => {
  if (redoStack.length > 0) {
    history.push(redoStack.pop());
    restoreState();
  }
});

// Update brush color, size, and shape
colorPicker.addEventListener("input", (e) => (currentColor = e.target.value));
brushSize.addEventListener("input", (e) => (currentBrushSize = e.target.value));
shapeSelect.addEventListener("change", (e) => (currentShape = e.target.value));

// Eraser functionality
eraser.addEventListener("click", () => {
  isErasing = !isErasing;
  eraser.textContent = isErasing ? "Brush" : "Eraser";
});

// Clear canvas
clearCanvas.addEventListener("click", () => {
  ctx.fillStyle = backgroundColorPicker.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveState();
});

// Download canvas as an image
download.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "drawing.png";
  link.click();
});

// Change background color
backgroundColorPicker.addEventListener("input", (e) => {
  ctx.fillStyle = e.target.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveState();
});

// Event listeners
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseleave", stopDrawing);

// Initial save state
saveState();
