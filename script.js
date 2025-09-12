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
    const openCameraBtn = document.getElementById('open-camera-result');
    const copyUploadBtn = document.getElementById('copy-upload-result');
    const shareUploadBtn = document.getElementById('share-upload-result');
    const openUploadBtn = document.getElementById('open-upload-result');
    const cameraActions = document.getElementById('camera-actions');
    const uploadActions = document.getElementById('upload-actions');
    
    // Modals
    const contactModal = document.getElementById('contactModal');
    const wifiModal = document.getElementById('wifiModal');
    const contactDetails = document.getElementById('contactDetails');
    const wifiDetails = document.getElementById('wifiDetails');
    const downloadVcfBtn = document.getElementById('downloadVcf');
    const copyWifiPasswordBtn = document.getElementById('copyWifiPassword');
    
    let isScanning = false;
    let currentResult = '';
    let currentResultType = '';

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
                currentResultType = detectType(decodedText);
                resultElement.textContent = decodedText;
                cameraActions.style.display = 'flex';
                updateOpenButton(openCameraBtn, currentResultType);
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
                currentResultType = detectType(decodedText);
                uploadResultElement.textContent = decodedText;
                uploadActions.style.display = 'flex';
                updateOpenButton(openUploadBtn, currentResultType);
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

    // Open functionality
    openCameraBtn.addEventListener('click', () => {
        handleOpen(currentResultType, currentResult);
    });

    openUploadBtn.addEventListener('click', () => {
        handleOpen(currentResultType, currentResult);
    });

    function detectType(text) {
        // URL detection
        if (text.match(/^https?:\/\//i) || text.match(/^www\./i)) {
            return 'url';
        }
        
        // Email detection
        if (text.match(/^mailto:/i) || text.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)) {
            return 'email';
        }
        
        // Phone detection
        if (text.match(/^tel:/i) || text.match(/^(\+\d{1,3}[- ]?)?\d{10}$/)) {
            return 'phone';
        }
        
        // VCard detection
        if (text.match(/^BEGIN:VCARD/i)) {
            return 'vcard';
        }
        
        // WiFi detection
        if (text.match(/^WIFI:/i)) {
            return 'wifi';
        }
        
        // Default to text
        return 'text';
    }

    function updateOpenButton(button, type) {
        if (type === 'text') {
            button.style.display = 'none';
        } else {
            button.style.display = 'inline-flex';
            
            // Update button text based on type
            if (type === 'url') {
                button.innerHTML = `
                    <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    Open URL
                `;
            } else if (type === 'email') {
                button.innerHTML = `
                    <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Send Email
                `;
            } else if (type === 'phone') {
                button.innerHTML = `
                    <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    Call
                `;
            } else if (type === 'vcard') {
                button.innerHTML = `
                    <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    View Contact
                `;
            } else if (type === 'wifi') {
                button.innerHTML = `
                    <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
                    </svg>
                    View WiFi
                `;
            }
        }
    }

    function handleOpen(type, text) {
        switch(type) {
            case 'url':
                // Add https:// if missing
                let url = text;
                if (!url.match(/^https?:\/\//i)) {
                    url = 'https://' + url;
                }
                window.open(url, '_blank');
                break;
                
            case 'email':
                // Format email address
                let email = text;
                if (!email.startsWith('mailto:')) {
                    email = 'mailto:' + email;
                }
                window.location.href = email;
                break;
                
            case 'phone':
                // Format phone number
                let phone = text;
                if (!phone.startsWith('tel:')) {
                    phone = 'tel:' + phone.replace(/\D/g, '');
                }
                window.location.href = phone;
                break;
                
            case 'vcard':
                showContactModal(text);
                break;
                
            case 'wifi':
                showWifiModal(text);
                break;
        }
          }
      function showContactModal(vcardText) {
        // Parse vCard
        const contact = parseVCard(vcardText);
        
        // Build contact details HTML
        let detailsHTML = '';
        
        if (contact.name) {
            detailsHTML += `
                <div class="contact-item">
                    <div class="contact-label">Name:</div>
                    <div class="contact-value">${contact.name}</div>
                </div>
            `;
        }
        
        if (contact.phone) {
            detailsHTML += `
                <div class="contact-item">
                    <div class="contact-label">Phone:</div>
                    <div class="contact-value">${contact.phone}</div>
                </div>
            `;
        }
        
        if (contact.email) {
            detailsHTML += `
                <div class="contact-item">
                    <div class="contact-label">Email:</div>
                    <div class="contact-value">${contact.email}</div>
                </div>
            `;
        }
        
        if (contact.organization) {
            detailsHTML += `
                <div class="contact-item">
                    <div class="contact-label">Company:</div>
                    <div class="contact-value">${contact.organization}</div>
                </div>
            `;
        }
        
        if (contact.title) {
            detailsHTML += `
                <div class="contact-item">
                    <div class="contact-label">Title:</div>
                    <div class="contact-value">${contact.title}</div>
                </div>
            `;
        }
        
        if (contact.address) {
            detailsHTML += `
                <div class="contact-item">
                    <div class="contact-label">Address:</div>
                    <div class="contact-value">${contact.address}</div>
                </div>
            `;
        }
        
        contactDetails.innerHTML = detailsHTML || '<p>No contact details found</p>';
        
        // Store vCard text for download
        downloadVcfBtn.dataset.vcard = vcardText;
        
        // Show modal
        contactModal.style.display = 'block';
    }

    function parseVCard(vcardText) {
        const contact = {};
        const lines = vcardText.split('\n');
        
        for (const line of lines) {
            if (line.startsWith('FN:')) {
                contact.name = line.substring(3);
            } else if (line.startsWith('TEL:')) {
                contact.phone = line.substring(4);
            } else if (line.startsWith('EMAIL:')) {
                contact.email = line.substring(6);
            } else if (line.startsWith('ORG:')) {
                contact.organization = line.substring(4);
            } else if (line.startsWith('TITLE:')) {
                contact.title = line.substring(6);
            } else if (line.startsWith('ADR:')) {
                const addressParts = line.substring(4).split(';');
                contact.address = addressParts.filter(part => part).join(', ');
            }
        }
        
        return contact;
    }

    function showWifiModal(wifiText) {
        // Parse WiFi credentials
        const wifi = parseWiFi(wifiText);
        
        // Build WiFi details HTML
        let detailsHTML = '';
        
        if (wifi.ssid) {
            detailsHTML += `
                <div class="wifi-item">
                    <div class="wifi-label">Network:</div>
                    <div class="wifi-value">${wifi.ssid}</div>
                </div>
            `;
        }
        
        if (wifi.password) {
            detailsHTML += `
                <div class="wifi-item">
                    <div class="wifi-label">Password:</div>
                    <div class="wifi-value">${wifi.password}</div>
                </div>
            `;
        }
        
        if (wifi.security) {
            detailsHTML += `
                <div class="wifi-item">
                    <div class="wifi-label">Security:</div>
                    <div class="wifi-value">${wifi.security}</div>
                </div>
            `;
        }
        
        if (wifi.hidden) {
            detailsHTML += `
                <div class="wifi-item">
                    <div class="wifi-label">Hidden:</div>
                    <div class="wifi-value">${wifi.hidden}</div>
                </div>
            `;
        }
        
        wifiDetails.innerHTML = detailsHTML || '<p>No WiFi details found</p>';
        
        // Store password for copy
        copyWifiPasswordBtn.dataset.password = wifi.password || '';
        
        // Show modal
        wifiModal.style.display = 'block';
    }

    function parseWiFi(wifiText) {
        const wifi = {};
        const parts = wifiText.substring(5).split(';');
        
        for (const part of parts) {
            if (part.startsWith('T:')) {
                wifi.security = part.substring(2);
            } else if (part.startsWith('S:')) {
                wifi.ssid = part.substring(2);
            } else if (part.startsWith('P:')) {
                wifi.password = part.substring(2);
            } else if (part.startsWith('H:')) {
                wifi.hidden = part.substring(2) === 'true' ? 'Yes' : 'No';
            }
        }
        
        return wifi;
    }

    // Modal close functionality
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            contactModal.style.display = 'none';
            wifiModal.style.display = 'none';
        });
    });

    document.getElementById('closeContactModal').addEventListener('click', () => {
        contactModal.style.display = 'none';
    });

    document.getElementById('closeWifiModal').addEventListener('click', () => {
        wifiModal.style.display = 'none';
    });

    // Download vCard
    downloadVcfBtn.addEventListener('click', function() {
        const vcardText = this.dataset.vcard;
        const blob = new Blob([vcardText], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contact.vcf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Contact downloaded!', 'success');
    });

    // Copy WiFi password
    copyWifiPasswordBtn.addEventListener('click', function() {
        const password = this.dataset.password;
        if (password) {
            copyToClipboard(password);
        } else {
            showNotification('No password to copy', 'error');
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === contactModal) {
            contactModal.style.display = 'none';
        }
        if (event.target === wifiModal) {
            wifiModal.style.display = 'none';
        }
    });

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
