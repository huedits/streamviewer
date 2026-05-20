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
            versionDisplay.title = `Version ${CONFIG.version} - Click to see changelog`;
            
            // Optional: Add click handler to show changelog
            versionDisplay.style.cursor = 'pointer';
            versionDisplay.addEventListener('click', () => {
                this.showChangelog();
            });
        }
    },
    
    showChangelog() {
        const changelog = `
📋 Changelog
━━━━━━━━━━━━━━━━━━━━
v1.0.0 - Initial Release
• Multi-platform stream support (Twitch, Kick, YouTube)
• Single, double, triple, and auto grid layouts
• Audio management (only first stream has audio)
• Duplicate stream detection
• Stream card animations
• Custom platform dropdown with icons
• Responsive 16:9 aspect ratio
• Keyboard shortcuts (Ctrl+Z to remove last stream)
• Modular JavaScript architecture
        `.trim();
        
        alert(changelog);
    }
};

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});