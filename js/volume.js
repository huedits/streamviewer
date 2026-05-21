// Volume Manager
const VolumeManager = {
    currentVolume: 50,
    isMuted: false,
    previousVolume: 50,
    
    init() {
        this.slider = document.getElementById('volumeSlider');
        this.valueDisplay = document.getElementById('volumeValue');
        this.iconBtn = document.getElementById('volumeIconBtn');
        this.icon = document.getElementById('volumeIcon');
        
        this.attachEvents();
        this.updateDisplay();
    },
    
    attachEvents() {
        // Slider change
        this.slider.addEventListener('input', () => {
            this.setVolume(parseInt(this.slider.value));
        });
        
        // Icon click to toggle mute
        this.iconBtn.addEventListener('click', () => {
            this.toggleMute();
        });
    },
    
    setVolume(value) {
        this.currentVolume = Math.max(0, Math.min(100, value));
        this.isMuted = this.currentVolume === 0;
        this.slider.value = this.currentVolume;
        
        if (this.currentVolume > 0) {
            this.previousVolume = this.currentVolume;
        }
        
        this.updateDisplay();
        this.applyVolumeToAllIframes();
    },
    
    toggleMute() {
        if (this.isMuted) {
            // Unmute
            this.setVolume(this.previousVolume > 0 ? this.previousVolume : 50);
        } else {
            // Mute
            this.previousVolume = this.currentVolume;
            this.setVolume(0);
        }
    },
    
    getVolume() {
        return this.currentVolume;
    },
    
    getVolumeDecimal() {
        return this.currentVolume / 100;
    },
    
    applyVolumeToAllIframes() {
        const iframes = document.querySelectorAll('.stream-iframe-container iframe');
        const volume = this.getVolumeDecimal();
        
        iframes.forEach(iframe => {
            try {
                // Try to access iframe content and set volume
                if (iframe.contentWindow) {
                    // For YouTube iframes
                    iframe.contentWindow.postMessage(JSON.stringify({
                        event: 'command',
                        func: 'setVolume',
                        args: [this.currentVolume]
                    }), '*');
                    
                    // For Twitch iframes
                    iframe.contentWindow.postMessage({
                        type: 'setVolume',
                        volume: volume
                    }, '*');
                }
            } catch (e) {
                // Cross-origin iframes can't be directly controlled
                // The volume attribute on embed URL will handle initial volume
            }
        });
        
        // Store volume preference
        localStorage.setItem('streamViewerVolume', this.currentVolume);
        localStorage.setItem('streamViewerMuted', this.isMuted);
    },
    
    updateDisplay() {
        // Update value text
        this.valueDisplay.textContent = this.currentVolume;
        
        // Update slider
        this.slider.value = this.currentVolume;
        
        // Update icon
        if (this.isMuted || this.currentVolume === 0) {
            this.icon.innerHTML = `
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            `;
            this.iconBtn.classList.add('muted');
        } else if (this.currentVolume < 50) {
            this.icon.innerHTML = `
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
            `;
            this.iconBtn.classList.remove('muted');
        } else {
            this.icon.innerHTML = `
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            `;
            this.iconBtn.classList.remove('muted');
        }
    },
    
    // Load saved volume
    loadSavedVolume() {
        const savedVolume = localStorage.getItem('streamViewerVolume');
        const savedMuted = localStorage.getItem('streamViewerMuted');
        
        if (savedVolume !== null) {
            const volume = parseInt(savedVolume);
            if (savedMuted === 'true') {
                this.setVolume(0);
            } else {
                this.setVolume(volume);
            }
        }
    }
};