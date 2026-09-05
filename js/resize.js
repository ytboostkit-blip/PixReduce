// ========================================
// PixReduce - Image Resizer
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const uploadArea = document.getElementById("resizeUploadArea");
    const imageInput = document.getElementById("resizeImageInput");
    const browseButton = document.getElementById("resizeBrowseButton");

    const resultArea = document.getElementById("resizeResultArea");
    const imagePreview = document.getElementById("resizeImagePreview");

    const originalWidth = document.getElementById("originalWidth");
    const originalHeight = document.getElementById("originalHeight");

    const widthInput = document.getElementById("resizeWidth");
    const heightInput = document.getElementById("resizeHeight");

    const aspectToggle = document.getElementById("aspectRatioToggle");

    const resizeButton = document.getElementById("resizeButton");
    const downloadButton = document.getElementById("resizeDownloadButton");
    const removeButton = document.getElementById("resizeRemoveImage");

    const themeToggle = document.getElementById("themeToggle");


    let selectedFile = null;
    let originalImage = null;
    let aspectRatio = 1;
    let keepAspectRatio = true;
    let previewURL = null;
    let downloadURL = null;


    // ========================================
    // Browse Button
    // ========================================

    if (browseButton) {

        browseButton.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();

            imageInput.click();
        });
    }


    // ========================================
    // Upload Area Click
    // ========================================

    if (uploadArea) {

        uploadArea.addEventListener("click", (event) => {

            if (
                event.target === browseButton ||
                event.target.closest("#resizeBrowseButton")
            ) {
                return;
            }

            imageInput.click();
        });
    }


    // ========================================
    // File Input
    // ========================================

    if (imageInput) {

        imageInput.addEventListener("change", (event) => {

            const file = event.target.files[0];

            if (file) {
                handleFile(file);
            }
        });
    }


    // ========================================
    // Drag & Drop
    // ========================================

    if (uploadArea) {

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

            if (file) {
                handleFile(file);
            }
        });
    }


    // ========================================
    // Handle Image
    // ========================================

    function handleFile(file) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (!allowedTypes.includes(file.type)) {

            alert("Please select a JPG, PNG or WebP image.");

            return;
        }


        selectedFile = file;


        if (previewURL) {
            URL.revokeObjectURL(previewURL);
        }


        previewURL = URL.createObjectURL(file);


        const img = new Image();


        img.onload = () => {

            originalImage = img;

            aspectRatio = img.width / img.height;


            // Original dimensions
            originalWidth.textContent = img.width;
            originalHeight.textContent = img.height;


            // Set input values
            widthInput.value = img.width;
            heightInput.value = img.height;


            // Show preview
            imagePreview.src = previewURL;


            // Reset download
            if (downloadURL) {

                URL.revokeObjectURL(downloadURL);

                downloadURL = null;
            }


            downloadButton.style.display = "none";


            // Show result area
            resultArea.style.display = "block";


            setTimeout(() => {

                resultArea.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 100);
        };


        img.onerror = () => {

            alert("Could not load this image.");
        };


        img.src = previewURL;
    }


    // ========================================
    // Width Input
    // ========================================

    if (widthInput) {

        widthInput.addEventListener("input", () => {

            if (!keepAspectRatio || !originalImage) {
                return;
            }


            const width = parseInt(widthInput.value);


            if (!width || width <= 0) {
                return;
            }


            const newHeight =
                Math.round(width / aspectRatio);


            heightInput.value = newHeight;
        });
    }


    // ========================================
    // Height Input
    // ========================================

    if (heightInput) {

        heightInput.addEventListener("input", () => {

            if (!keepAspectRatio || !originalImage) {
                return;
            }


            const height = parseInt(heightInput.value);


            if (!height || height <= 0) {
                return;
            }


            const newWidth =
                Math.round(height * aspectRatio);


            widthInput.value = newWidth;
        });
    }


    // ========================================
    // Aspect Ratio Toggle
    // ========================================

    if (aspectToggle) {

        aspectToggle.addEventListener("click", () => {

            keepAspectRatio = !keepAspectRatio;


            if (keepAspectRatio) {

                aspectToggle.classList.add("active");

            } else {

                aspectToggle.classList.remove("active");
            }
        });
    }


    // ========================================
    // Resize Image
    // ========================================

    if (resizeButton) {

        resizeButton.addEventListener("click", () => {

            if (!selectedFile || !originalImage) {

                alert("Please select an image first.");

                return;
            }


            const width = parseInt(widthInput.value);
            const height = parseInt(heightInput.value);


            if (
                !width ||
                !height ||
                width <= 0 ||
                height <= 0
            ) {

                alert("Please enter valid width and height.");

                return;
            }


            resizeButton.disabled = true;
            resizeButton.textContent = "Resizing...";


            setTimeout(() => {

                try {

                    const canvas =
                        document.createElement("canvas");

                    const ctx =
                        canvas.getContext("2d");


                    canvas.width = width;
                    canvas.height = height;


                    // White background for JPEG
                    if (selectedFile.type === "image/jpeg") {

                        ctx.fillStyle = "#ffffff";

                        ctx.fillRect(
                            0,
                            0,
                            width,
                            height
                        );
                    }


                    ctx.drawImage(
                        originalImage,
                        0,
                        0,
                        width,
                        height
                    );


                    let outputType = selectedFile.type;


                    if (
                        outputType !== "image/jpeg" &&
                        outputType !== "image/png" &&
                        outputType !== "image/webp"
                    ) {

                        outputType = "image/jpeg";
                    }


                    canvas.toBlob(
                        (blob) => {

                            if (!blob) {

                                alert(
                                    "Could not resize the image."
                                );

                                resizeButton.disabled = false;
                                resizeButton.textContent =
                                    "Resize Image";

                                return;
                            }


                            if (downloadURL) {

                                URL.revokeObjectURL(
                                    downloadURL
                                );
                            }


                            downloadURL =
                                URL.createObjectURL(blob);


                            downloadButton.href =
                                downloadURL;


                            downloadButton.download =
                                createDownloadName(
                                    selectedFile.name,
                                    outputType
                                );


                            downloadButton.style.display =
                                "inline-flex";


                            resizeButton.disabled = false;

                            resizeButton.textContent =
                                "Resize Image";

                        },
                        outputType,
                        0.92
                    );

                } catch (error) {

                    console.error(error);

                    alert(
                        "Something went wrong while resizing."
                    );

                    resizeButton.disabled = false;

                    resizeButton.textContent =
                        "Resize Image";
                }

            }, 100);
        });
    }


    // ========================================
    // Download Name
    // ========================================

    function createDownloadName(
        originalName,
        outputType
    ) {

        const lastDot =
            originalName.lastIndexOf(".");


        let name =
            lastDot > 0
                ? originalName.substring(0, lastDot)
                : originalName;


        let extension = "jpg";


        if (outputType === "image/png") {
            extension = "png";
        }


        if (outputType === "image/webp") {
            extension = "webp";
        }


        return `${name}-resized.${extension}`;
    }


    // ========================================
    // Remove Image
    // ========================================

    if (removeButton) {

        removeButton.addEventListener("click", () => {

            resetResizer();
        });
    }


    // ========================================
    // Reset
    // ========================================

    function resetResizer() {

        selectedFile = null;
        originalImage = null;


        if (previewURL) {

            URL.revokeObjectURL(previewURL);

            previewURL = null;
        }


        if (downloadURL) {

            URL.revokeObjectURL(downloadURL);

            downloadURL = null;
        }


        imagePreview.removeAttribute("src");


        originalWidth.textContent = "--";
        originalHeight.textContent = "--";


        widthInput.value = "";
        heightInput.value = "";


        downloadButton.style.display = "none";
        downloadButton.removeAttribute("href");


        imageInput.value = "";


        resultArea.style.display = "none";


        keepAspectRatio = true;

        aspectToggle.classList.add("active");
    }


    // ========================================
    // Theme Toggle
    // ========================================

    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            document.body.classList.toggle("light-mode");


            const isLight =
                document.body.classList.contains(
                    "light-mode"
                );


            localStorage.setItem(
                "pixreduce-theme",
                isLight ? "light" : "dark"
            );
        });
    }


    // ========================================
    // Load Saved Theme
    // ========================================

    const savedTheme =
        localStorage.getItem("pixreduce-theme");


    if (savedTheme === "light") {

        document.body.classList.add("light-mode");
    }

});