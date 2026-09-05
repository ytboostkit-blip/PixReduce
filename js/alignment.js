document.addEventListener("DOMContentLoaded", () => {
const uploadArea = document.getElementById("alignmentUploadArea");
const fileInput = document.getElementById("alignmentImageInput");
const browseButton = document.getElementById("alignmentBrowseButton");
const resultArea = document.getElementById("alignmentResultArea");

const canvas = document.getElementById("alignmentCanvas");
const ctx = canvas.getContext("2d");

const zoomSlider = document.getElementById("alignmentZoom");
const zoomValue = document.getElementById("alignmentZoomValue");

const alignLeftButton = document.getElementById("alignLeftButton");
const alignCenterButton = document.getElementById("alignCenterButton");
const alignRightButton = document.getElementById("alignRightButton");

const alignTopButton = document.getElementById("alignTopButton");
const alignMiddleButton = document.getElementById("alignMiddleButton");
const alignBottomButton = document.getElementById("alignBottomButton");

const moveLeftButton = document.getElementById("moveLeftButton");
const moveRightButton = document.getElementById("moveRightButton");
const moveUpButton = document.getElementById("moveUpButton");
const moveDownButton = document.getElementById("moveDownButton");

const rotateLeftButton = document.getElementById("rotateLeftButton");
const rotateRightButton = document.getElementById("rotateRightButton");

const centerImageButton = document.getElementById("centerImageButton");
const downloadButton = document.getElementById("alignmentDownloadButton");
const resetButton = document.getElementById("alignmentResetButton");

let image = new Image();
let imageLoaded = false;

let imageX = 0;
let imageY = 0;

let zoom = 1;
let rotation = 0;

let canvasWidth = 1200;
let canvasHeight = 800;

let dragging = false;
let dragStartX = 0;
let dragStartY = 0;
let startImageX = 0;
let startImageY = 0;

function setupCanvas() {
    if (!imageLoaded) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    drawCanvas();
}

function getScaledSize() {
    return {
        width: image.naturalWidth * zoom,
        height: image.naturalHeight * zoom
    };
}

function drawCanvas() {
    if (!imageLoaded) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.translate(
        imageX + (image.naturalWidth * zoom) / 2,
        imageY + (image.naturalHeight * zoom) / 2
    );

    ctx.rotate(rotation * Math.PI / 180);

    ctx.drawImage(
        image,
        -(image.naturalWidth * zoom) / 2,
        -(image.naturalHeight * zoom) / 2,
        image.naturalWidth * zoom,
        image.naturalHeight * zoom
    );

    ctx.restore();
}

function centerImage() {
    const size = getScaledSize();

    imageX = (canvas.width - size.width) / 2;
    imageY = (canvas.height - size.height) / 2;

    drawCanvas();
}

function alignLeft() {
    imageX = 0;
    drawCanvas();
}

function alignCenter() {
    const size = getScaledSize();
    imageX = (canvas.width - size.width) / 2;
    drawCanvas();
}

function alignRight() {
    const size = getScaledSize();
    imageX = canvas.width - size.width;
    drawCanvas();
}

function alignTop() {
    imageY = 0;
    drawCanvas();
}

function alignMiddle() {
    const size = getScaledSize();
    imageY = (canvas.height - size.height) / 2;
    drawCanvas();
}

function alignBottom() {
    const size = getScaledSize();
    imageY = canvas.height - size.height;
    drawCanvas();
}

function moveImage(dx, dy) {
    imageX += dx;
    imageY += dy;
    drawCanvas();
}

function rotateImage(amount) {
    rotation = (rotation + amount) % 360;

    if (rotation < 0) {
        rotation += 360;
    }

    drawCanvas();
}

function loadImage(file) {
    if (!file || !file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        image = new Image();

        image.onload = () => {
            imageLoaded = true;

            canvasWidth = image.naturalWidth;
            canvasHeight = image.naturalHeight;

            const maxCanvasSize = 1600;

            if (canvasWidth > maxCanvasSize || canvasHeight > maxCanvasSize) {
                const scale = Math.min(
                    maxCanvasSize / canvasWidth,
                    maxCanvasSize / canvasHeight
                );

                canvasWidth = Math.round(canvasWidth * scale);
                canvasHeight = Math.round(canvasHeight * scale);
            }

            zoom = 1;
            rotation = 0;

            zoomSlider.value = 100;
            zoomValue.textContent = "100%";

            resultArea.hidden = false;
            uploadArea.hidden = true;

            setupCanvas();
            centerImage();
        };

        image.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

browseButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    loadImage(file);
});

uploadArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadArea.classList.add("drag-over");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
});

uploadArea.addEventListener("drop", (event) => {
    event.preventDefault();

    uploadArea.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];
    loadImage(file);
});

zoomSlider.addEventListener("input", () => {
    const newZoom = Number(zoomSlider.value) / 100;

    const oldZoom = zoom;
    zoom = newZoom;

    const centerX = imageX + (image.naturalWidth * oldZoom) / 2;
    const centerY = imageY + (image.naturalHeight * oldZoom) / 2;

    imageX = centerX - (image.naturalWidth * zoom) / 2;
    imageY = centerY - (image.naturalHeight * zoom) / 2;

    zoomValue.textContent = `${zoomSlider.value}%`;

    drawCanvas();
});

alignLeftButton.addEventListener("click", alignLeft);
alignCenterButton.addEventListener("click", alignCenter);
alignRightButton.addEventListener("click", alignRight);

alignTopButton.addEventListener("click", alignTop);
alignMiddleButton.addEventListener("click", alignMiddle);
alignBottomButton.addEventListener("click", alignBottom);

moveLeftButton.addEventListener("click", () => moveImage(-10, 0));
moveRightButton.addEventListener("click", () => moveImage(10, 0));
moveUpButton.addEventListener("click", () => moveImage(0, -10));
moveDownButton.addEventListener("click", () => moveImage(0, 10));

rotateLeftButton.addEventListener("click", () => rotateImage(-90));
rotateRightButton.addEventListener("click", () => rotateImage(90));

centerImageButton.addEventListener("click", centerImage);

canvas.addEventListener("mousedown", (event) => {
    if (!imageLoaded) return;

    dragging = true;

    dragStartX = event.offsetX;
    dragStartY = event.offsetY;

    startImageX = imageX;
    startImageY = imageY;

    canvas.style.cursor = "grabbing";
});

canvas.addEventListener("mousemove", (event) => {
    if (!dragging) return;

    const dx = event.offsetX - dragStartX;
    const dy = event.offsetY - dragStartY;

    imageX = startImageX + dx;
    imageY = startImageY + dy;

    drawCanvas();
});

canvas.addEventListener("mouseup", () => {
    dragging = false;
    canvas.style.cursor = "grab";
});

canvas.addEventListener("mouseleave", () => {
    dragging = false;
    canvas.style.cursor = "grab";
});

canvas.addEventListener("touchstart", (event) => {
    if (!imageLoaded) return;

    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();

    dragging = true;

    dragStartX = touch.clientX - rect.left;
    dragStartY = touch.clientY - rect.top;

    startImageX = imageX;
    startImageY = imageY;
}, { passive: true });

canvas.addEventListener("touchmove", (event) => {
    if (!dragging) return;

    event.preventDefault();

    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();

    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    imageX = startImageX + (currentX - dragStartX);
    imageY = startImageY + (currentY - dragStartY);

    drawCanvas();
}, { passive: false });

canvas.addEventListener("touchend", () => {
    dragging = false;
});

downloadButton.addEventListener("click", () => {
    if (!imageLoaded) return;

    canvas.toBlob((blob) => {
        if (!blob) {
            alert("Unable to create the image.");
            return;
        }

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "pixreduce-aligned-image.png";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }, "image/png");
});

resetButton.addEventListener("click", () => {
    imageLoaded = false;

    image = new Image();

    fileInput.value = "";

    resultArea.hidden = true;
    uploadArea.hidden = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.style.cursor = "grab";

});
