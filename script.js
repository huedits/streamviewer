// State to track added streams
let streams = [];
let currentLayout = 'single'; // Default to single column layout

// DOM Elements
let platformSelect = document.getElementById('platformSelect');
const streamInput = document.getElementById('streamInput');
const addBtn = document.getElementById('addBtn');
const streamContainer = document.getElementById('streamContainer');
const controlBar = document.querySelector('.control-bar');

// SVG Icons for each platform
const platformIcons = {
    twitch: `<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
    </svg>`,
    
    kick: `<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h6v6H3V3zm0 8h6v6H3v-6zm8-8h6v6h-6V3zm0 8h6v6h-6v-6zm8-8h6v6h-6V3z"/>
    </svg>`,
    
    youtube: `<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor">
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

// Embed URL builders for each platform
function getEmbedUrl(platform, channelOrId) {
    const input = channelOrId.trim();
    
    switch (platform) {
        case 'twitch':
            let twitchChannel = input;
            const twitchMatch = input.match(/(?:twitch\.tv\/)([\w-]+)/);
            if (twitchMatch) {
                twitchChannel = twitchMatch[1];
            }
            const parent = getTwitchParent();
            console.log('Twitch parent:', parent); // Debug log
            return {
                url: `https://player.twitch.tv/?channel=${encodeURIComponent(twitchChannel)}&parent=${parent}`,
                channel: twitchChannel
            };
        
        case 'kick':
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
            let videoId = input;
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
        updateLayout();
        updateStreamCount();
        return;
    }

    // Render each stream
    streams.forEach((stream, index) => {
        const streamCard = document.createElement('div');
        streamCard.className = 'stream-wrapper';
        
        // Add new-stream class if this is the last added stream
        if (index === streams.length - 1 && streams.length > 1) {
            streamCard.classList.add('new-stream');
        }
        
        streamCard.dataset.index = index;
        streamCard.innerHTML = `
            <div class="stream-header">
                <span class="platform-badge ${stream.platform}">
                    ${platformIcons[stream.platform]}
                    ${stream.platform}
                </span>
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
        
        // Trigger reflow for animation
        void streamCard.offsetWidth;
    });

    // Attach remove event listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeStream(index);
        });
    });
    
    updateLayout();
    updateStreamCount();
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
    
    // Scroll to the new stream if it's not visible
    setTimeout(() => {
        const lastStream = document.querySelector('.stream-wrapper:last-child');
        if (lastStream) {
            lastStream.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
}

// Remove a stream by index
function removeStream(index) {
    const streamCard = document.querySelector(`.stream-wrapper[data-index="${index}"]`);
    
    if (streamCard) {
        // Add removing animation
        streamCard.classList.add('removing');
        
        // Remove after animation completes
        setTimeout(() => {
            streams.splice(index, 1);
            renderStreams();
        }, 300);
    } else {
        streams.splice(index, 1);
        renderStreams();
    }
}

// Add shake animation for invalid input
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

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
        removeStream(streams.length - 1);
    }
});

// Initialize custom dropdown, layout controls, and render
createCustomDropdown();
addLayoutControls();
updateLayout(); // Start with single column layout
renderStreams();