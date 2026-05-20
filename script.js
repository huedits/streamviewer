// State to track added streams
let streams = [];
let currentLayout = 'single'; // Default to single column layout
let activeAudioStream = null; // Track which stream has audio enabled
let streamCounter = 0; // Unique ID counter for streams

// DOM Elements
let platformSelect = document.getElementById('platformSelect');
const streamInput = document.getElementById('streamInput');
const addBtn = document.getElementById('addBtn');
const streamContainer = document.getElementById('streamContainer');
const controlBar = document.querySelector('.control-bar');

// SVG Icons for each platform
const platformIcons = {
    twitch: `<svg class="platform-icon" viewBox="0 0 24 24" fill="#9147ff">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
    </svg>`,
    
    kick: `<svg class="platform-icon" viewBox="0 0 24 24" fill="#53fc18">
        <path d="M8 3v18M8 12l12-9M8 12l12 9" stroke="#53fc18" stroke-width="2" fill="none"/>
    </svg>`,
    
    youtube: `<svg class="platform-icon" viewBox="0 0 24 24" fill="#ff0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>`
};

// Create custom dropdown
function createCustomDropdown() {
    const originalSelect = document.getElementById('platformSelect');
    
    // Create custom dropdown container
    const customDropdown = document.createElement('div');
    customDropdown.className = 'custom-dropdown';
    
    // Create button
    const dropdownButton = document.createElement('button');
    dropdownButton.className = 'dropdown-button';
    dropdownButton.type = 'button';
    
    // Get selected option
    const selectedOption = originalSelect.options[originalSelect.selectedIndex];
    const selectedValue = selectedOption.value;
    const selectedText = selectedOption.text;
    
    dropdownButton.innerHTML = `
        ${platformIcons[selectedValue]}
        <span class="selected-text">${selectedText}</span>
        <span class="arrow">▼</span>
    `;
    
    // Create menu
    const dropdownMenu = document.createElement('ul');
    dropdownMenu.className = 'dropdown-menu';
    
    // Add options to menu
    Array.from(originalSelect.options).forEach(option => {
        const li = document.createElement('li');
        li.className = 'dropdown-item';
        if (option.value === selectedValue) {
            li.classList.add('selected');
        }
        li.dataset.value = option.value;
        li.innerHTML = `
            ${platformIcons[option.value]}
            <span>${option.text}</span>
        `;
        
        li.addEventListener('click', function() {
            // Update original select
            originalSelect.value = this.dataset.value;
            
            // Update button display
            dropdownButton.innerHTML = `
                ${platformIcons[this.dataset.value]}
                <span class="selected-text">${this.querySelector('span').textContent}</span>
                <span class="arrow">▼</span>
            `;
            
            // Update selected state
            document.querySelectorAll('.dropdown-item').forEach(item => {
                item.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Close dropdown
            customDropdown.classList.remove('active');
            
            // Trigger change event on original select
            originalSelect.dispatchEvent(new Event('change'));
        });
        
        dropdownMenu.appendChild(li);
    });
    
    // Toggle dropdown
    dropdownButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        customDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!customDropdown.contains(e.target)) {
            customDropdown.classList.remove('active');
        }
    });
    
    // Assemble custom dropdown
    customDropdown.appendChild(dropdownButton);
    customDropdown.appendChild(dropdownMenu);
    
    // Replace original select
    originalSelect.parentNode.insertBefore(customDropdown, originalSelect);
    originalSelect.classList.add('hidden-select');
    
    // Update reference to use the hidden select
    platformSelect = originalSelect;
}

// Add layout control buttons
function addLayoutControls() {
    const layoutControls = document.createElement('div');
    layoutControls.className = 'layout-controls';
    layoutControls.innerHTML = `
        <button class="layout-btn active" data-layout="single" title="Single Column">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
            </svg>
        </button>
        <button class="layout-btn" data-layout="double" title="Two Columns">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="8" height="16" rx="2"/>
                <rect x="13" y="4" width="8" height="16" rx="2"/>
            </svg>
        </button>
        <button class="layout-btn" data-layout="triple" title="Three Columns">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="4" width="5" height="16" rx="2"/>
                <rect x="9.5" y="4" width="5" height="16" rx="2"/>
                <rect x="17" y="4" width="5" height="16" rx="2"/>
            </svg>
        </button>
        <button class="layout-btn" data-layout="grid" title="Auto Grid">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="8" height="8" rx="1"/>
                <rect x="13" y="3" width="8" height="8" rx="1"/>
                <rect x="3" y="13" width="8" height="8" rx="1"/>
                <rect x="13" y="13" width="8" height="8" rx="1"/>
            </svg>
        </button>
    `;
    
    controlBar.appendChild(layoutControls);
    
    // Layout button event listeners
    document.querySelectorAll('.layout-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const layout = this.dataset.layout;
            currentLayout = layout;
            updateLayout();
        });
    });
}

// Update layout based on current selection
function updateLayout() {
    switch(currentLayout) {
        case 'single':
            streamContainer.style.gridTemplateColumns = '1fr';
            break;
        case 'double':
            streamContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
            break;
        case 'triple':
            streamContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
            break;
        case 'grid':
        default:
            // Responsive auto-fit grid
            if (streams.length === 1) {
                streamContainer.style.gridTemplateColumns = '1fr';
            } else if (streams.length === 2) {
                streamContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else {
                streamContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
            }
            break;
    }
}

// Update stream count display
function updateStreamCount() {
    // Remove existing count badge
    const existingBadge = document.querySelector('.stream-count');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Add new count badge if there are streams
    if (streams.length > 0) {
        const countBadge = document.createElement('span');
        countBadge.className = 'stream-count';
        countBadge.textContent = streams.length;
        addBtn.appendChild(countBadge);
    }
}

// Get the correct parent for Twitch embed
function getTwitchParent() {
    const hostname = window.location.hostname;
    
    // If running on localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'localhost';
    }
    
    // If running on GitHub Pages
    if (hostname.includes('github.io')) {
        return hostname; // Returns full domain like 'huedits.github.io'
    }
    
    // Default fallback
    return hostname || 'localhost';
}

// Check for duplicate streams
function isDuplicateStream(platform, channel) {
    return streams.some(stream => 
        stream.platform === platform && 
        stream.channel.toLowerCase() === channel.toLowerCase()
    );
}

// Build embed URL with audio parameters
function getEmbedUrl(platform, channelOrId, isFirst) {
    const input = channelOrId.trim();
    let baseUrl = '';
    let channel = '';
    
    switch (platform) {
        case 'twitch':
            let twitchChannel = input;
            const twitchMatch = input.match(/(?:twitch\.tv\/)([\w-]+)/);
            if (twitchMatch) {
                twitchChannel = twitchMatch[1];
            }
            const parent = getTwitchParent();
            channel = twitchChannel;
            // First stream has audio, rest are muted
            const muted = isFirst ? 'false' : 'true';
            baseUrl = `https://player.twitch.tv/?channel=${encodeURIComponent(twitchChannel)}&parent=${parent}&muted=${muted}`;
            break;
        
        case 'kick':
            let kickChannel = input;
            const kickMatch = input.match(/(?:kick\.com\/)([\w-]+)/);
            if (kickMatch) {
                kickChannel = kickMatch[1];
            }
            channel = kickChannel;
            baseUrl = `https://player.kick.com/${encodeURIComponent(kickChannel)}`;
            break;
        
        case 'youtube':
            let videoId = input;
            const youtubeMatch = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([\w-]{11})/);
            if (youtubeMatch) {
                videoId = youtubeMatch[1];
            }
            channel = videoId;
            // First stream has audio (mute=0), rest are muted (mute=1)
            const muteParam = isFirst ? 'mute=0' : 'mute=1';
            baseUrl = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${muteParam}`;
            break;
        
        default:
            return null;
    }
    
    return {
        url: baseUrl,
        channel: channel
    };
}

// Create a single stream card element
function createStreamCard(streamData, index, isNew) {
    const streamCard = document.createElement('div');
    streamCard.className = 'stream-wrapper';
    streamCard.dataset.streamId = streamData.id;
    
    if (isNew) {
        streamCard.classList.add('new-stream');
    }
    
    if (index === activeAudioStream) {
        streamCard.classList.add('audio-active');
    }
    
    const audioIcon = index === activeAudioStream ? '🔊' : '🔇';
    const audioTitle = index === activeAudioStream ? 'Audio On (Click to mute)' : 'Audio Off (Click to unmute)';
    
    streamCard.innerHTML = `
        <div class="stream-header">
            <span class="platform-badge ${streamData.platform}">
                ${platformIcons[streamData.platform]}
                ${streamData.platform}
            </span>
            <span class="stream-url" title="${streamData.channel}">${streamData.channel}</span>
            <button class="audio-toggle-btn" data-stream-id="${streamData.id}" title="${audioTitle}">${audioIcon}</button>
            <button class="remove-btn" data-stream-id="${streamData.id}" title="Remove stream">×</button>
        </div>
        <div class="stream-iframe-container">
            <iframe 
                src="${streamData.embedUrl}" 
                allowfullscreen="true"
                scrolling="no"
            ></iframe>
        </div>
    `;
    
    return streamCard;
}

// Attach event listeners to a stream card
function attachStreamEventListeners(streamCard) {
    const streamId = parseInt(streamCard.dataset.streamId);
    
    // Audio toggle button
    const audioBtn = streamCard.querySelector('.audio-toggle-btn');
    if (audioBtn) {
        // Remove old listener by cloning
        const newAudioBtn = audioBtn.cloneNode(true);
        audioBtn.parentNode.replaceChild(newAudioBtn, audioBtn);
        
        newAudioBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            setActiveAudio(streamId);
        });
    }
    
    // Remove button
    const removeBtn = streamCard.querySelector('.remove-btn');
    if (removeBtn) {
        // Remove old listener by cloning
        const newRemoveBtn = removeBtn.cloneNode(true);
        removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);
        
        newRemoveBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            removeStream(streamId);
        });
    }
}

// Update audio indicators on all streams
function updateAudioIndicators() {
    document.querySelectorAll('.stream-wrapper').forEach(card => {
        const streamId = parseInt(card.dataset.streamId);
        const stream = streams.find(s => s.id === streamId);
        if (!stream) return;
        
        const streamIndex = streams.indexOf(stream);
        const audioBtn = card.querySelector('.audio-toggle-btn');
        
        if (streamIndex === activeAudioStream) {
            card.classList.add('audio-active');
            if (audioBtn) {
                audioBtn.innerHTML = '🔊';
                audioBtn.title = 'Audio On (Click to mute)';
            }
        } else {
            card.classList.remove('audio-active');
            if (audioBtn) {
                audioBtn.innerHTML = '🔇';
                audioBtn.title = 'Audio Off (Click to unmute)';
            }
        }
    });
}

// Handle audio toggle when clicking on a stream
function setActiveAudio(streamId) {
    const stream = streams.find(s => s.id === streamId);
    if (!stream) return;
    
    const newIndex = streams.indexOf(stream);
    
    if (activeAudioStream === newIndex) {
        // If clicking the same stream, mute it
        activeAudioStream = null;
    } else {
        // Set new active audio stream
        activeAudioStream = newIndex;
    }
    
    updateAudioIndicators();
}

// Remove empty state if present
function removeEmptyState() {
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
}

// Show empty state
function showEmptyState() {
    streamContainer.innerHTML = `
        <div class="empty-state">
            <div class="icon">📺</div>
            <p>No streams added yet</p>
            <p>Select a platform, enter a <span>channel name</span> and click <span>+</span></p>
        </div>
    `;
}

// Show notification toast
function showNotification(message, type = 'error') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Add a new stream
function addStream() {
    const platform = platformSelect.value;
    const input = streamInput.value.trim();

    // Validate input
    if (!input) {
        // Shake the input to indicate error
        streamInput.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            streamInput.style.animation = '';
        }, 500);
        streamInput.focus();
        return;
    }

    const embedData = getEmbedUrl(platform, input, streams.length === 0);
    
    if (!embedData) {
        alert('Invalid input. Please check and try again.');
        return;
    }

    // Check for duplicate streams
    if (isDuplicateStream(platform, embedData.channel)) {
        showNotification(`This ${platform} stream is already added!`, 'error');
        streamInput.focus();
        streamInput.select();
        return;
    }

    // Remove empty state if it exists
    removeEmptyState();

    // Create stream object with unique ID
    const streamData = {
        id: ++streamCounter,
        platform: platform,
        channel: embedData.channel,
        embedUrl: embedData.url
    };

    // Add to streams array
    streams.push(streamData);
    
    // If this is the first stream, set it as active audio
    if (streams.length === 1) {
        activeAudioStream = 0;
    }

    // Create and append the new stream card
    const newCard = createStreamCard(streamData, streams.length - 1, streams.length > 1);
    streamContainer.appendChild(newCard);
    
    // Attach event listeners immediately
    attachStreamEventListeners(newCard);
    
    // Trigger reflow for animation
    void newCard.offsetWidth;

    // Clear input
    streamInput.value = '';
    
    // Update layout and count
    updateLayout();
    updateStreamCount();

    // Focus back on input for quick adding
    streamInput.focus();
    
    // Scroll to the new stream
    setTimeout(() => {
        newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Remove a stream by ID
function removeStream(streamId) {
    const streamIndex = streams.findIndex(s => s.id === streamId);
    if (streamIndex === -1) return;
    
    const streamCard = document.querySelector(`.stream-wrapper[data-stream-id="${streamId}"]`);
    
    if (streamCard) {
        // Add removing animation
        streamCard.classList.add('removing');
        
        // Remove after animation completes
        const handleAnimationEnd = function() {
            streamCard.removeEventListener('animationend', handleAnimationEnd);
            
            if (streamCard.parentNode) {
                streamCard.remove();
            }
            
            // Remove from array
            streams.splice(streamIndex, 1);
            
            // Update active audio stream
            if (streams.length === 0) {
                activeAudioStream = null;
                showEmptyState();
            } else {
                if (activeAudioStream === streamIndex) {
                    // If we removed the active audio stream, set to first stream
                    activeAudioStream = 0;
                } else if (activeAudioStream > streamIndex) {
                    // Adjust index if we removed a stream before the active one
                    activeAudioStream--;
                }
                updateAudioIndicators();
            }
            
            updateLayout();
            updateStreamCount();
        };
        
        streamCard.addEventListener('animationend', handleAnimationEnd);
    } else {
        // Fallback if card not found
        streams.splice(streamIndex, 1);
        
        if (streams.length === 0) {
            activeAudioStream = null;
            showEmptyState();
        } else {
            if (activeAudioStream === streamIndex) {
                activeAudioStream = 0;
            } else if (activeAudioStream > streamIndex) {
                activeAudioStream--;
            }
            updateAudioIndicators();
        }
        
        updateLayout();
        updateStreamCount();
    }
}

// Add notification and shake animations
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    .audio-toggle-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 0 5px;
        transition: transform 0.2s ease;
        line-height: 1;
    }
    
    .audio-toggle-btn:hover {
        transform: scale(1.2);
    }
    
    .stream-wrapper.audio-active {
        border-color: #ffd700;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
    }
    
    .stream-wrapper.audio-active:hover {
        border-color: #ffd700;
        box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
    }
`;
document.head.appendChild(additionalStyles);

// Event Listeners
addBtn.addEventListener('click', addStream);

streamInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addStream();
    }
});

// Keyboard shortcut to remove last stream
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'z' && streams.length > 0) {
        e.preventDefault();
        const lastStream = streams[streams.length - 1];
        removeStream(lastStream.id);
    }
});

// Initialize custom dropdown, layout controls, and render
createCustomDropdown();
addLayoutControls();
updateLayout(); // Start with single column layout
updateStreamCount();