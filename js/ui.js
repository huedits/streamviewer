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
        
        this.updateGridClass();
        
        requestAnimationFrame(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        
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
        
        // Remove all count classes
        container.classList.remove('count-1', 'count-2', 'count-3', 'count-4', 'count-5', 'count-6', 'count-odd', 'count-even');
        
        if (count === 0) return;
        
        // Specific layouts for each count up to 6
        switch(count) {
            case 1:
                container.classList.add('count-1');
                break;
            case 2:
                container.classList.add('count-2');
                break;
            case 3:
                container.classList.add('count-3');
                break;
            case 4:
                container.classList.add('count-4');
                break;
            case 5:
                container.classList.add('count-5');
                break;
            case 6:
                container.classList.add('count-6');
                break;
            default:
                // For 7+ cards, use odd/even pattern with 3 columns
                if (count % 2 === 1) {
                    container.classList.add('count-odd');
                } else {
                    container.classList.add('count-even');
                }
                break;
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