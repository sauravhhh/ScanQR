<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code Scanner</title>
    <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: #f8f9fa;
            color: #212529;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        header {
            background-color: #ffffff;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        h1 {
            font-size: 1.8rem;
            font-weight: 600;
            color: #343a40;
        }

        main {
            flex: 1;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .scanner-container {
            width: 100%;
            max-width: 500px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }

        #reader {
            width: 100%;
            border-bottom: 1px solid #e9ecef;
            display: none;
        }

        .result-container {
            padding: 20px;
            text-align: center;
        }

        .result-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            word-break: break-all;
            min-height: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #495057;
            border: 1px solid #e9ecef;
        }

        .result-text {
            width: 100%;
            margin-bottom: 10px;
        }

        .result-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }

        .btn {
            background-color: #ffffff;
            color: #343a40;
            border: 1px solid #dee2e6;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .btn:hover {
            background-color: #f8f9fa;
            border-color: #adb5bd;
        }

        .btn-primary {
            background-color: #e9ecef;
            color: #212529;
            font-weight: 500;
        }

        .btn-primary:hover {
            background-color: #dee2e6;
        }

        .btn-icon {
            width: 16px;
            height: 16px;
        }

        .upload-section {
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }

        .file-input-wrapper {
            position: relative;
            overflow: hidden;
            display: inline-block;
        }

        .file-input-wrapper input[type=file] {
            position: absolute;
            left: -9999px;
        }

        .file-input-label {
            background-color: #ffffff;
            color: #343a40;
            border: 1px solid #dee2e6;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            display: inline-block;
        }

        .file-input-label:hover {
            background-color: #f8f9fa;
            border-color: #adb5bd;
        }

        footer {
            background-color: #ffffff;
            padding: 20px;
            text-align: center;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
        }

        .attribution {
            color: #6c757d;
            font-size: 0.9rem;
        }

        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #ffffff;
            color: #495057;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateX(150%);
            transition: transform 0.3s ease;
            z-index: 1000;
            max-width: 80%;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification.success {
            border-left: 4px solid #28a745;
        }

        .notification.error {
            border-left: 4px solid #dc3545;
        }

        .tab-container {
            display: flex;
            border-bottom: 1px solid #e9ecef;
        }

        .tab {
            flex: 1;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            background-color: #f8f9fa;
            color: #6c757d;
            transition: all 0.3s ease;
        }

        .tab.active {
            background-color: #ffffff;
            color: #343a40;
            border-bottom: 3px solid #343a40;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        @media (max-width: 480px) {
            h1 {
                font-size: 1.5rem;
            }
            
            .scanner-container {
                border-radius: 0;
            }
            
            main {
                padding: 10px;
            }
            
            .btn, .file-input-label {
                padding: 8px 16px;
                font-size: 0.9rem;
            }
            
            .result-actions {
                flex-wrap: wrap;
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>QR Code Scanner</h1>
    </header>

    <main>
        <div class="scanner-container">
            <div class="tab-container">
                <div class="tab active" id="camera-tab">Camera</div>
                <div class="tab" id="upload-tab">Upload</div>
            </div>
            
            <div class="tab-content active" id="camera-content">
                <div id="reader"></div>
                <div class="result-container">
                    <button id="startButton" class="btn btn-primary">Start Scanning</button>
                    <button id="stopButton" class="btn">Stop Scanning</button>
                    <div class="result-box">
                        <div id="result" class="result-text">Scan a QR code to see the result</div>
                        <div id="camera-actions" class="result-actions" style="display: none;">
                            <button id="copy-camera-result" class="btn">
                                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                                Copy
                            </button>
                            <button id="share-camera-result" class="btn">
                                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                                </svg>
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="upload-content">
                <div class="upload-section">
                    <div class="file-input-wrapper">
                        <input type="file" id="file-input" accept="image/*">
                        <label for="file-input" class="file-input-label">Choose QR Code Image</label>
                    </div>
                    <div class="result-box">
                        <div id="upload-result" class="result-text">Upload a QR code image to scan</div>
                        <div id="upload-actions" class="result-actions" style="display: none;">
                            <button id="copy-upload-result" class="btn">
                                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                                Copy
                            </button>
                            <button id="share-upload-result" class="btn">
                                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                                </svg>
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <div class="attribution">Made with ❤️ by Sauravhhh</div>
    </footer>

    <div id="notification" class="notification"></div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const html5QrCode = new Html5Qrcode("reader");
            const resultElement = document.getElementById('result');
            const uploadResultElement = document.getElementById('upload-result');
            const startButton = document.getElementById('startButton');
            const stopButton = document.getElementById('stopButton');
            const fileInput = document.getElementById('file-input');
            const notification = document.getElementById('notification');
            const cameraTab = document.getElementById('camera-tab');
            const uploadTab = document.getElementById('upload-tab');
            const cameraContent = document.getElementById('camera-content');
            const uploadContent = document.getElementById('upload-content');
            const readerElement = document.getElementById('reader');
            
            // Action buttons
            const copyCameraBtn = document.getElementById('copy-camera-result');
            const shareCameraBtn = document.getElementById('share-camera-result');
            const copyUploadBtn = document.getElementById('copy-upload-result');
            const shareUploadBtn = document.getElementById('share-upload-result');
            const cameraActions = document.getElementById('camera-actions');
            const uploadActions = document.getElementById('upload-actions');
            
            let isScanning = false;
            let currentResult = '';

            // Tab switching
            cameraTab.addEventListener('click', () => {
                cameraTab.classList.add('active');
                uploadTab.classList.remove('active');
                cameraContent.classList.add('active');
                uploadContent.classList.remove('active');
                
                // Hide the reader element when switching tabs to prevent showing uploaded image
                readerElement.style.display = 'none';
            });

            uploadTab.addEventListener('click', () => {
                uploadTab.classList.add('active');
                cameraTab.classList.remove('active');
                uploadContent.classList.add('active');
                cameraContent.classList.remove('active');
                
                // Stop camera scanning when switching to upload tab
                if (isScanning) {
                    stopScanning();
                }
            });

            // Camera scanning
            startButton.addEventListener('click', startScanning);
            stopButton.addEventListener('click', stopScanning);

            function startScanning() {
                if (isScanning) return;
                
                readerElement.style.display = 'block';
                
                html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText, decodedResult) => {
                        currentResult = decodedText;
                        resultElement.textContent = decodedText;
                        cameraActions.style.display = 'flex';
                        showNotification('QR Code scanned successfully!', 'success');
                    },
                    (errorMessage) => {
                        // Handle scan error silently
                    }
                ).then(() => {
                    isScanning = true;
                    resultElement.textContent = "Scanning...";
                    cameraActions.style.display = 'none';
                    showNotification('Camera started. Point at a QR code to scan.', 'success');
                }).catch(err => {
                    resultElement.textContent = "Error starting camera: " + err;
                    cameraActions.style.display = 'none';
                    showNotification('Error accessing camera. Please check permissions.', 'error');
                });
            }

            function stopScanning() {
                if (!isScanning) return;
                
                html5QrCode.stop().then(() => {
                    isScanning = false;
                    readerElement.style.display = 'none';
                    resultElement.textContent = "Scan a QR code to see the result";
                    cameraActions.style.display = 'none';
                    showNotification('Camera stopped.', 'success');
                }).catch(err => {
                    showNotification('Error stopping camera: ' + err, 'error');
                });
            }

            // File upload scanning
            fileInput.addEventListener('change', function(e) {
                if (e.target.files.length === 0) {
                    return;
                }
                
                const file = e.target.files[0];
                uploadResultElement.textContent = "Scanning...";
                uploadActions.style.display = 'none';
                
                // Make sure camera is not showing
                readerElement.style.display = 'none';
                
                html5QrCode.scanFile(file, true)
                    .then(decodedText => {
                        currentResult = decodedText;
                        uploadResultElement.textContent = decodedText;
                        uploadActions.style.display = 'flex';
                        showNotification('QR Code scanned successfully!', 'success');
                    })
                    .catch(err => {
                        uploadResultElement.textContent = "No QR code found in the image.";
                        uploadActions.style.display = 'none';
                        showNotification('No QR code found in the image.', 'error');
                    });
            });

            // Copy functionality
            copyCameraBtn.addEventListener('click', () => {
                copyToClipboard(resultElement.textContent);
            });

            copyUploadBtn.addEventListener('click', () => {
                copyToClipboard(uploadResultElement.textContent);
            });

            function copyToClipboard(text) {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(() => {
                        showNotification('Copied to clipboard!', 'success');
                    }).catch(err => {
                        showNotification('Failed to copy: ' + err, 'error');
                    });
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showNotification('Copied to clipboard!', 'success');
                }
            }

            // Share functionality
            shareCameraBtn.addEventListener('click', () => {
                shareContent(resultElement.textContent);
            });

            shareUploadBtn.addEventListener('click', () => {
                shareContent(uploadResultElement.textContent);
            });

            function shareContent(text) {
                if (navigator.share) {
                    navigator.share({
                        title: 'QR Code Result',
                        text: text
                    }).then(() => {
                        showNotification('Shared successfully!', 'success');
                    }).catch(err => {
                        showNotification('Sharing cancelled or failed: ' + err, 'error');
                    });
                } else {
                    // Fallback to copy if share API is not available
                    copyToClipboard(text);
                }
            }

            function showNotification(message, type) {
                notification.textContent = message;
                notification.className = 'notification ' + type;
                notification.classList.add('show');
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }

            // Auto-start scanning on page load
            setTimeout(startScanning, 500);
        });
    </script>
</body>
                                </html>
