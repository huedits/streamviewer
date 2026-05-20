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
        
        const streamCard = document.createElement('div');
        streamCard.className = 'stream-wrapper';
        streamCard.setAttribute('data-stream-id', streamData.id);
        
        if (isNew) streamCard.classList.add('new-stream');
        
        const platformConfig = CONFIG.platforms[streamData.platform];
        
        streamCard.innerHTML = `
            <div class="stream-header">
                <span class="platform-badge ${streamData.platform}">
                    ${platformConfig.icon}
                    ${platformConfig.name}
                </span>
                <span class="stream-url" title="${streamData.channel}">${streamData.channel}</span>
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
        
        this.updateGridClass();
        
        void card.offsetWidth;
        
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        return card;
    },
    
    // Remove stream card with animation
    removeStreamCard(streamId) {
        const card = this.elements.streamContainer.querySelector(`.stream-wrapper[data-stream-id="${streamId}"]`);
        
        if (!card) {
            console.warn('Card not found for stream ID:', streamId);
            return;
        }
        
        card.classList.add('removing');
        
        const handleAnimationEnd = () => {
            card.removeEventListener('animationend', handleAnimationEnd);
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
        
        card.addEventListener('animationend', handleAnimationEnd);
        
        setTimeout(() => {
            if (card.parentNode) {
                handleAnimationEnd();
            }
        }, 500);
    },
    
    // Update grid class based on count
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
        this.elements.streamContainer.classList.remove('count-1', 'count-2', 'count-odd', 'count-even');
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
    
    // Show confirmation dialog
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
        };
        
        cancelBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
        
        confirmBtn.addEventListener('click', () => {
            close();
            onConfirm();
        });
        
        // Escape key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
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