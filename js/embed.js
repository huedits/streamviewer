// Embed URL Generation
const EmbedBuilder = {
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
    
    buildUrl(platform, channel) {
        let url = '';
        
        switch (platform) {
            case 'twitch':
                url = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${CONFIG.twitchParent}&muted=true`;
                break;
            case 'kick':
                url = `https://player.kick.com/${encodeURIComponent(channel)}?autoplay=true`;
                break;
            case 'youtube':
                url = `https://www.youtube.com/embed/${encodeURIComponent(channel)}?autoplay=1&mute=1&enablejsapi=1`;
                break;
        }
        
        return url;
    },
    
    getEmbedData(platform, input) {
        const channel = this.parseInput(platform, input);
        if (!channel) return null;
        
        const url = this.buildUrl(platform, channel);
        
        return {
            platform: platform,
            channel: channel,
            embedUrl: url
        };
    }
};