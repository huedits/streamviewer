// State to track added streams
let streams = [];

// DOM Elements
const platformSelect = document.getElementById('platformSelect');
const streamInput = document.getElementById('streamInput');
const addBtn = document.getElementById('addBtn');
const streamContainer = document.getElementById('streamContainer');

// Embed URL builders for each platform
function getEmbedUrl(platform, channelOrId) {
    // Trim whitespace
    const input = channelOrId.trim();
    
    switch (platform) {
        case 'twitch':
            // Embed Twitch channel
            // Supports: channel name or twitch.tv/channel URL
            let twitchChannel = input;
            // Extract channel name from URL if full URL is pasted
            const twitchMatch = input.match(/(?:twitch\.tv\/)([\w-]+)/);
            if (twitchMatch) {
                twitchChannel = twitchMatch[1];
            }
            return {
                url: `https://player.twitch.tv/?channel=${encodeURIComponent(twitchChannel)}&parent=huedits.github.io/streamviewer`,
                channel: twitchChannel
            };
        
        case 'kick':
            // Embed Kick channel
            let kickChannel = input;
            const kickMatch = input.match(/(?:kick\.com\/)([\w-]+)/);
            if (kickMatch) {
                kickChannel = kickMatch[1];
            }
            return {
                url: `https://player.kick.com/${encodeURIComponent(kickChannel)}`,
                channel: kickChannel
            };
        
        case 'youtube':
            // Embed YouTube video or live stream
            let videoId = input;
            // Extract video ID from various YouTube URL formats
            const youtubeMatch = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([\w-]{11})/);
            if (youtubeMatch) {
                videoId = youtubeMatch[1];
            }
            return {
                url: `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`,
                channel: videoId
            };
        
        default:
            return null;
    }
}

// Render all streams
function renderStreams() {
    // Clear container
    streamContainer.innerHTML = '';

    if (streams.length === 0) {
        // Show empty state
        streamContainer.innerHTML = `
            <div class="empty-state">
                <div class="icon">📺</div>
                <p>No streams added yet</p>
                <p>Select a platform, enter a <span>channel name</span> and click <span>+</span></p>
            </div>
        `;
        return;
    }

    // Render each stream
    streams.forEach((stream, index) => {
        const streamCard = document.createElement('div');
        streamCard.className = 'stream-wrapper';
        streamCard.innerHTML = `
            <div class="stream-header">
                <span class="platform-badge ${stream.platform}">${stream.platform}</span>
                <span class="stream-url" title="${stream.channel}">${stream.channel}</span>
                <button class="remove-btn" data-index="${index}" title="Remove stream">×</button>
            </div>
            <div class="stream-iframe-container">
                <iframe 
                    src="${stream.embedUrl}" 
                    allowfullscreen="true"
                    scrolling="no"
                ></iframe>
            </div>
        `;
        streamContainer.appendChild(streamCard);
    });

    // Attach remove event listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeStream(index);
        });
    });
}

// Add a new stream
function addStream() {
    const platform = platformSelect.value;
    const input = streamInput.value.trim();

    // Validate input
    if (!input) {
        alert('Please enter a channel name or video ID.');
        streamInput.focus();
        return;
    }

    const embedData = getEmbedUrl(platform, input);
    
    if (!embedData) {
        alert('Invalid input. Please check and try again.');
        return;
    }

    // Add to streams array
    streams.push({
        platform: platform,
        channel: embedData.channel,
        embedUrl: embedData.url
    });

    // Clear input
    streamInput.value = '';
    
    // Re-render
    renderStreams();

    // Focus back on input for quick adding
    streamInput.focus();
}

// Remove a stream by index
function removeStream(index) {
    streams.splice(index, 1);
    renderStreams();
}

// Event Listeners
addBtn.addEventListener('click', addStream);

streamInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addStream();
    }
});

// Initial render
renderStreams();