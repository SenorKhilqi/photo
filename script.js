// DOM Elements
const cameraVideo = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const photosContainer = document.getElementById('photos');
const photoStripPreview = document.getElementById('photoStripPreview');
const photoGallery = document.getElementById('photoGallery');
const startCameraBtn = document.getElementById('startCamera');
const takePhotosBtn = document.getElementById('takePhotos');
const resetPhotosBtn = document.getElementById('resetPhotos');
const downloadPhotoStripBtn = document.getElementById('downloadPhotoStrip');
const cameraOverlay = document.getElementById('cameraOverlay');
const countdownElement = document.getElementById('countdown');
const photoCountElement = document.getElementById('photoCount');

// Global variables
let stream = null;
let photoStrip = [];
let photoCounter = 0;
let photosTaken = 0;
let countdownInterval = null;
let photoStripCanvas = null;

// Event listeners
startCameraBtn.addEventListener('click', toggleCamera);
takePhotosBtn.addEventListener('click', startPhotoSequence);
resetPhotosBtn.addEventListener('click', resetPhotoStrip);
downloadPhotoStripBtn.addEventListener('click', downloadPhotoStrip);

// Function to start/stop the camera
async function toggleCamera() {
    if (stream) {
        // Stop the camera
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        cameraVideo.srcObject = null;
        cameraOverlay.style.display = 'flex';
        startCameraBtn.innerHTML = '<i class="fas fa-video"></i> Start Camera';
        takePhotosBtn.disabled = true;
        return;
    }

    try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        // Display the camera feed
        cameraVideo.srcObject = stream;
        cameraOverlay.style.display = 'none';
        startCameraBtn.innerHTML = '<i class="fas fa-video-slash"></i> Stop Camera';
        takePhotosBtn.disabled = false;

        // Handle the case when user revokes camera permissions
        stream.getVideoTracks()[0].addEventListener('ended', () => {
            cameraOverlay.style.display = 'flex';
            startCameraBtn.innerHTML = '<i class="fas fa-video"></i> Start Camera';
            takePhotosBtn.disabled = true;
            stream = null;
        });
    } catch (error) {
        console.error('Error accessing the camera', error);
        alert('Error accessing the camera. Please make sure you have granted camera permissions.');
    }
}

// Function to start the photo sequence
function startPhotoSequence() {
    if (!stream) return;
    
    // Reset if needed
    if (photoCounter > 0) {
        resetPhotoStrip();
    }
    
    // Disable buttons during sequence
    takePhotosBtn.disabled = true;
    resetPhotosBtn.disabled = true;
    
    // Create the photo strip container if it doesn't exist
    createPhotoStripPreview();
    
    // Start the countdown for the first photo
    startCountdown();
}

// Function to start countdown and take a photo
function startCountdown() {
    let countdown = 3;
    countdownElement.textContent = countdown;
    countdownElement.classList.add('visible');
    
    countdownInterval = setInterval(() => {
        countdown--;
        
        if (countdown > 0) {
            countdownElement.textContent = countdown;
            countdownElement.classList.add('pulse');
            setTimeout(() => countdownElement.classList.remove('pulse'), 500);
        } else {
            clearInterval(countdownInterval);
            countdownElement.classList.remove('visible');
            capturePhoto();
        }
    }, 1000);
}

// Function to capture a photo
function capturePhoto() {
    // Create a flash effect
    createFlashEffect();
    
    // Set canvas dimensions to match video
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    
    // Draw the current frame to the canvas
    const context = canvas.getContext('2d');
    context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
    
    // Get the photo URL
    const photoURL = canvas.toDataURL('image/png');
    
    // Add the photo to our strip
    photoStrip.push(photoURL);
    photoCounter++;
    
    // Update the photo count display
    photoCountElement.textContent = `${photoCounter}/3`;
    
    // Add the photo to the preview
    addPhotoToStripPreview(photoURL, photoCounter - 1);
    
    // Play a camera shutter sound
    playShutterSound();
    
    // Continue the sequence or finish
    if (photoCounter < 3) {
        // Wait 1 second before starting the next countdown
        setTimeout(() => {
            startCountdown();
        }, 1000);
    } else {
        // All 3 photos have been taken
        finishPhotoSequence();
    }
}

// Function to create a flash effect
function createFlashEffect() {
    const flash = document.createElement('div');
    flash.classList.add('flash');
    document.body.appendChild(flash);
    
    // Trigger the flash
    setTimeout(() => {
        flash.style.opacity = '0.8';
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(flash);
            }, 300);
        }, 100);
    }, 10);
}

// Function to create the photo strip preview
function createPhotoStripPreview() {
    // Clear existing content
    photoStripPreview.innerHTML = '';
    
    // Add title div at the top
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('photo-strip-title');
    titleDiv.innerHTML = '<h3>SMARTPEOPLE</h3><p>MOST SMART TECHNOLOGY</p>';
    photoStripPreview.appendChild(titleDiv);
    
    // Create 3 empty cells
    for (let i = 0; i < 3; i++) {
        const photoCell = document.createElement('div');
        photoCell.classList.add('photo-cell');
        photoCell.id = `photoCell-${i}`;
        
        const img = document.createElement('img');
        img.alt = `Photo ${i+1}`;
        
        photoCell.appendChild(img);
        photoStripPreview.appendChild(photoCell);
    }
    
    // Add footer div at the bottom
    const footerDiv = document.createElement('div');
    footerDiv.classList.add('photo-strip-footer');
    footerDiv.innerHTML = '<h3>BACK TO</h3><h3>OFFICE</h3>';
    photoStripPreview.appendChild(footerDiv);
}

// Function to add a photo to the strip preview
function addPhotoToStripPreview(photoURL, index) {
    const photoCell = document.getElementById(`photoCell-${index}`);
    const img = photoCell.querySelector('img');
    img.src = photoURL;
    
    // Add a small delay before showing the image with animation
    setTimeout(() => {
        photoCell.classList.add('loaded');
    }, 300);
}

// Function to play a camera shutter sound
function playShutterSound() {
    const shutterSound = new Audio('camera-shutter.mp3'); // Make sure to add this audio file to your project
    shutterSound.play().catch(error => {
        console.log('Audio play failed:', error);
        // Continue silently if audio can't play
    });
}

// Function to finish the photo sequence
function finishPhotoSequence() {
    // Enable buttons again
    takePhotosBtn.disabled = false;
    resetPhotosBtn.disabled = false;
    downloadPhotoStripBtn.disabled = false;
    
    // Update the final photo strip display
    updateFinalPhotoStrip();
    
    // Show a message or notification
    alert('Photo strip complete! You can now download your photos.');
}

// Function to update the final photo strip for download
function updateFinalPhotoStrip() {
    // Create a canvas for the final photo strip
    photoStripCanvas = document.createElement('canvas');
    
    // Adjusted dimensions to match reference image ratio
    const stripWidth = 400;
    const stripHeight = 900;
    photoStripCanvas.width = stripWidth;
    photoStripCanvas.height = stripHeight;
    
    const ctx = photoStripCanvas.getContext('2d');
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, stripWidth, stripHeight);
    
    // Add red-blue border at top and bottom (air mail style)
    const borderHeight = 30;
    
    // Top border
    ctx.fillStyle = '#FF0000'; // Red
    ctx.fillRect(0, 0, stripWidth/3, borderHeight);
    ctx.fillStyle = '#0044AA'; // Blue
    ctx.fillRect(stripWidth/3, 0, stripWidth/3, borderHeight);
    ctx.fillStyle = '#FF0000'; // Red
    ctx.fillRect(2*stripWidth/3, 0, stripWidth/3, borderHeight);
    
    // Bottom border
    ctx.fillStyle = '#FF0000'; // Red
    ctx.fillRect(0, stripHeight - borderHeight, stripWidth/3, borderHeight);
    ctx.fillStyle = '#0044AA'; // Blue
    ctx.fillRect(stripWidth/3, stripHeight - borderHeight, stripWidth/3, borderHeight);
    ctx.fillStyle = '#FF0000'; // Red
    ctx.fillRect(2*stripWidth/3, stripHeight - borderHeight, stripWidth/3, borderHeight);
    
    // Add header text
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px Anton, sans-serif';
    ctx.fillText('SMARTPEOPLE', stripWidth/2, borderHeight + 50);
    
    ctx.font = '14px Poppins, sans-serif';
    ctx.fillText('MOST SMART TECHNOLOGY', stripWidth/2, borderHeight + 75);
    
    // Calculate dimensions for each photo
    const photoWidth = stripWidth - 60;  // 30px margin on each side
    const photoHeight = 160; // Fixed height for each photo
    const spacing = 20; // Space between photos
    const startY = borderHeight + 100; // Starting position after header
    
    // Draw each photo
    photoStrip.forEach((photoURL, index) => {
        const img = new Image();
        img.onload = () => {
            // Calculate position
            const y = startY + index * (photoHeight + spacing);
            
            // Draw the photo with proper aspect ratio
            drawImageProp(ctx, img, 30, y, photoWidth, photoHeight);
            
            // Draw a thin border around the photo
            ctx.strokeStyle = '#dddddd';
            ctx.lineWidth = 1;
            ctx.strokeRect(30, y, photoWidth, photoHeight);
            
            // Add footer text if this is the last photo
            if (index === photoStrip.length - 1) {
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 28px Anton, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('BACK TO', stripWidth/2, y + photoHeight + spacing + 40);
                ctx.fillText('OFFICE', stripWidth/2, y + photoHeight + spacing + 75);
            }
        };
        img.src = photoURL;
    });
    
    // Add the canvas to the gallery for preview
    photoGallery.innerHTML = '';
    photoGallery.style.display = 'flex';
    photoGallery.appendChild(photoStripCanvas);
}

// Helper function to draw image with proper aspect ratio
function drawImageProp(ctx, img, x, y, w, h) {
    // Calculate the scaling factor
    const imgRatio = img.width / img.height;
    const rectRatio = w / h;
    let newWidth, newHeight, offsetX = 0, offsetY = 0;
    
    // Adjust based on aspect ratio
    if (imgRatio > rectRatio) {
        // Image is wider than the target rectangle
        newHeight = h;
        newWidth = h * imgRatio;
        offsetX = (w - newWidth) / 2;
    } else {
        // Image is taller than the target rectangle
        newWidth = w;
        newHeight = w / imgRatio;
        offsetY = (h - newHeight) / 2;
    }
    
    // Draw the image centered
    ctx.drawImage(img, x + offsetX, y + offsetY, newWidth, newHeight);
}

// Function to reset the photo strip
function resetPhotoStrip() {
    photoStrip = [];
    photoCounter = 0;
    photoCountElement.textContent = '0/3';
    photoStripPreview.innerHTML = '';
    downloadPhotoStripBtn.disabled = true;
    
    if (photoStripCanvas) {
        photoGallery.innerHTML = '';
        photoStripCanvas = null;
    }
}

// Function to download the photo strip
function downloadPhotoStrip() {
    if (!photoStripCanvas) return;
    
    const link = document.createElement('a');
    link.download = `photo-strip-${new Date().getTime()}.png`;
    
    // Convert the canvas to a data URL and set it as the href
    photoStripCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        link.href = url;
        
        // Trigger the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Release the object URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
    });
}