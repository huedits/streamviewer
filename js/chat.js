// Chat Manager
const ChatManager = {
    activeChatId: null,
    
    init() {
        this.attachCloseButton();
    },
    
    // Get chat embed URL for a stream
    getChatUrl(streamData) {
        switch (streamData.platform) {
            case 'twitch':
                return `https://www.twitch.tv/embed/${encodeURIComponent(streamData.channel)}/chat?parent=${CONFIG.twitchParent}&darkpopout`;
            
            case 'kick':
                return `https://kick.com/${encodeURIComponent(streamData.channel)}/chatroom`;
            
            case 'youtube':
                return `https://www.youtube.com/live_chat?v=${encodeURIComponent(streamData.channel)}&embed_domain=${CONFIG.twitchParent}`;
            
            default:
                return null;
        }
    },
    
    // Open chat panel
    open() {
        const panel = document.getElementById('chatPanel');
        panel.classList.add('open');
    },
    
    // Close chat panel
    close() {
        const panel = document.getElementById('chatPanel');
        panel.classList.remove('open');
        this.activeChatId = null;
        this.updateActiveTab();
    },
    
    // Toggle chat panel
    toggle() {
        const panel = document.getElementById('chatPanel');
        if (panel.classList.contains('open')) {
            this.close();
        } else {
            this.open();
        }
    },
    
    // Add a chat tab for a stream
    addChatTab(streamData) {
        const tabsContainer = document.getElementById('chatTabs');
        
        const tab = document.createElement('button');
        tab.className = 'chat-tab';
        tab.dataset.streamId = streamData.id;
        tab.innerHTML = `
            ${CONFIG.platforms[streamData.platform].icon}
            <span>${streamData.channel}</span>
        `;
        
        tab.addEventListener('click', () => {
            this.switchChat(streamData.id);
        });
        
        tabsContainer.appendChild(tab);
        
        // If this is the first tab, open it
        if (!this.activeChatId) {
            this.switchChat(streamData.id);
        }
    },
    
    // Remove a chat tab
    removeChatTab(streamId) {
        const tab = document.querySelector(`.chat-tab[data-stream-id="${streamId}"]`);
        if (tab) {
            const wasActive = this.activeChatId === streamId;
            tab.remove();
            
            if (wasActive) {
                // Switch to another tab or close
                const remainingTabs = document.querySelectorAll('.chat-tab');
                if (remainingTabs.length > 0) {
                    const firstTab = remainingTabs[0];
                    this.switchChat(parseInt(firstTab.dataset.streamId));
                } else {
                    this.close();
                }
            }
        }
    },
    
    // Switch to a specific chat
    switchChat(streamId) {
        this.activeChatId = streamId;
        this.updateActiveTab();
        
        const stream = StreamState.getStream(streamId);
        if (!stream) return;
        
        const chatUrl = this.getChatUrl(stream);
        if (!chatUrl) return;
        
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.innerHTML = `
            <iframe 
                src="${chatUrl}" 
                allowfullscreen="true"
                scrolling="yes"
            ></iframe>
        `;
        
        // Open panel if not already open
        this.open();
    },
    
    // Update active tab styling
    updateActiveTab() {
        document.querySelectorAll('.chat-tab').forEach(tab => {
            const tabId = parseInt(tab.dataset.streamId);
            if (tabId === this.activeChatId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update chat toggle buttons on stream cards
        document.querySelectorAll('.chat-toggle-btn').forEach(btn => {
            const streamId = parseInt(btn.dataset.streamId);
            if (streamId === this.activeChatId) {
                btn.classList.add('active');
                btn.textContent = '💬';
            } else {
                btn.classList.remove('active');
                btn.textContent = '💭';
            }
        });
    },
    
    // Attach close button event
    attachCloseButton() {
        const closeBtn = document.getElementById('chatCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
    }
};