document.addEventListener("DOMContentLoaded", function () {

const uploadArea = document.getElementById("cropUploadArea");
const chooseImageBtn = document.getElementById("chooseImageBtn");
const input = document.getElementById("cropImageInput");
const resultArea = document.getElementById("cropResultArea");

const canvas = document.getElementById("cropCanvas");
const ctx = canvas.getContext("2d");

const zoomSlider = document.getElementById("cropZoom");
const zoomValue = document.getElementById("zoomValue");

const rotateLeft = document.getElementById("rotateLeft");
const rotateRight = document.getElementById("rotateRight");

const downloadBtn = document.getElementById("downloadCrop");
const removeBtn = document.getElementById("removeCrop");

const preview = document.getElementById("cropPreview");

const cropDimensions = document.getElementById("cropDimensions");
const cropMode = document.getElementById("cropMode");

const basicCropSelect = document.getElementById("basicCropSelect");
const passportSelect = document.getElementById("passportSelect");
const stampSelect = document.getElementById("stampSelect");


let image = new Image();

let imageLoaded = false;

let zoom = 1;
let rotation = 0;

let cropRatio = null;
let currentMode = "Free";

let cropX = 0;
let cropY = 0;
let cropW = 0;
let cropH = 0;

let draggingCrop = false;
let resizingCrop = false;
let resizeHandle = null;

let dragOffsetX = 0;
let dragOffsetY = 0;

let startCropX = 0;
let startCropY = 0;
let startCropW = 0;
let startCropH = 0;

let startMouseX = 0;
let startMouseY = 0;


const MAX_CANVAS = 1600;
const MIN_CROP_SIZE = 40;
const HANDLE_SIZE = 14;


/* =========================
   Choose Image
========================= */

chooseImageBtn.addEventListener("click", function (e) {

    e.stopPropagation();
    input.click();

});


uploadArea.addEventListener("click", function () {
    input.click();
});


input.addEventListener("change", function () {

    if (this.files && this.files[0]) {
        loadImage(this.files[0]);
    }

});


/* =========================
   Drag & Drop
========================= */

uploadArea.addEventListener("dragover", function (e) {

    e.preventDefault();
    uploadArea.classList.add("dragover");

});


uploadArea.addEventListener("dragleave", function () {

    uploadArea.classList.remove("dragover");

});


uploadArea.addEventListener("drop", function (e) {

    e.preventDefault();

    uploadArea.classList.remove("dragover");

    if (
        e.dataTransfer.files &&
        e.dataTransfer.files[0]
    ) {
        loadImage(e.dataTransfer.files[0]);
    }

});


/* =========================
   Load Image
========================= */

function loadImage(file) {

    if (!file.type.startsWith("image/")) {

        alert("Please select a valid image.");
        return;

    }

    const reader = new FileReader();

    reader.onload = function (e) {

        image = new Image();

        image.onload = function () {

            imageLoaded = true;

            setupCanvas();

            uploadArea.style.display = "none";
            resultArea.style.display = "block";

            basicCropSelect.value = "free";
            passportSelect.value = "";
            stampSelect.value = "";

            cropRatio = null;
            currentMode = "Free";

            updateModeText();

            updateZoomText();

            draw();
            updatePreview();

        };

        image.src = e.target.result;

    };

    reader.readAsDataURL(file);

}


/* =========================
   Canvas Setup
========================= */

function setupCanvas() {

    const scale = Math.min(
        1,
        MAX_CANVAS / image.width,
        MAX_CANVAS / image.height
    );

    canvas.width = Math.max(
        1,
        Math.round(image.width * scale)
    );

    canvas.height = Math.max(
        1,
        Math.round(image.height * scale)
    );

    cropW = canvas.width * 0.8;
    cropH = canvas.height * 0.8;

    cropX = (canvas.width - cropW) / 2;
    cropY = (canvas.height - cropH) / 2;

    zoom = 1;
    rotation = 0;

    zoomSlider.value = 100;

}


/* =========================
   Draw
========================= */

function draw() {

    if (!imageLoaded) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* Image */

    ctx.save();

    ctx.translate(
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.rotate(
        rotation * Math.PI / 180
    );

    const scaleX =
        canvas.width / image.width;

    const scaleY =
        canvas.height / image.height;

    const baseScale =
        Math.min(scaleX, scaleY);

    const drawScale =
        baseScale * zoom;

    const drawW =
        image.width * drawScale;

    const drawH =
        image.height * drawScale;

    ctx.drawImage(
        image,
        -drawW / 2,
        -drawH / 2,
        drawW,
        drawH
    );

    ctx.restore();


    /* Dark Overlay */

    ctx.save();

    ctx.fillStyle =
        "rgba(0,0,0,0.58)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.globalCompositeOperation =
        "destination-out";

    ctx.fillRect(
        cropX,
        cropY,
        cropW,
        cropH
    );

    ctx.restore();


    /* Border + Grid */

    ctx.save();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    ctx.strokeRect(
        cropX,
        cropY,
        cropW,
        cropH
    );

    ctx.strokeStyle =
        "rgba(255,255,255,0.45)";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
        cropX + cropW / 3,
        cropY
    );

    ctx.lineTo(
        cropX + cropW / 3,
        cropY + cropH
    );

    ctx.moveTo(
        cropX + cropW * 2 / 3,
        cropY
    );

    ctx.lineTo(
        cropX + cropW * 2 / 3,
        cropY + cropH
    );

    ctx.moveTo(
        cropX,
        cropY + cropH / 3
    );

    ctx.lineTo(
        cropX + cropW,
        cropY + cropH / 3
    );

    ctx.moveTo(
        cropX,
        cropY + cropH * 2 / 3
    );

    ctx.lineTo(
        cropX + cropW,
        cropY + cropH * 2 / 3
    );

    ctx.stroke();

    ctx.restore();


    /* Handles */

    drawHandle(cropX, cropY);

    drawHandle(
        cropX + cropW,
        cropY
    );

    drawHandle(
        cropX,
        cropY + cropH
    );

    drawHandle(
        cropX + cropW,
        cropY + cropH
    );

    drawHandle(
        cropX + cropW / 2,
        cropY
    );

    drawHandle(
        cropX + cropW / 2,
        cropY + cropH
    );

    drawHandle(
        cropX,
        cropY + cropH / 2
    );

    drawHandle(
        cropX + cropW,
        cropY + cropH / 2
    );

}


function drawHandle(x, y) {

    ctx.save();

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.rect(
        x - HANDLE_SIZE / 2,
        y - HANDLE_SIZE / 2,
        HANDLE_SIZE,
        HANDLE_SIZE
    );

    ctx.fill();
    ctx.stroke();

    ctx.restore();

}


/* =========================
   Basic Crop
========================= */

basicCropSelect.addEventListener(
    "change",
    function () {

        passportSelect.value = "";
        stampSelect.value = "";

        if (this.value === "free") {

            cropRatio = null;
            currentMode = "Free";

        } else {

            cropRatio =
                parseFloat(this.value);

            currentMode = "Ratio";

            applyRatio();

        }

        updateModeText();
        draw();
        updatePreview();

    }
);


/* =========================
   Passport
========================= */

passportSelect.addEventListener(
    "change",
    function () {

        if (!this.value) return;

        basicCropSelect.value = "free";
        stampSelect.value = "";

        cropRatio =
            parseFloat(this.value);

        currentMode = "Passport";

        applyRatio();

        updateModeText();
        draw();
        updatePreview();

    }
);


/* =========================
   Stamp
========================= */

stampSelect.addEventListener(
    "change",
    function () {

        if (!this.value) return;

        basicCropSelect.value = "free";
        passportSelect.value = "";

        cropRatio =
            parseFloat(this.value);

        currentMode = "Stamp";

        applyRatio();

        updateModeText();
        draw();
        updatePreview();

    }
);


/* =========================
   Apply Ratio
========================= */

function applyRatio() {

    if (!cropRatio) return;

    let newW = cropW;
    let newH = newW / cropRatio;

    if (newH > canvas.height) {

        newH = canvas.height;
        newW = newH * cropRatio;

    }

    if (newW > canvas.width) {

        newW = canvas.width;
        newH = newW / cropRatio;

    }

    cropW = Math.max(
        MIN_CROP_SIZE,
        newW
    );

    cropH = Math.max(
        MIN_CROP_SIZE,
        newH
    );

    cropX =
        (canvas.width - cropW) / 2;

    cropY =
        (canvas.height - cropH) / 2;

    keepInside();

}


/* =========================
   Mouse Position
========================= */

function getMousePosition(e) {

    const rect =
        canvas.getBoundingClientRect();

    return {

        x:
            (e.clientX - rect.left) *
            (canvas.width / rect.width),

        y:
            (e.clientY - rect.top) *
            (canvas.height / rect.height)

    };

}


/* =========================
   Handle Detection
========================= */

function getHandleAt(x, y) {

    const handles = {

        nw: [cropX, cropY],

        n: [
            cropX + cropW / 2,
            cropY
        ],

        ne: [
            cropX + cropW,
            cropY
        ],

        w: [
            cropX,
            cropY + cropH / 2
        ],

        e: [
            cropX + cropW,
            cropY + cropH / 2
        ],

        sw: [
            cropX,
            cropY + cropH
        ],

        s: [
            cropX + cropW / 2,
            cropY + cropH
        ],

        se: [
            cropX + cropW,
            cropY + cropH
        ]

    };


    for (const key in handles) {

        const hx = handles[key][0];
        const hy = handles[key][1];

        if (
            Math.abs(x - hx) <= HANDLE_SIZE &&
            Math.abs(y - hy) <= HANDLE_SIZE
        ) {
            return key;
        }

    }

    return null;

}


/* =========================
   Mouse Down
========================= */

canvas.addEventListener(
    "mousedown",
    function (e) {

        if (!imageLoaded) return;

        const pos =
            getMousePosition(e);

        const handle =
            getHandleAt(
                pos.x,
                pos.y
            );

        if (handle) {

            resizingCrop = true;
            resizeHandle = handle;

            startCropX = cropX;
            startCropY = cropY;
            startCropW = cropW;
            startCropH = cropH;

            startMouseX = pos.x;
            startMouseY = pos.y;

            return;

        }


        if (
            pos.x >= cropX &&
            pos.x <= cropX + cropW &&
            pos.y >= cropY &&
            pos.y <= cropY + cropH
        ) {

            draggingCrop = true;

            dragOffsetX =
                pos.x - cropX;

            dragOffsetY =
                pos.y - cropY;

        }

    }
);


/* =========================
   Mouse Move
========================= */

canvas.addEventListener(
    "mousemove",
    function (e) {

        if (!imageLoaded) return;

        const pos =
            getMousePosition(e);

        if (resizingCrop) {

            resizeCrop(
                pos.x,
                pos.y
            );

            draw();
            updatePreview();

            return;

        }

        if (draggingCrop) {

            cropX =
                pos.x - dragOffsetX;

            cropY =
                pos.y - dragOffsetY;

            keepInside();

            draw();
            updatePreview();

        }

    }
);


/* =========================
   Mouse Up
========================= */

window.addEventListener(
    "mouseup",
    function () {

        draggingCrop = false;
        resizingCrop = false;
        resizeHandle = null;

    }
);


/* =========================
   Resize Crop
========================= */

function resizeCrop(mouseX, mouseY) {

    const dx =
        mouseX - startMouseX;

    const dy =
        mouseY - startMouseY;

    let newX = startCropX;
    let newY = startCropY;
    let newW = startCropW;
    let newH = startCropH;


    /* FREE */

    if (!cropRatio) {

        if (
            resizeHandle.includes("e")
        ) {
            newW = startCropW + dx;
        }

        if (
            resizeHandle.includes("w")
        ) {
            newX = startCropX + dx;
            newW = startCropW - dx;
        }

        if (
            resizeHandle.includes("s")
        ) {
            newH = startCropH + dy;
        }

        if (
            resizeHandle.includes("n")
        ) {
            newY = startCropY + dy;
            newH = startCropH - dy;
        }

    }

    /* FIXED RATIO */

    else {

        let delta;

        if (
            resizeHandle === "e" ||
            resizeHandle === "w"
        ) {
            delta = dx;
        } else {
            delta = dy;
        }


        if (resizeHandle === "e") {

            newW = startCropW + delta;
            newH = newW / cropRatio;

        }

        else if (resizeHandle === "w") {

            newW = startCropW - delta;
            newH = newW / cropRatio;

            newX =
                startCropX +
                startCropW -
                newW;

        }

        else if (resizeHandle === "s") {

            newH = startCropH + delta;
            newW = newH * cropRatio;

        }

        else if (resizeHandle === "n") {

            newH = startCropH - delta;
            newW = newH * cropRatio;

            newY =
                startCropY +
                startCropH -
                newH;

        }

        else {

            newW =
                startCropW +
                (
                    resizeHandle === "se" ||
                    resizeHandle === "ne"
                        ? dx
                        : -dx
                );

            newH =
                newW / cropRatio;


            if (
                resizeHandle === "nw" ||
                resizeHandle === "sw"
            ) {

                newX =
                    startCropX +
                    startCropW -
                    newW;

            }


            if (
                resizeHandle === "nw" ||
                resizeHandle === "ne"
            ) {

                newY =
                    startCropY +
                    startCropH -
                    newH;

            }

        }


        if (newW < MIN_CROP_SIZE) {

            newW = MIN_CROP_SIZE;
            newH = newW / cropRatio;

        }

        if (newH < MIN_CROP_SIZE) {

            newH = MIN_CROP_SIZE;
            newW = newH * cropRatio;

        }

    }


    cropX = newX;
    cropY = newY;
    cropW = newW;
    cropH = newH;

    keepInside();

}


/* =========================
   Keep Inside
========================= */

function keepInside() {

    if (cropW > canvas.width) {
        cropW = canvas.width;
    }

    if (cropH > canvas.height) {
        cropH = canvas.height;
    }

    cropX =
        Math.max(
            0,
            Math.min(
                cropX,
                canvas.width - cropW
            )
        );

    cropY =
        Math.max(
            0,
            Math.min(
                cropY,
                canvas.height - cropH
            )
        );

}


/* =========================
   Zoom
========================= */

zoomSlider.addEventListener(
    "input",
    function () {

        zoom =
            parseInt(
                this.value,
                10
            ) / 100;

        updateZoomText();

        draw();
        updatePreview();

    }
);


function updateZoomText() {

    if (zoomValue) {

        zoomValue.textContent =
            Math.round(zoom * 100) + "%";

    }

}


/* =========================
   Rotate
========================= */

rotateLeft.addEventListener(
    "click",
    function () {

        rotation -= 90;

        if (rotation < 0) {
            rotation = 270;
        }

        draw();
        updatePreview();

    }
);


rotateRight.addEventListener(
    "click",
    function () {

        rotation += 90;

        if (rotation >= 360) {
            rotation = 0;
        }

        draw();
        updatePreview();

    }
);


/* =========================
   Create Crop
========================= */

function createCroppedCanvas() {

    const output =
        document.createElement("canvas");

    output.width =
        Math.max(
            1,
            Math.round(cropW)
        );

    output.height =
        Math.max(
            1,
            Math.round(cropH)
        );

    const outputCtx =
        output.getContext("2d");


    outputCtx.save();

    outputCtx.translate(
        -cropX,
        -cropY
    );


    outputCtx.save();

    outputCtx.translate(
        canvas.width / 2,
        canvas.height / 2
    );

    outputCtx.rotate(
        rotation *
        Math.PI /
        180
    );


    const scaleX =
        canvas.width /
        image.width;

    const scaleY =
        canvas.height /
        image.height;

    const baseScale =
        Math.min(
            scaleX,
            scaleY
        );

    const drawScale =
        baseScale * zoom;

    const drawW =
        image.width *
        drawScale;

    const drawH =
        image.height *
        drawScale;


    outputCtx.drawImage(
        image,
        -drawW / 2,
        -drawH / 2,
        drawW,
        drawH
    );


    outputCtx.restore();
    outputCtx.restore();

    return output;

}


/* =========================
   Preview
========================= */

function updatePreview() {

    if (!imageLoaded) return;

    const output =
        createCroppedCanvas();

    preview.src =
        output.toDataURL(
            "image/png"
        );

    updateDimensions();

}


/* =========================
   Dimensions
========================= */

function updateDimensions() {

    cropDimensions.textContent =
        Math.round(cropW) +
        " × " +
        Math.round(cropH);

}


/* =========================
   Mode
========================= */

function updateModeText() {

    cropMode.textContent =
        currentMode;

}


/* =========================
   Download
========================= */

downloadBtn.addEventListener(
    "click",
    function () {

        if (!imageLoaded) return;

        const output =
            createCroppedCanvas();

        const link =
            document.createElement("a");

        link.download =
            "pixreduce-cropped.png";

        link.href =
            output.toDataURL(
                "image/png"
            );

        link.click();

    }
);


/* =========================
   Remove
========================= */

removeBtn.addEventListener(
    "click",
    function () {

        imageLoaded = false;

        input.value = "";

        preview.src = "";

        resultArea.style.display =
            "none";

        uploadArea.style.display =
            "block";

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        cropDimensions.textContent =
            "0 × 0";

        cropMode.textContent =
            "Free";

        basicCropSelect.value =
            "free";

        passportSelect.value =
            "";

        stampSelect.value =
            "";

        zoom = 1;
        rotation = 0;

        zoomSlider.value = 100;

        updateZoomText();

    }
);

});
