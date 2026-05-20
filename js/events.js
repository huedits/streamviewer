// Event Handlers
const EventHandlers = {
    init() {
        this.attachStreamContainerEvents();
        this.attachAddStreamEvents();
        this.attachKeyboardShortcuts();
    },
    
    attachStreamContainerEvents() {
        // Event delegation for stream cards
        UI.elements.streamContainer.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            const audioBtn = e.target.closest('.audio-toggle-btn');
            
            if (removeBtn) {
                e.stopPropagation();
                const streamId = parseInt(removeBtn.dataset.streamId);
                if (streamId) this.removeStream(streamId);
            }
            
            if (audioBtn) {
                e.stopPropagation();
                const streamId = parseInt(audioBtn.dataset.streamId);
                if (streamId) this.toggleAudio(streamId);
            }
        });
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
    },
    
    removeStream(streamId) {
        UI.removeStreamCard(streamId);
        StreamState.removeStream(streamId);
        UI.updateLayout();
        UI.updateStreamCount();
    },
    
    toggleAudio(streamId) {
        StreamState.setActiveAudio(streamId);
        UI.updateAudioIndicators();
    }
};