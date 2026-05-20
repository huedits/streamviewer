// Main Application
const App = {
    init() {
        // Initialize UI (gets DOM references)
        UI.init();
        
        // Initialize components
        Dropdown.init();
        LayoutControls.init();
        EventHandlers.init();
        
        // Set initial layout
        UI.updateLayout();
        UI.updateStreamCount();
        
        console.log('Multi-Stream Viewer initialized');
        console.log('Twitch parent:', CONFIG.twitchParent);
    }
};

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});