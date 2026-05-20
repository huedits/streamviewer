// Event Handlers
const EventHandlers = {
    init() {
        this.attachStreamContainerEvents();
        this.attachAddStreamEvents();
        this.attachRemoveAllEvent();
        this.attachKeyboardShortcuts();
    },
    
    attachStreamContainerEvents() {
        UI.elements.streamContainer.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            
            if (removeBtn) {
                const streamId = parseInt(removeBtn.getAttribute('data-stream-id'));
                
                if (streamId && !isNaN(streamId)) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.removeStream(streamId);
                }
            }
        });
    },
    
    attachAddStreamEvents() {
        UI.elements.addBtn.addEventListener('click', () => this.addStream());
        
        UI.elements.streamInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addStream();
        });
    },
    
    attachRemoveAllEvent() {
        const removeAllBtn = document.getElementById('removeAllBtn');
        
        if (removeAllBtn) {
            this.updateRemoveAllButton();
            
            removeAllBtn.addEventListener('click', () => {
                if (StreamState.getCount() > 0) {
                    this.confirmRemoveAll();
                }
            });
        }
    },
    
    attachKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z' && StreamState.getCount() > 0) {
                e.preventDefault();
                const lastStream = StreamState.streams[StreamState.getCount() - 1];
                this.removeStream(lastStream.id);
            }
            
            if (e.ctrlKey && e.shiftKey && e.key === 'Z' && StreamState.getCount() > 0) {
                e.preventDefault();
                this.confirmRemoveAll();
            }
        });
    },
    
    addStream() {
        const platform = Dropdown.getValue();
        const input = UI.elements.streamInput.value;
        
        if (!input.trim()) {
            UI.shakeInput();
            UI.elements.streamInput.focus();
            return;
        }
        
        const embedData = EmbedBuilder.getEmbedData(platform, input);
        
        if (!embedData) {
            alert('Invalid input. Please check and try again.');
            return;
        }
        
        if (StreamState.isDuplicate(platform, embedData.channel)) {
            UI.showNotification(`This ${platform} stream is already added!`, 'error');
            UI.elements.streamInput.focus();
            UI.elements.streamInput.select();
            return;
        }
        
        const streamData = StreamState.addStream(embedData);
        UI.addStreamCard(streamData);
        
        UI.elements.streamInput.value = '';
        UI.elements.streamInput.focus();
        
        UI.updateStreamCount();
        this.updateRemoveAllButton();
    },
    
    removeStream(streamId) {
        UI.removeStreamCard(streamId);
        this.updateRemoveAllButton();
    },
    
    removeAllStreams() {
        // Destroy all players
        EmbedManager.destroyAll();
        
        const allCards = UI.elements.streamContainer.querySelectorAll('.stream-wrapper');
        
        if (allCards.length === 0) {
            UI.showEmptyState();
            StreamState.streams = [];
            return;
        }
        
        allCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            }, index * 50);
        });
        
        const lastCard = allCards[allCards.length - 1];
        const handleTransitionEnd = () => {
            lastCard.removeEventListener('transitionend', handleTransitionEnd);
            
            UI.elements.streamContainer.innerHTML = '';
            StreamState.streams = [];
            UI.showEmptyState();
            UI.updateStreamCount();
            this.updateRemoveAllButton();
        };
        
        lastCard.addEventListener('transitionend', handleTransitionEnd);
        
        setTimeout(() => {
            if (UI.elements.streamContainer.querySelector('.stream-wrapper')) {
                UI.elements.streamContainer.innerHTML = '';
                StreamState.streams = [];
                UI.showEmptyState();
                UI.updateStreamCount();
                this.updateRemoveAllButton();
            }
        }, allCards.length * 50 + 500);
    },
    
    confirmRemoveAll() {
        const count = StreamState.getCount();
        
        UI.showConfirmDialog(
            `Are you sure you want to remove all ${count} stream${count > 1 ? 's' : ''}?`,
            () => {
                this.removeAllStreams();
            }
        );
    },
    
    updateRemoveAllButton() {
        const removeAllBtn = document.getElementById('removeAllBtn');
        if (removeAllBtn) {
            removeAllBtn.disabled = StreamState.getCount() === 0;
        }
    }
};