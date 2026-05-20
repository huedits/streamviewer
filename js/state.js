// State Management
const StreamState = {
    streams: [],
    streamCounter: 0,
    currentLayout: CONFIG.defaultLayout,
    
    // Add a stream
    addStream(streamData) {
        streamData.id = ++this.streamCounter;
        this.streams.push(streamData);
        return streamData;
    },
    
    // Remove a stream by ID
    removeStream(streamId) {
        const index = this.streams.findIndex(s => s.id === streamId);
        if (index === -1) {
            console.warn('Stream not found in state:', streamId);
            return -1;
        }
        
        this.streams.splice(index, 1);
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
    
    // Get stream count
    getCount() {
        return this.streams.length;
    }
};