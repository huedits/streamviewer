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

    adjustGrid() {
        const container = this.elements.streamContainer;
        const count = StreamState.getCount();
        
        if (count <= 1) return; // Single card handled by CSS :has()
        
        if (count <= 6) {
            // 2-6 cards: force 2 columns
            container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            // 7+ cards: allow up to 3 columns
            container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(350px, 1fr))';
        }
    },
    
    createStreamCard(streamData) {
        const streamCard = document.createElement('div');
        streamCard.className = 'stream-wrapper';
        streamCard.setAttribute('data-stream-id', streamData.id);
        
        const platformConfig = CONFIG.platforms[streamData.platform];
        
        streamCard.innerHTML = `
            <div class="stream-header header-${streamData.platform}">
                <div class="stream-header-left">
                    <span class="platform-name">${platformConfig.name}</span>
                    <span class="stream-url" title="${streamData.channel}">${streamData.channel}</span>
                </div>
                <button class="remove-btn" data-stream-id="${streamData.id}" title="Remove stream">×</button>
            </div>
            <div class="stream-iframe-container">
                <iframe 
                    src="${streamData.embedUrl}" 
                    allowfullscreen="true"
                    scrolling="no"
                    allow="autoplay; fullscreen"
                ></iframe>
            </div>
        `;
        
        return streamCard;
    },
    
    addStreamCard(streamData) {
        this.removeEmptyState();
        
        const card = this.createStreamCard(streamData);
        this.elements.streamContainer.appendChild(card);
        
        ChatManager.addChatTab(streamData);
        
        this.adjustGrid(); // Add this line
        
        requestAnimationFrame(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        
        this.updateStreamCount();
        return card;
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
            }
            
            this.adjustGrid(); // Add this line
            this.updateStreamCount();
        };
        
        card.addEventListener('transitionend', handleTransitionEnd);
        
        setTimeout(() => {
            if (card.parentNode) {
                handleTransitionEnd();
            }
        }, 500);
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