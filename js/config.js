// Configuration and Constants
const CONFIG = {
    // Application version
    version: '2.2.2',
    
    // Twitch embed parent domain - hardcoded for GitHub Pages
    twitchParent: 'huedits.github.io',
    
    // Platform definitions
    platforms: {
        twitch: {
            name: 'Twitch',
            color: '#9147ff',
            icon: `<svg class="platform-icon" viewBox="0 0 24 24" fill="#9147ff">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
            </svg>`
        },
        kick: {
            name: 'Kick',
            color: '#53fc18',
            icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" width="24" height="24">
                <path d="M1.734 0.002h7.709v5.326h2.565v-2.663h2.566V0.002h7.709v8.005h-2.565v2.663h-2.565v2.662h2.565v2.663h2.565V24.001H14.573v-2.663h-2.565v-2.662h-2.565v5.326H1.734z" fill="#53fc18"/>
            </svg>`
        },
        youtube: {
            name: 'YouTube',
            color: '#ff0000',
            icon: `<svg class="platform-icon" viewBox="0 0 24 24" fill="#ff0000">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>`
        }
    }
};