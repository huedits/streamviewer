// Main Application
const App = {
    init() {
        // Initialize UI (gets DOM references)
        UI.init();
        
        // Display version
        this.displayVersion();
        
        // Initialize components
        Dropdown.init();
        LayoutControls.init();
        EventHandlers.init();
        
        // Set initial layout
        UI.updateLayout();
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

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});