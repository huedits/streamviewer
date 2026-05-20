// Event Handlers
const EventHandlers = {
    init() {
        this.attachStreamContainerEvents();
        this.attachAddStreamEvents();
        this.attachKeyboardShortcuts();
    },
    
    attachStreamContainerEvents() {
        // Use a named function for event delegation
        UI.elements.streamContainer.addEventListener('click', this.handleStreamClick.bind(this));
        
        // Also attach directly to document as a fallback
        document.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            if (removeBtn && removeBtn.dataset.streamId) {
                console.log('Remove button clicked via document:', removeBtn.dataset.streamId); // Debug log
                e.stopPropagation();
                e.preventDefault();
                this.removeStream(parseInt(removeBtn.dataset.streamId));
            }
        });
    },
    
    handleStreamClick(e) {
        const removeBtn = e.target.closest('.remove-btn');
        const audioBtn = e.target.closest('.audio-toggle-btn');
        
        if (removeBtn) {
            const streamId = parseInt(removeBtn.getAttribute('data-stream-id'));
            console.log('Remove button clicked:', streamId); // Debug log
            
            if (streamId && !isNaN(streamId)) {
                e.stopPropagation();
                e.preventDefault();
                this.removeStream(streamId);
            }
        }
        
        if (audioBtn) {
            const streamId = parseInt(audioBtn.getAttribute('data-stream-id'));
            console.log('Audio button clicked:', streamId); // Debug log
            
            if (streamId && !isNaN(streamId)) {
                e.stopPropagation();
                e.preventDefault();
                this.toggleAudio(streamId);
            }
        }
    },
    
    attachAddStreamEvents() {
        UI.elements.addBtn.addEventListener('click', () => this.addStream());
        
        UI.elements.streamInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addStream();
        });
    },
    
    attachKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z' && StreamState.getCount() > 0) {
                e.preventDefault();
                const lastStream = StreamState.streams[StreamState.getCount() - 1];
                this.removeStream(lastStream.id);
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
        
        UI.updateLayout();
        UI.updateStreamCount();
        
        console.log('Stream added:', streamData); // Debug log
    },
    
    removeStream(streamId) {
        console.log('Removing stream:', streamId); // Debug log
        console.log('Current streams:', StreamState.streams); // Debug log
        
        UI.removeStreamCard(streamId);
    },
    
    toggleAudio(streamId) {
        StreamState.setActiveAudio(streamId);
        UI.updateAudioIndicators();
    }
};