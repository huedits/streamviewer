// State Management
const StreamState = {
    streams: [],
    activeAudioStream: null,
    streamCounter: 0,
    currentLayout: CONFIG.defaultLayout,
    
    // Add a stream
    addStream(streamData) {
        streamData.id = ++this.streamCounter;
        this.streams.push(streamData);
        
        if (this.streams.length === 1) {
            this.activeAudioStream = 0;
        }
        
        return streamData;
    },
    
    // Remove a stream by ID
    removeStream(streamId) {
        const index = this.streams.findIndex(s => s.id === streamId);
        if (index === -1) return -1;
        
        this.streams.splice(index, 1);
        
        // Update active audio stream
        if (this.streams.length === 0) {
            this.activeAudioStream = null;
        } else if (this.activeAudioStream === index) {
            this.activeAudioStream = 0;
        } else if (this.activeAudioStream > index) {
            this.activeAudioStream--;
        }
        
        return index;
    },
    
    // Get stream by ID
    getStream(streamId) {
        return this.streams.find(s => s.id === streamId);
    },
    
    // Get stream index by ID
    getStreamIndex(streamId) {
        return this.streams.findIndex(s => s.id === streamId);
    },
    
    // Check for duplicate
    isDuplicate(platform, channel) {
        return this.streams.some(stream => 
            stream.platform === platform && 
            stream.channel.toLowerCase() === channel.toLowerCase()
        );
    },
    
    // Set active audio
    setActiveAudio(streamId) {
        const stream = this.getStream(streamId);
        if (!stream) return;
        
        const newIndex = this.streams.indexOf(stream);
        
        if (this.activeAudioStream === newIndex) {
            this.activeAudioStream = null;
        } else {
            this.activeAudioStream = newIndex;
        }
    },
    
    // Get stream count
    getCount() {
        return this.streams.length;
    }
};