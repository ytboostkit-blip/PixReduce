// ========================================
// PixReduce - Image Compressor
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------
    // Elements
    // -----------------------------
    const uploadArea = document.getElementById("uploadArea");
    const imageInput = document.getElementById("imageInput");
    const browseButton = document.getElementById("browseButton");

    const resultArea = document.getElementById("resultArea");
    const imagePreview = document.getElementById("imagePreview");

    const originalSize = document.getElementById("originalSize");
    const compressedSize = document.getElementById("compressedSize");
    const compressionPercentage = document.getElementById("compressionPercentage");

    const qualitySlider = document.getElementById("qualitySlider");
    const qualityValue = document.getElementById("qualityValue");

    const compressButton = document.getElementById("compressButton");
    const downloadButton = document.getElementById("downloadButton");
    const removeImage = document.getElementById("removeImage");

    const themeToggle = document.getElementById("themeToggle");


    // -----------------------------
    // Variables
    // -----------------------------
    let selectedFile = null;
    let compressedBlob = null;
    let compressedURL = null;
    let previewURL = null;


    // -----------------------------
    // Browse Button
    // -----------------------------
    if (browseButton) {
        browseButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            imageInput.click();
        });
    }


    // -----------------------------
    // Upload Area Click
    // -----------------------------
    if (uploadArea) {
        uploadArea.addEventListener("click", (event) => {

            if (
                event.target === browseButton ||
                event.target.closest("#browseButton")
            ) {
                return;
            }

            imageInput.click();
        });
    }


    // -----------------------------
    // File Input
    // -----------------------------
    if (imageInput) {
        imageInput.addEventListener("change", (event) => {

            const file = event.target.files[0];

            if (file) {
                handleFile(file);
            }
        });
    }


    // -----------------------------
    // Drag & Drop
    // -----------------------------
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


    // -----------------------------
    // Handle Selected File
    // -----------------------------
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

        // Create preview URL
        if (previewURL) {
            URL.revokeObjectURL(previewURL);
        }

        previewURL = URL.createObjectURL(file);


        // Show preview
        if (imagePreview) {
            imagePreview.src = previewURL;
        }


        // Show original file size
        if (originalSize) {
            originalSize.textContent = formatFileSize(file.size);
        }


        // Reset compressed information
        if (compressedSize) {
            compressedSize.textContent = "--";
        }

        if (compressionPercentage) {
            compressionPercentage.textContent = "--";
        }


        // Reset compression data
        compressedBlob = null;

        if (compressedURL) {
            URL.revokeObjectURL(compressedURL);
            compressedURL = null;
        }


        // Show result area
        if (resultArea) {
            resultArea.style.display = "block";
        }


        // Scroll smoothly to result
        setTimeout(() => {

            if (resultArea) {
                resultArea.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        }, 100);
    }


    // -----------------------------
    // Quality Slider
    // -----------------------------
    if (qualitySlider) {

        qualitySlider.addEventListener("input", () => {

            const value = qualitySlider.value;

            if (qualityValue) {
                qualityValue.textContent = `${value}%`;
            }
        });
    }


    // -----------------------------
    // Compress Image
    // -----------------------------
    if (compressButton) {

        compressButton.addEventListener("click", async () => {

            if (!selectedFile) {

                alert("Please select an image first.");

                return;
            }


            const quality = parseInt(qualitySlider.value) / 100;


            // Change button text
            const originalButtonText = compressButton.textContent;

            compressButton.disabled = true;
            compressButton.textContent = "Compressing...";


            try {

                const result = await compressImage(
                    selectedFile,
                    quality
                );


                compressedBlob = result.blob;


                // Create download URL
                if (compressedURL) {
                    URL.revokeObjectURL(compressedURL);
                }

                compressedURL = URL.createObjectURL(compressedBlob);


                // Display compressed size
                if (compressedSize) {
                    compressedSize.textContent =
                        formatFileSize(compressedBlob.size);
                }


                // Calculate percentage
                const percentage = calculateCompression(
                    selectedFile.size,
                    compressedBlob.size
                );


                if (compressionPercentage) {

                    compressionPercentage.textContent =
                        `${percentage}%`;
                }


                // Enable download
                if (downloadButton) {

                    downloadButton.style.display = "inline-flex";

                    downloadButton.href = compressedURL;

                    downloadButton.download =
                        createDownloadName(selectedFile.name);
                }


            } catch (error) {

                console.error("Compression error:", error);

                alert(
                    "Something went wrong while compressing the image."
                );

            } finally {

                compressButton.disabled = false;

                compressButton.textContent = originalButtonText;
            }
        });
    }


    // -----------------------------
    // Image Compression Function
    // -----------------------------
    function compressImage(file, quality) {

        return new Promise((resolve, reject) => {

            const img = new Image();

            const objectURL = URL.createObjectURL(file);


            img.onload = () => {

                const canvas = document.createElement("canvas");

                const ctx = canvas.getContext("2d");


                canvas.width = img.width;
                canvas.height = img.height;


                // White background for PNG/WebP transparency
                if (file.type === "image/jpeg") {

                    ctx.fillStyle = "#ffffff";

                    ctx.fillRect(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );
                }


                ctx.drawImage(
                    img,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                // Keep WebP output for WebP input
                // Convert other formats to JPEG
                let outputType = "image/jpeg";

                if (file.type === "image/webp") {
                    outputType = "image/webp";
                }


                canvas.toBlob(
                    (blob) => {

                        URL.revokeObjectURL(objectURL);

                        if (!blob) {

                            reject(
                                new Error(
                                    "Could not compress image."
                                )
                            );

                            return;
                        }


                        resolve({
                            blob: blob
                        });

                    },
                    outputType,
                    quality
                );
            };


            img.onerror = () => {

                URL.revokeObjectURL(objectURL);

                reject(
                    new Error(
                        "Could not load image."
                    )
                );
            };


            img.src = objectURL;
        });
    }


    // -----------------------------
    // Calculate Compression
    // -----------------------------
    function calculateCompression(original, compressed) {

        if (original <= 0) {
            return 0;
        }


        // If compressed file becomes larger
        if (compressed >= original) {
            return 0;
        }


        const percentage =
            ((original - compressed) / original) * 100;


        return Math.round(percentage);
    }


    // -----------------------------
    // Format File Size
    // -----------------------------
    function formatFileSize(bytes) {

        if (bytes === 0) {
            return "0 Bytes";
        }


        const units = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];


        const i =
            Math.floor(
                Math.log(bytes) / Math.log(1024)
            );


        const size =
            bytes / Math.pow(1024, i);


        return `${size.toFixed(2)} ${units[i]}`;
    }


    // -----------------------------
    // Download File Name
    // -----------------------------
    function createDownloadName(originalName) {

        const name =
            originalName.substring(
                0,
                originalName.lastIndexOf(".")
            ) || originalName;


        return `${name}-compressed.jpg`;
    }


    // -----------------------------
    // Remove Image
    // -----------------------------
    if (removeImage) {

        removeImage.addEventListener("click", () => {

            resetCompressor();
        });
    }


    // -----------------------------
    // Reset Compressor
    // -----------------------------
    function resetCompressor() {

        selectedFile = null;

        compressedBlob = null;


        if (previewURL) {

            URL.revokeObjectURL(previewURL);

            previewURL = null;
        }


        if (compressedURL) {

            URL.revokeObjectURL(compressedURL);

            compressedURL = null;
        }


        if (imagePreview) {
            imagePreview.removeAttribute("src");
        }


        if (originalSize) {
            originalSize.textContent = "--";
        }


        if (compressedSize) {
            compressedSize.textContent = "--";
        }


        if (compressionPercentage) {
            compressionPercentage.textContent = "--";
        }


        if (downloadButton) {

            downloadButton.style.display = "none";

            downloadButton.removeAttribute("href");
        }


        if (imageInput) {
            imageInput.value = "";
        }


        if (resultArea) {
            resultArea.style.display = "none";
        }
    }


    // -----------------------------
    // Theme Toggle
    // -----------------------------
    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            document.body.classList.toggle("light-mode");


            const isLight =
                document.body.classList.contains("light-mode");


            localStorage.setItem(
                "pixreduce-theme",
                isLight ? "light" : "dark"
            );
        });
    }


    // -----------------------------
    // Load Saved Theme
    // -----------------------------
    const savedTheme =
        localStorage.getItem("pixreduce-theme");


    if (savedTheme === "light") {

        document.body.classList.add("light-mode");
    }

});