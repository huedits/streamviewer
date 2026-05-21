// UI Components and Rendering
const UI = {
    elements: {
        streamInput: null,
        addBtn: null,
        streamContainer: null,
        controlBar: null
    },
    
    init() {
        this.elements.streamInput = document.getElementById('streamInput');
        this.elements.addBtn = document.getElementById('addBtn');
        this.elements.streamContainer = document.getElementById('streamContainer');
        this.elements.controlBar = document.querySelector('.control-bar');
    },
    
    createStreamCard(streamData) {
        const streamCard = document.createElement('div');
        streamCard.className = 'stream-wrapper';
        streamCard.setAttribute('data-stream-id', streamData.id);
        
        const platformConfig = CONFIG.platforms[streamData.platform];
        
        streamCard.innerHTML = `
            <div class="stream-header">
                <div class="stream-header-left">
                    <span class="platform-badge ${streamData.platform}">
                        ${platformConfig.icon}
                        ${platformConfig.name}
                    </span>
                    <span class="stream-url" title="${streamData.channel}">${streamData.channel}</span>
                </div>
                <div class="volume-control">
                    <button class="volume-icon-btn" data-stream-id="${streamData.id}" title="Mute/Unmute">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                    </button>
                    <input type="range" class="volume-slider" min="0" max="100" value="100" data-stream-id="${streamData.id}">
                    <span class="volume-value">100</span>
                </div>
                <button class="remove-btn" data-stream-id="${streamData.id}" title="Remove stream">×</button>
            </div>
            <div class="stream-iframe-container">
                <iframe 
                    src="${streamData.embedUrl}" 
                    allowfullscreen="true"
                    scrolling="no"
                    allow="autoplay; fullscreen"
                    id="iframe-${streamData.id}"
                ></iframe>
            </div>
        `;
        
        return streamCard;
    },
    
    addStreamCard(streamData) {
        this.removeEmptyState();
        
        const card = this.createStreamCard(streamData);
        this.elements.streamContainer.appendChild(card);
        
        // Add chat tab
        ChatManager.addChatTab(streamData);
        
        // Attach volume control events
        this.attachVolumeEvents(card, streamData);
        
        this.updateGridClass();
        
        requestAnimationFrame(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        
        return card;
    },
    
    attachVolumeEvents(card, streamData) {
        const slider = card.querySelector('.volume-slider');
        const iconBtn = card.querySelector('.volume-icon-btn');
        const valueDisplay = card.querySelector('.volume-value');
        const iframe = card.querySelector('iframe');
        
        let currentVolume = 100;
        let previousVolume = 100;
        let isMuted = false;
        
        const updateIcon = () => {
            const svg = iconBtn.querySelector('svg');
            if (isMuted || currentVolume === 0) {
                svg.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
                iconBtn.classList.add('muted');
            } else if (currentVolume < 50) {
                svg.innerHTML = `<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>`;
                iconBtn.classList.remove('muted');
            } else {
                svg.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
                iconBtn.classList.remove('muted');
            }
        };
        
        const updateVolume = (volume) => {
            currentVolume = Math.max(0, Math.min(100, volume));
            slider.value = currentVolume;
            valueDisplay.textContent = currentVolume;
            
            if (currentVolume > 0) {
                isMuted = false;
                previousVolume = currentVolume;
            } else {
                isMuted = true;
            }
            
            updateIcon();
            this.setIframeVolume(iframe, streamData, currentVolume);
        };
        
        slider.addEventListener('input', (e) => {
            e.stopPropagation();
            updateVolume(parseInt(slider.value));
        });
        
        iconBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isMuted) {
                updateVolume(previousVolume > 0 ? previousVolume : 50);
            } else {
                previousVolume = currentVolume;
                updateVolume(0);
            }
        });
        
        // Set initial volume
        updateIcon();
    },
    
    setIframeVolume(iframe, streamData, volume) {
        if (!iframe) return;
        
        const volumeDecimal = volume / 100;
        
        // Method 1: Post message to iframe
        try {
            iframe.contentWindow.postMessage({
                type: 'volumeChange',
                volume: volumeDecimal
            }, '*');
            
            // YouTube specific
            iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'setVolume',
                args: [volume]
            }), '*');
        } catch (e) {}
        
        // Method 2: Reload iframe with volume parameter for Twitch
        if (streamData.platform === 'twitch') {
            const src = iframe.src;
            const baseSrc = src.split('&volume=')[0];
            iframe.src = `${baseSrc}&volume=${volumeDecimal}`;
        }
    },
    
    removeStreamCard(streamId) {
        const card = this.elements.streamContainer.querySelector(`.stream-wrapper[data-stream-id="${streamId}"]`);
        
        if (!card) return;
        
        ChatManager.removeChatTab(streamId);
        
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        const handleTransitionEnd = () => {
            card.removeEventListener('transitionend', handleTransitionEnd);
            if (card.parentNode) {
                card.remove();
            }
            
            StreamState.removeStream(streamId);
            
            if (StreamState.getCount() === 0) {
                this.showEmptyState();
            } else {
                this.updateGridClass();
            }
            
            this.updateStreamCount();
        };
        
        card.addEventListener('transitionend', handleTransitionEnd);
        
        setTimeout(() => {
            if (card.parentNode) {
                handleTransitionEnd();
            }
        }, 500);
    },
    
    updateGridClass() {
        const container = this.elements.streamContainer;
        const count = StreamState.getCount();
        
        container.classList.remove('count-1', 'count-2', 'count-odd', 'count-even');
        
        if (count === 0) return;
        
        if (count === 1) {
            container.classList.add('count-1');
        } else if (count === 2) {
            container.classList.add('count-2');
        } else if (count % 2 === 1) {
            container.classList.add('count-odd');
        } else {
            container.classList.add('count-even');
        }
    },
    
    removeEmptyState() {
        const emptyState = this.elements.streamContainer.querySelector('.empty-state');
        if (emptyState) emptyState.remove();
    },
    
    showEmptyState() {
        this.elements.streamContainer.innerHTML = `
            <div class="empty-state">
                <div class="icon">📺</div>
                <p>No streams added yet</p>
                <p>Select a platform, enter a <span>channel name</span> and click <span>+</span></p>
            </div>
        `;
        this.elements.streamContainer.classList.remove('count-1', 'count-2', 'count-odd', 'count-even');
    },
    
    updateStreamCount() {
        const existingBadge = document.querySelector('.stream-count');
        if (existingBadge) existingBadge.remove();
        
        const count = StreamState.getCount();
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'stream-count';
            badge.textContent = count;
            this.elements.addBtn.appendChild(badge);
        }
    },
    
    showConfirmDialog(message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-dialog">
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="confirm-btn cancel">Cancel</button>
                    <button class="confirm-btn confirm">Remove All</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const cancelBtn = overlay.querySelector('.cancel');
        const confirmBtn = overlay.querySelector('.confirm');
        
        const close = () => {
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
        };
        
        const escHandler = (e) => {
            if (e.key === 'Escape') close();
        };
        
        cancelBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
        
        confirmBtn.addEventListener('click', () => {
            close();
            onConfirm();
        });
        
        document.addEventListener('keydown', escHandler);
    },
    
    showNotification(message, type = 'error') {
        const existing = document.querySelector('.notification-toast');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'error' ? '#ff4444' : '#53fc18'};
            color: ${type === 'error' ? 'white' : '#0e0e10'};
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 3000);
    },
    
    shakeInput() {
        const input = this.elements.streamInput;
        input.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
};