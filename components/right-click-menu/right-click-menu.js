class RightClickMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Bind methods
    this._handleContextMenu = this._handleContextMenu.bind(this);
    this._handleDocumentClick = this._handleDocumentClick.bind(this);
    this._handleDarkModeChange = this._handleDarkModeChange.bind(this);
    this._handleMediaChanged = this._handleMediaChanged.bind(this);
    
    this._targetElement = null;
    this._visible = false;
    this._isDarkMode = false;
    
    this._render();
  }
  
  static get observedAttributes() {
    return ['target', 'dark-mode'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'target') {
      this._targetSelector = newValue;
      this._setupContextMenu();
    } else if (name === 'dark-mode') {
      this._isDarkMode = newValue !== null;
      this._updateTheme();
    }
  }
  
  connectedCallback() {
    // Add event listener for dark mode change
    document.addEventListener('dark-mode-change', this._handleDarkModeChange);
    
    // Initialize dark mode if service is available
    if (window.darkModeService) {
      this._isDarkMode = window.darkModeService.isDarkMode();
      this._updateTheme();
    }
    
    // Set target if specified
    const target = this.getAttribute('target');
    if (target) {
      this._targetSelector = target;
      this._setupContextMenu();
    }
    
    // Add document click listener
    document.addEventListener('click', this._handleDocumentClick);
    
    // Listen for media changes
    document.addEventListener('media-changed', this._handleMediaChanged);
    
    // If the target isn't found immediately, try again after a short delay
    // This helps when the component is loaded before the target element
    if (target && !this._target) {
      setTimeout(() => this._setupContextMenu(), 500);
    }
    
    // Add a direct context menu listener to the document as a fallback
    document.addEventListener('contextmenu', (event) => {
      // Check if the event target is within our media container
      const mediaContainer = document.getElementById('media-container');
      if (mediaContainer && (mediaContainer.contains(event.target) || mediaContainer === event.target)) {
        // Only handle if our menu isn't already visible
        if (!this._isVisible) {
          this._handleContextMenu(event);
        }
      }
    });
    
    console.log('Right-click menu component connected');
  }
  
  disconnectedCallback() {
    this._removeTargetListener();
    document.removeEventListener('dark-mode-change', this._handleDarkModeChange);
    document.removeEventListener('click', this._handleDocumentClick);
    document.removeEventListener('media-changed', this._handleMediaChanged);
  }
  
  _render() {
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
      }
      
      .right-click-menu {
        position: fixed;
        background-color: var(--bg-color, #fff);
        color: var(--text-color, #333);
        border: 1px solid var(--border-color, #ddd);
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        min-width: 200px;
        display: none;
        opacity: 0;
        transform: scale(0.95);
        transform-origin: top left;
        transition: opacity 0.1s ease, transform 0.1s ease;
        z-index: 1000;
        pointer-events: auto;
      }
      
      .right-click-menu.visible {
        opacity: 1;
        transform: scale(1);
      }
      
      .menu-item {
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.2s;
      }
      
      .menu-item:hover {
        background-color: var(--hover-bg, rgba(0, 0, 0, 0.05));
      }
      
      .menu-item.active {
        font-weight: bold;
      }
      
      .menu-item svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }
      
      .menu-separator {
        height: 1px;
        background-color: var(--border-color, #ddd);
        margin: 4px 0;
      }
      
      .submenu {
        position: absolute;
        left: 100%;
        top: 0;
        background-color: var(--bg-color, #fff);
        border: 1px solid var(--border-color, #ddd);
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        min-width: 150px;
        display: none;
      }
      
      .menu-item.has-submenu:hover .submenu {
        display: block;
      }
      
      .menu-item.has-submenu::after {
        content: '›';
        margin-left: auto;
        font-size: 1.2em;
      }
      
      /* Dark theme */
      :host(.dark-mode) .right-click-menu, :host(.dark-mode) .submenu {
        background-color: #333;
        color: #eee;
        border-color: #555;
      }
      
      :host(.dark-mode) .menu-separator {
        background-color: #555;
      }
      
      :host(.dark-mode) .menu-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    `;
    
    // Create menu structure
    const menu = document.createElement('div');
    menu.className = 'right-click-menu';
    
    // Play/Pause item
    const playPauseItem = document.createElement('div');
    playPauseItem.className = 'menu-item play-pause-item';
    playPauseItem.dataset.action = 'toggle-play';
    
    const playIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    playIcon.setAttribute('viewBox', '0 0 24 24');
    playIcon.innerHTML = '<path d="M8 5v14l11-7z" />';
    
    const pauseIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    pauseIcon.setAttribute('viewBox', '0 0 24 24');
    pauseIcon.style.display = 'none';
    pauseIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />';
    
    playPauseItem.appendChild(playIcon);
    playPauseItem.appendChild(pauseIcon);
    playPauseItem.appendChild(document.createTextNode('Play/Pause'));
    
    // Mute item
    const muteItem = document.createElement('div');
    muteItem.className = 'menu-item mute-item';
    muteItem.dataset.action = 'toggle-mute';
    
    const volumeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    volumeIcon.setAttribute('viewBox', '0 0 24 24');
    volumeIcon.innerHTML = '<path d="M3,9H7L12,4V20L7,15H3V9M16,15V9H18V15H16M20,15V9H22V15H20Z" />';
    
    muteItem.appendChild(volumeIcon);
    muteItem.appendChild(document.createTextNode('Mute/Unmute'));
    
    // Separator
    const separator1 = document.createElement('div');
    separator1.className = 'menu-separator';
    
    // Playback rate submenu
    const rateItem = document.createElement('div');
    rateItem.className = 'menu-item has-submenu';
    rateItem.appendChild(document.createTextNode('Playback Speed'));
    
    const rateSubmenu = document.createElement('div');
    rateSubmenu.className = 'submenu';
    
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const rateItems = [];
    
    rates.forEach(rate => {
      const rateOption = document.createElement('div');
      rateOption.className = 'menu-item rate-item';
      rateOption.dataset.action = 'set-rate';
      rateOption.dataset.rate = rate.toString();
      rateOption.textContent = rate === 1 ? 'Normal' : `${rate}x`;
      
      if (rate === 1) {
        rateOption.classList.add('active');
      }
      
      rateSubmenu.appendChild(rateOption);
      rateItems.push(rateOption);
    });
    
    rateItem.appendChild(rateSubmenu);
    
    // Separator
    const separator2 = document.createElement('div');
    separator2.className = 'menu-separator';
    
    // Fullscreen item
    const fullscreenItem = document.createElement('div');
    fullscreenItem.className = 'menu-item';
    fullscreenItem.dataset.action = 'toggle-fullscreen';
    
    const fullscreenIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    fullscreenIcon.setAttribute('viewBox', '0 0 24 24');
    fullscreenIcon.innerHTML = '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />';
    
    fullscreenItem.appendChild(fullscreenIcon);
    fullscreenItem.appendChild(document.createTextNode('Fullscreen'));
    
    // Separator
    const separator3 = document.createElement('div');
    separator3.className = 'menu-separator';
    
    // Dark mode toggle
    const darkModeItem = document.createElement('div');
    darkModeItem.className = 'menu-item';
    darkModeItem.dataset.action = 'toggle-dark-mode';
    
    const lightIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    lightIcon.setAttribute('viewBox', '0 0 24 24');
    lightIcon.innerHTML = '<path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />';
    
    const darkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    darkIcon.setAttribute('viewBox', '0 0 24 24');
    darkIcon.style.display = 'none';
    darkIcon.innerHTML = '<path d="M12,18C11.11,18 10.26,17.8 9.5,17.45C11.56,16.5 13,14.42 13,12C13,9.58 11.56,7.5 9.5,6.55C10.26,6.2 11.11,6 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z" />';
    
    darkModeItem.appendChild(lightIcon);
    darkModeItem.appendChild(darkIcon);
    darkModeItem.appendChild(document.createTextNode('Toggle Dark Mode'));
    
    // Add all items to menu
    menu.appendChild(playPauseItem);
    menu.appendChild(muteItem);
    menu.appendChild(separator1);
    menu.appendChild(rateItem);
    menu.appendChild(separator2);
    menu.appendChild(fullscreenItem);
    menu.appendChild(separator3);
    menu.appendChild(darkModeItem);
    
    // Add to shadow DOM
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(menu);
    
    // Store references
    this.menu = menu;
    this.playPauseItem = playPauseItem;
    this.muteItem = muteItem;
    this.rateItems = rateItems;
    this.playIcon = playIcon;
    this.pauseIcon = pauseIcon;
    this.lightIcon = lightIcon;
    this.darkIcon = darkIcon;
    
    // Add event listeners
    this._addMenuItemListeners();
    
    console.log('Right-click menu rendered');
  }
  
  _addMenuItemListeners() {
    if (this.playPauseItem) {
      this.playPauseItem.addEventListener('click', () => {
        console.log('Play/Pause clicked');
        const videoPlayer = document.querySelector('video-player');
        if (videoPlayer && videoPlayer.video) {
          if (videoPlayer.video.paused) {
            videoPlayer.video.play();
          } else {
            videoPlayer.video.pause();
          }
        }
        this.hide();
      });
    }
    
    if (this.muteItem) {
      this.muteItem.addEventListener('click', () => {
        console.log('Mute/Unmute clicked');
        const videoPlayer = document.querySelector('video-player');
        if (videoPlayer && videoPlayer.video) {
          videoPlayer.video.muted = !videoPlayer.video.muted;
        }
        this.hide();
      });
    }
    
    if (this.rateItems) {
      this.rateItems.forEach(item => {
        item.addEventListener('click', () => {
          try {
            const rateStr = item.dataset.rate;
            // Parse the rate and validate it's a valid finite number
            let rate = parseFloat(rateStr);
            
            // Validate the rate is a finite number
            if (isNaN(rate) || !isFinite(rate) || rate <= 0) {
              console.error('Invalid playback rate:', rateStr);
              rate = 1.0; // Default to normal speed if invalid
            }
            
            console.log('Setting playback rate to:', rate);
            
            const videoPlayer = document.querySelector('video-player');
            if (videoPlayer && videoPlayer.video) {
              videoPlayer.video.playbackRate = rate;
            }
          } catch (error) {
            console.error('Error setting playback rate:', error);
          }
          
          this.hide();
        });
      });
    }
    
    // Fullscreen toggle
    const fullscreenItem = this.shadowRoot.querySelector('[data-action="toggle-fullscreen"]');
    if (fullscreenItem) {
      fullscreenItem.addEventListener('click', () => {
        console.log('Fullscreen clicked');
        const videoPlayer = document.querySelector('video-player');
        if (videoPlayer) {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            videoPlayer.requestFullscreen();
          }
        }
        this.hide();
      });
    }
    
    // Dark mode toggle
    const darkModeItem = this.shadowRoot.querySelector('[data-action="toggle-dark-mode"]');
    if (darkModeItem) {
      darkModeItem.addEventListener('click', () => {
        console.log('Dark mode toggle clicked');
        if (window.darkModeService) {
          window.darkModeService.toggle();
        }
        this.hide();
      });
    }
  }
  
  _setupContextMenu() {
    // Remove old listener if it exists
    this._removeTargetListener();
    
    // Find the target element
    this._findTarget();
    
    // If no target found, return
    if (!this._target) {
      return;
    }
    
    // Add context menu listener to target
    this._target.addEventListener('contextmenu', this._handleContextMenu);
    console.log('Added context menu listener to:', this._targetSelector);
  }
  
  _removeTargetListener() {
    if (this._target) {
      this._target.removeEventListener('contextmenu', this._handleContextMenu);
    }
  }
  
  _findTarget() {
    if (!this._targetSelector) {
      console.warn('No target selector specified');
      return;
    }
    
    try {
      const target = document.querySelector(this._targetSelector);
      if (target) {
        this._target = target;
        console.log('Found target for right-click menu:', this._targetSelector);
        
        // Ensure the context menu listener is added
        this._target.removeEventListener('contextmenu', this._handleContextMenu);
        this._target.addEventListener('contextmenu', this._handleContextMenu);
      } else {
        this._target = null;
        console.warn('Target not found:', this._targetSelector);
        
        // Schedule a retry after a delay (might be needed on media change)
        setTimeout(() => {
          console.log('Retrying to find target:', this._targetSelector);
          const retryTarget = document.querySelector(this._targetSelector);
          if (retryTarget) {
            this._target = retryTarget;
            console.log('Found target on retry for right-click menu:', this._targetSelector);
            
            // Ensure the context menu listener is added
            this._target.removeEventListener('contextmenu', this._handleContextMenu);
            this._target.addEventListener('contextmenu', this._handleContextMenu);
          } else {
            // If still not found, try to attach to the media container as fallback
            const mediaContainer = document.getElementById('media-container');
            if (mediaContainer) {
              this._target = mediaContainer;
              console.log('Using media-container as fallback for right-click menu');
              this._target.removeEventListener('contextmenu', this._handleContextMenu);
              this._target.addEventListener('contextmenu', this._handleContextMenu);
            }
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error finding target for right-click menu:', error);
    }
  }
  
  _handleContextMenu(event) {
    event.preventDefault();
    
    // Show the menu at the cursor position
    this.show(event.clientX, event.clientY);
    
    // Update menu state if target is a video player
    if (this._target) {
      const videoPlayer = document.querySelector('video-player');
      if (videoPlayer && videoPlayer.video) {
        const video = videoPlayer.video;
        this._updatePlayPauseState(!video.paused);
        this._updateMuteState(video.muted);
        this._updateSpeedItems(video.playbackRate);
      }
    }
  }
  
  _handleDocumentClick(event) {
    // Hide menu if clicked outside
    if (this._isVisible && this.menu && !this.menu.contains(event.target)) {
      this.hide();
    }
  }
  
  _handleDarkModeChange(event) {
    this._isDarkMode = event.detail.darkMode;
    this._updateTheme();
  }
  
  _handleMediaChanged(event) {
    console.log('Media changed event detected:', event.detail);
    
    // Wait for the DOM to update with the new media
    setTimeout(() => {
      // Re-setup context menu with current target selector
      this._setupContextMenu();
    }, 300);
  }
  
  _updatePlayPauseState(isPlaying) {
    if (this.playPauseItem) {
      this.playPauseItem.classList.toggle('active', isPlaying);
    }
    
    if (this.playIcon && this.pauseIcon) {
      this.playIcon.style.display = isPlaying ? 'none' : 'block';
      this.pauseIcon.style.display = isPlaying ? 'block' : 'none';
    }
  }
  
  _updateMuteState(isMuted) {
    if (this.muteItem) {
      this.muteItem.classList.toggle('active', isMuted);
    }
  }
  
  _updateSpeedItems(currentSpeed) {
    if (this.rateItems) {
      this.rateItems.forEach(item => {
        item.classList.toggle('active', parseFloat(item.dataset.rate) === currentSpeed);
      });
    }
  }
  
  _updateTheme() {
    if (this._isDarkMode) {
      this.classList.add('dark-mode');
    } else {
      this.classList.remove('dark-mode');
    }
    
    if (this.lightIcon && this.darkIcon) {
      this.lightIcon.style.display = this._isDarkMode ? 'none' : 'block';
      this.darkIcon.style.display = this._isDarkMode ? 'block' : 'none';
    }
  }
  
  show(x, y) {
    if (!this.menu) {
      console.error('Menu element not found in the shadow DOM');
      return;
    }
    
    console.log('Showing right-click menu at', x, y);
    
    // Set position
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
    
    // Show menu
    this.menu.style.display = 'block';
    this.menu.classList.add('visible');
    this._isVisible = true;
    
    // Adjust position to fit in viewport
    this._adjustPosition();
    
    // Add a class to the body to indicate menu is open
    document.body.classList.add('context-menu-open');
  }
  
  hide() {
    if (this.menu) {
      console.log('Hiding right-click menu');
      this.menu.style.display = 'none';
      this.menu.classList.remove('visible');
      this._isVisible = false;
      
      // Remove the class from the body
      document.body.classList.remove('context-menu-open');
    }
  }
  
  _adjustPosition() {
    if (!this.menu || !this._isVisible) return;
    
    const rect = this.menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust if menu is off the right edge
    if (rect.right > viewportWidth) {
      this.menu.style.left = `${viewportWidth - rect.width - 10}px`;
    }
    
    // Adjust if menu is off the bottom edge
    if (rect.bottom > viewportHeight) {
      this.menu.style.top = `${viewportHeight - rect.height - 10}px`;
    }
  }
}

// Define the custom element
customElements.define('right-click-menu', RightClickMenu); 