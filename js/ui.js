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
        
        // Handle visibility change to keep iframes alive
        this.handleVisibilityChange();
    },
    
    // Prevent iframes from pausing when tab is hidden
    handleVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Page is visible again
                const iframes = this.elements.streamContainer.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    // Briefly touch the iframe to prevent pause
                    const currentSrc = iframe.src;
                    if (currentSrc) {
                        // Force iframe to stay active
                        iframe.style.display = 'none';
                        iframe.offsetHeight; // Force reflow
                        iframe.style.display = '';
                    }
                });
            }
        });
    },
    
    // Create stream card HTML
    createStreamCard(streamData) {
        const streamCard = document.createElement('div');
        streamCard.className = 'stream-wrapper';
        streamCard.setAttribute('data-stream-id', streamData.id);
        
        streamCard.innerHTML = `
            <div class="stream-iframe-container">
                <iframe 
                    src="${streamData.embedUrl}" 
                    allowfullscreen="true"
                    scrolling="no"
                    allow="autoplay; fullscreen"
                ></iframe>
            </div>
            <button class="remove-btn" data-stream-id="${streamData.id}" title="Remove stream">×</button>
        `;
        
        return streamCard;
    },
    
    // Add stream card to container (without touching existing iframes)
    addStreamCard(streamData) {
        this.removeEmptyState();
        
        const card = this.createStreamCard(streamData);
        this.elements.streamContainer.appendChild(card);
        
        // Only update grid class, never touch existing cards
        this.updateGridClass();
        
        requestAnimationFrame(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        
        return card;
    },
    
    // Remove stream card with animation
    removeStreamCard(streamId) {
        const card = this.elements.streamContainer.querySelector(`.stream-wrapper[data-stream-id="${streamId}"]`);
        
        if (!card) return;
        
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
    
    // Update grid class based on count
    updateGridClass() {
        const container = this.elements.streamContainer;
        const count = StreamState.getCount();
        
        // Remove all count classes
        container.classList.remove('count-1', 'count-2', 'count-odd', 'count-even');
        
        if (count === 0) return;
        
        if (count === 1) {
            container.classList.add('count-1');
        } else if (count === 2) {
            container.classList.add('count-2');
        } else if (count % 2 === 1) {
            // All odd counts (3, 5, 7, etc): first card centered at 50%, rest 2 columns
            container.classList.add('count-odd');
        } else {
            // All even counts (4, 6, 8, etc): all 2 columns
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