// Main Application
const App = {
    init() {
        UI.init();
        ChatManager.init();
        this.displayVersion();
        Dropdown.init();
        EventHandlers.init();
        UI.updateStreamCount();
        
        console.log('Multi-Stream Viewer initialized');
        console.log('Version:', CONFIG.version);
        console.log('Twitch parent:', CONFIG.twitchParent);
    },
    
    displayVersion() {
        const versionDisplay = document.getElementById('versionDisplay');
        if (versionDisplay) {
            versionDisplay.textContent = `v${CONFIG.version}`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});