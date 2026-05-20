// Chat Manager
const ChatManager = {
    activeChatId: null,
    
    init() {
        this.attachCloseButton();
        this.attachReopenButton();
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
        const reopenBtn = document.getElementById('chatReopenBtn');
        
        panel.classList.add('open');
        reopenBtn.classList.remove('visible');
    },
    
    // Close chat panel
    close() {
        const panel = document.getElementById('chatPanel');
        const reopenBtn = document.getElementById('chatReopenBtn');
        
        panel.classList.remove('open');
        
        // Only show reopen button if there are chat tabs
        const tabs = document.querySelectorAll('.chat-tab');
        if (tabs.length > 0) {
            reopenBtn.classList.add('visible');
        } else {
            reopenBtn.classList.remove('visible');
        }
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
        
        // If this is the first tab, switch to it
        if (!this.activeChatId || tabsContainer.children.length === 1) {
            this.switchChat(streamData.id);
        }
    },
    
    // Remove a chat tab
    removeChatTab(streamId) {
        const tab = document.querySelector(`.chat-tab[data-stream-id="${streamId}"]`);
        if (!tab) return;
        
        const wasActive = this.activeChatId === streamId;
        tab.remove();
        
        if (wasActive) {
            // Clear the chat container
            const chatContainer = document.getElementById('chatContainer');
            chatContainer.innerHTML = `
                <div class="chat-empty">
                    <span>💬</span>
                    <p>Select a stream to view chat</p>
                </div>
            `;
            this.activeChatId = null;
            
            // Switch to another tab if available
            const remainingTabs = document.querySelectorAll('.chat-tab');
            if (remainingTabs.length > 0) {
                const firstTab = remainingTabs[0];
                const nextStreamId = parseInt(firstTab.dataset.streamId);
                if (nextStreamId) {
                    this.switchChat(nextStreamId);
                }
            } else {
                // No tabs left, close panel
                this.activeChatId = null;
                this.close();
                document.getElementById('chatReopenBtn').classList.remove('visible');
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
    },
    
    // Attach close button event
    attachCloseButton() {
        const closeBtn = document.getElementById('chatCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
    },
    
    // Attach reopen button event
    attachReopenButton() {
        const reopenBtn = document.getElementById('chatReopenBtn');
        if (reopenBtn) {
            reopenBtn.addEventListener('click', () => this.open());
        }
    }
};