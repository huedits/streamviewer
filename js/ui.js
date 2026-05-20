// UI Components and Rendering
const UI = {
    // DOM Elements
    elements: {
        streamInput: null,
        addBtn: null,
        streamContainer: null,
        controlBar: null
    },
    
    // Initialize DOM references
    init() {
        this.elements.streamInput = document.getElementById('streamInput');
        this.elements.addBtn = document.getElementById('addBtn');
        this.elements.streamContainer = document.getElementById('streamContainer');
        this.elements.controlBar = document.querySelector('.control-bar');
    },
    
    // Create stream card HTML
    createStreamCard(streamData, index) {
        const isNew = index === StreamState.getCount() - 1 && StreamState.getCount() > 1;
        const isActive = index === StreamState.activeAudioStream;
        
        const streamCard = document.createElement('div');
        streamCard.className = 'stream-wrapper';
        streamCard.setAttribute('data-stream-id', streamData.id);
        
        if (isNew) streamCard.classList.add('new-stream');
        if (isActive) streamCard.classList.add('audio-active');
        
        const platformConfig = CONFIG.platforms[streamData.platform];
        const audioIcon = isActive ? '🔊' : '🔇';
        const audioTitle = isActive ? 'Audio On (Click to mute)' : 'Audio Off (Click to unmute)';
        
        streamCard.innerHTML = `
            <div class="stream-header">
                <span class="platform-badge ${streamData.platform}">
                    ${platformConfig.icon}
                    ${platformConfig.name}
                </span>
                <span class="stream-url" title="${streamData.channel}">${streamData.channel}</span>
                <button class="audio-toggle-btn" data-stream-id="${streamData.id}" title="${audioTitle}">${audioIcon}</button>
                <button class="remove-btn" data-stream-id="${streamData.id}" title="Remove stream">×</button>
            </div>
            <div class="stream-iframe-container">
                <iframe 
                    src="${streamData.embedUrl}" 
                    allowfullscreen="true"
                    scrolling="no"
                ></iframe>
            </div>
        `;
        
        return streamCard;
    },
    
    // Add stream card to container
    addStreamCard(streamData) {
        this.removeEmptyState();
        
        const index = StreamState.getCount() - 1;
        const card = this.createStreamCard(streamData, index);
        this.elements.streamContainer.appendChild(card);
        
        // Trigger reflow for animation
        void card.offsetWidth;
        
        // Scroll to new card
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        return card;
    },
    
    // Remove stream card with animation
    removeStreamCard(streamId) {
        // Use a more specific selector to ensure we find the right card
        const card = this.elements.streamContainer.querySelector(`.stream-wrapper[data-stream-id="${streamId}"]`);
        
        if (!card) {
            console.warn('Card not found for stream ID:', streamId);
            return;
        }
        
        console.log('Removing card:', streamId); // Debug log
        
        card.classList.add('removing');
        
        const handleAnimationEnd = () => {
            card.removeEventListener('animationend', handleAnimationEnd);
            if (card.parentNode) {
                card.remove();
            }
            
            // Update state AFTER card is removed
            StreamState.removeStream(streamId);
            
            if (StreamState.getCount() === 0) {
                this.showEmptyState();
            } else {
                this.updateAudioIndicators();
            }
            
            this.updateLayout();
            this.updateStreamCount();
        };
        
        card.addEventListener('animationend', handleAnimationEnd);
        
        // Fallback: if animation doesn't fire, remove after timeout
        setTimeout(() => {
            if (card.parentNode) {
                handleAnimationEnd();
            }
        }, 500);
    },
    
    // Update audio indicators
    updateAudioIndicators() {
        const cards = this.elements.streamContainer.querySelectorAll('.stream-wrapper');
        cards.forEach(card => {
            const streamId = parseInt(card.getAttribute('data-stream-id'));
            const stream = StreamState.getStream(streamId);
            if (!stream) return;
            
            const streamIndex = StreamState.getStreamIndex(streamId);
            const audioBtn = card.querySelector('.audio-toggle-btn');
            
            if (streamIndex === StreamState.activeAudioStream) {
                card.classList.add('audio-active');
                if (audioBtn) {
                    audioBtn.innerHTML = '🔊';
                    audioBtn.setAttribute('title', 'Audio On (Click to mute)');
                }
            } else {
                card.classList.remove('audio-active');
                if (audioBtn) {
                    audioBtn.innerHTML = '🔇';
                    audioBtn.setAttribute('title', 'Audio Off (Click to unmute)');
                }
            }
        });
    },
    
    // Show/hide empty state
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
    },
    
    // Update layout
    updateLayout() {
        const container = this.elements.streamContainer;
        container.classList.remove('layout-single', 'layout-double', 'layout-triple', 'layout-grid', 'few-items');
        container.classList.add(`layout-${StreamState.currentLayout}`);
        
        if (StreamState.currentLayout === 'grid' && StreamState.getCount() <= 2) {
            container.classList.add('few-items');
        }
        
        if (StreamState.currentLayout === 'grid') {
            const count = StreamState.getCount();
            if (count === 1) {
                container.style.gridTemplateColumns = '1fr';
                container.style.maxWidth = '1400px';
                container.style.margin = '0 auto';
            } else if (count === 2) {
                container.style.gridTemplateColumns = 'repeat(2, 1fr)';
                container.style.maxWidth = '100%';
                container.style.margin = '0';
            } else if (count === 3) {
                container.style.gridTemplateColumns = 'repeat(3, 1fr)';
                container.style.maxWidth = '100%';
                container.style.margin = '0';
            } else if (count === 4) {
                container.style.gridTemplateColumns = 'repeat(2, 1fr)';
                container.style.maxWidth = '100%';
                container.style.margin = '0';
            } else {
                container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(400px, 1fr))';
                container.style.maxWidth = '100%';
                container.style.margin = '0';
            }
        } else if (StreamState.currentLayout === 'single') {
            container.style.maxWidth = '1400px';
            container.style.margin = '0 auto';
        } else {
            container.style.maxWidth = '100%';
            container.style.margin = '0';
        }
        
        // Auto-scroll to bottom when new stream is added
        if (StreamState.getCount() > 0) {
            setTimeout(() => {
                const lastCard = container.querySelector('.stream-wrapper:last-child');
                if (lastCard) {
                    lastCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        }
},
    
    // Update stream count badge
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
    
    // Show notification
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
    
    // Shake input
    shakeInput() {
        const input = this.elements.streamInput;
        input.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
};