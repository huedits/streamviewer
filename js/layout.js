// Layout Controls
const LayoutControls = {
    init() {
        this.createButtons();
        this.attachEvents();
    },
    
    createButtons() {
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
        
        UI.elements.controlBar.appendChild(layoutControls);
    },
    
    attachEvents() {
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                StreamState.currentLayout = this.dataset.layout;
                UI.updateLayout();
            });
        });
    }
};