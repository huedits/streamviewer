// Embed Manager using platform APIs
const EmbedManager = {
    players: {},
    
    createContainerId(streamId) {
        return `player-${streamId}`;
    },
    
    createPlayerContainer(streamId) {
        const container = document.createElement('div');
        container.id = this.createContainerId(streamId);
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;
        return container;
    },
    
    initPlayer(streamData, container) {
        const streamId = streamData.id;
        
        switch (streamData.platform) {
            case 'twitch':
                return this.initTwitchPlayer(streamData, container);
            case 'youtube':
                return this.initYouTubePlayer(streamData, container);
            case 'kick':
                return this.initKickPlayer(streamData, container);
            default:
                return null;
        }
    },
    
    initTwitchPlayer(streamData, container) {
        if (!document.querySelector('script[src="https://embed.twitch.tv/embed/v1.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://embed.twitch.tv/embed/v1.js';
            script.onload = () => this.createTwitchPlayer(streamData, container);
            document.head.appendChild(script);
        } else {
            this.createTwitchPlayer(streamData, container);
        }
    },
    
    createTwitchPlayer(streamData, container) {
        if (window.Twitch) {
            const player = new Twitch.Embed(container.id, {
                width: '100%',
                height: '100%',
                channel: streamData.channel,
                parent: [CONFIG.twitchParent],
                autoplay: true,
                muted: false,
                allowfullscreen: true
            });
            this.players[streamData.id] = player;
        }
    },
    
    initYouTubePlayer(streamData, container) {
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(script);
        }
        
        const checkAPI = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(checkAPI);
                this.createYouTubePlayer(streamData, container);
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkAPI), 5000);
    },
    
    createYouTubePlayer(streamData, container) {
        const player = new YT.Player(container.id, {
            videoId: streamData.channel,
            playerVars: {
                autoplay: 1,
                mute: 1,
                controls: 1,
                modestbranding: 1,
                rel: 0
            },
            events: {
                onReady: (event) => {
                    event.target.playVideo();
                }
            }
        });
        this.players[streamData.id] = player;
    },
    
    initKickPlayer(streamData, container) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://player.kick.com/${encodeURIComponent(streamData.channel)}?autoplay=true`;
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';
        iframe.allowFullscreen = true;
        iframe.setAttribute('allow', 'autoplay; fullscreen');
        container.appendChild(iframe);
        this.players[streamData.id] = iframe;
    },
    
    destroyPlayer(streamId) {
        const player = this.players[streamId];
        if (player) {
            if (player.destroy) {
                player.destroy();
            } else if (player.remove) {
                player.remove();
            }
            delete this.players[streamId];
        }
    },
    
    destroyAll() {
        Object.keys(this.players).forEach(id => {
            this.destroyPlayer(parseInt(id));
        });
        this.players = {};
    }
};

// Embed URL Parser (used for extracting channel/video IDs)
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
    
    getEmbedData(platform, input) {
        const channel = this.parseInput(platform, input);
        if (!channel) return null;
        
        return {
            platform: platform,
            channel: channel
        };
    }
};