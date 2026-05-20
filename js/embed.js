// Embed URL Generation
const EmbedBuilder = {
    // Parse channel/ID from user input
    parseInput(platform, input) {
        const trimmed = input.trim();
        
        switch (platform) {
            case 'twitch':
                const twitchMatch = trimmed.match(/(?:twitch\.tv\/)([\w-]+)/);
                return twitchMatch ? twitchMatch[1] : trimmed;
            
            case 'kick':
                const kickMatch = trimmed.match(/(?:kick\.com\/)([\w-]+)/);
                return kickMatch ? kickMatch[1] : trimmed;
            
            case 'youtube':
                const youtubeMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([\w-]{11})/);
                return youtubeMatch ? youtubeMatch[1] : trimmed;
            
            default:
                return trimmed;
        }
    },
    
    // Build embed URL
    buildUrl(platform, channel, isFirst) {
        let url = '';
        
        switch (platform) {
            case 'twitch':
                const muted = isFirst ? 'false' : 'true';
                url = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${CONFIG.twitchParent}&muted=${muted}`;
                break;
            
            case 'kick':
                url = `https://player.kick.com/${encodeURIComponent(channel)}`;
                break;
            
            case 'youtube':
                const muteParam = isFirst ? 'mute=0' : 'mute=1';
                url = `https://www.youtube.com/embed/${encodeURIComponent(channel)}?${muteParam}`;
                break;
        }
        
        return url;
    },
    
    // Get complete embed data
    getEmbedData(platform, input) {
        const channel = this.parseInput(platform, input);
        if (!channel) return null;
        
        const isFirst = StreamState.getCount() === 0;
        const url = this.buildUrl(platform, channel, isFirst);
        
        return {
            platform: platform,
            channel: channel,
            embedUrl: url
        };
    }
};