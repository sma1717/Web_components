class RightClickMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default state
    this._targetSelector = '';
    this._target = null;
    this._isVisible = false;
    this._darkMode = localStorage.getItem('darkMode') === 'true';
    this._initialized = false;
    
    // Bind methods
    this._handleDocumentClick = this._handleDocumentClick.bind(this);
    this._handleContextMenu = this._handleContextMenu.bind(this);
    this._handleDarkModeChange = this._handleDarkModeChange.bind(this);
    this._handleMediaChanged = this._handleMediaChanged.bind(this);
    
    // Initialize with default styles
    this._renderWithDefaultStyles();
  }
  
  static get observedAttributes() {
    return ['target', 'dark-mode'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'target':
        this._targetSelector = newValue;
        this._setupContextMenu();
        break;
      case 'dark-mode':
        this._darkMode = newValue === 'true';
        this._updateDarkMode();
        break;
    }
  }
  
  connectedCallback() {
    console.log('RightClickMenu connected to DOM');
    
    // Set up listeners
    document.addEventListener('click', this._handleDocumentClick);
    document.addEventListener('dark-mode-change', this._handleDarkModeChange);
    document.addEventListener('media-changed', this._handleMediaChanged);
    
    // Set up context menu
    setTimeout(() => {
      this._setupContextMenu();
    }, 300);
    
    // Apply dark mode if needed
    this._updateDarkMode();
  }
  
  disconnectedCallback() {
    // Clean up event listeners
    document.removeEventListener('click', this._handleDocumentClick);
    document.removeEventListener('dark-mode-change', this._handleDarkModeChange);
    document.removeEventListener('media-changed', this._handleMediaChanged);
    
    // Clean up target listener
    this._removeTargetListener();
  }
  
  _renderWithDefaultStyles() {
    const styles = `
      <link rel="stylesheet" href="components/right-click-menu/right-click-menu.css">
    `;
    
    this.shadowRoot.innerHTML = `
      ${styles}
      <div class="right-click-menu">
        <div class="menu-item" data-action="play-pause">
          <div class="menu-item-icon">
            <svg class="play-icon" viewBox="0 0 24 24" width="16" height="16">
              <polygon points="8,5 19,12 8,19" fill="currentColor"></polygon>
            </svg>
            <svg class="pause-icon" viewBox="0 0 24 24" width="16" height="16" style="display:none">
              <rect x="6" y="4" width="4" height="16" fill="currentColor"></rect>
              <rect x="14" y="4" width="4" height="16" fill="currentColor"></rect>
            </svg>
          </div>
          <span class="menu-item-label">Play</span>
        </div>
        
        <div class="menu-item" data-action="mute">
          <div class="menu-item-icon">
            <svg class="volume-icon" viewBox="0 0 24 24" width="16" height="16">
              <path d="M3,9v6h4l5,5V4L7,9H3z M16.5,12c0-1.77-1.02-3.29-2.5-4.03v8.05C15.48,15.29,16.5,13.77,16.5,12z M14,3.23v2.06c2.89,0.86,5,3.54,5,6.71s-2.11,5.85-5,6.71v2.06c4.01-0.91,7-4.49,7-8.77S18.01,4.14,14,3.23z" fill="currentColor"/>
            </svg>
            <svg class="mute-icon" viewBox="0 0 24 24" width="16" height="16" style="display:none">
              <path d="M7,9v6h4l5,5V4L11,9H7z" fill="currentColor"/>
              <line x1="22" y1="2" x2="2" y2="22" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="menu-item-label">Mute</span>
        </div>
        
        <div class="menu-divider"></div>
        
        <div class="menu-item" data-action="playback-rate">
          <div class="menu-item-icon">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M10,8v8l6-4L10,8L10,8z M6.3,5L5.7,4.2C7.2,3,9,2.2,11,2l0.1,1C9.3,3.2,7.7,3.9,6.3,5z" fill="currentColor"/>
              <path d="M12,22c-5.5,0-10-4.5-10-10S6.5,2,12,2c0.4,0,0.8,0,1.2,0.1L13,3c-0.3,0-0.7-0.1-1-0.1c-5,0-9,4-9,9s4,9,9,9s9-4,9-9 c0-0.3,0-0.7-0.1-1l1-0.7c0.1,0.6,0.1,1.1,0.1,1.7C22,17.5,17.5,22,12,22z" fill="currentColor"/>
            </svg>
          </div>
          <span class="menu-item-label">Playback Speed</span>
          <div class="submenu-indicator">▶</div>
          <div class="submenu">
            <div class="menu-item" data-rate="0.25">0.25x</div>
            <div class="menu-item" data-rate="0.5">0.5x</div>
            <div class="menu-item" data-rate="0.75">0.75x</div>
            <div class="menu-item" data-rate="1" data-default>Normal</div>
            <div class="menu-item" data-rate="1.25">1.25x</div>
            <div class="menu-item" data-rate="1.5">1.5x</div>
            <div class="menu-item" data-rate="1.75">1.75x</div>
            <div class="menu-item" data-rate="2">2x</div>
          </div>
        </div>
        
        <div class="menu-item" data-action="fullscreen">
          <div class="menu-item-icon">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
            </svg>
          </div>
          <span class="menu-item-label">Fullscreen</span>
        </div>
        
        <div class="menu-divider"></div>
        
        <div class="menu-item" data-action="dark-mode">
          <div class="menu-item-icon">
            <svg class="light-icon" viewBox="0 0 24 24" width="16" height="16">
              <circle cx="12" cy="12" r="5" fill="currentColor"/>
              <path d="M12,2V4M12,20v2M2,12H4M20,12h2M17.7,6.3L16.3,7.7M7.7,16.3L6.3,17.7M16.3,16.3L17.7,17.7M7.7,7.7L6.3,6.3" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg class="dark-icon" viewBox="0 0 24 24" width="16" height="16" style="display:none">
              <path d="M12,3c-5,0-9,4-9,9s4,9,9,9s9-4,9-9c0-0.5,0-0.9-0.1-1.4c-1,1.4-2.6,2.3-4.4,2.3c-3,0-5.4-2.4-5.4-5.4c0-1.8,0.9-3.4,2.3-4.4C12.9,3,12.5,3,12,3z" fill="currentColor"/>
            </svg>
          </div>
          <span class="menu-item-label">Toggle Dark Mode</span>
        </div>
      </div>
    `;
    
    // Cache elements
    this.menu = this.shadowRoot.querySelector('.right-click-menu');
    this.playPauseItem = this.shadowRoot.querySelector('[data-action="play-pause"]');
    this.playIcon = this.shadowRoot.querySelector('.play-icon');
    this.pauseIcon = this.shadowRoot.querySelector('.pause-icon');
    this.muteItem = this.shadowRoot.querySelector('[data-action="mute"]');
    this.volumeIcon = this.shadowRoot.querySelector('.volume-icon');
    this.muteIcon = this.shadowRoot.querySelector('.mute-icon');
    this.playbackRateItem = this.shadowRoot.querySelector('[data-action="playback-rate"]');
    this.rateItems = this.shadowRoot.querySelectorAll('[data-rate]');
    this.darkModeItem = this.shadowRoot.querySelector('[data-action="dark-mode"]');
    this.lightIcon = this.shadowRoot.querySelector('.light-icon');
    this.darkIcon = this.shadowRoot.querySelector('.dark-icon');
    this.fullscreenItem = this.shadowRoot.querySelector('[data-action="fullscreen"]');
    
    // Add event listeners
    this._addMenuItemListeners();
    
    this._initialized = true;
  }
  
  _addMenuItemListeners() {
    if (this.playPauseItem) {
      this.playPauseItem.addEventListener('click', () => {
        if (this._target && typeof this._target.togglePlay === 'function') {
          this._target.togglePlay();
        }
        this.hide();
      });
    }
    
    if (this.muteItem) {
      this.muteItem.addEventListener('click', () => {
        if (this._target && typeof this._target.toggleMute === 'function') {
          this._target.toggleMute();
        }
        this.hide();
      });
    }
    
    if (this.playbackRateItem) {
      this.playbackRateItem.addEventListener('click', () => {
        if (this._target && typeof this._target.setPlaybackRate === 'function') {
          const rate = parseFloat(this.playbackRateItem.dataset.rate);
          if (rate) {
            this._target.setPlaybackRate(rate);
          }
        }
        this.hide();
      });
    }
    
    if (this.fullscreenItem) {
      this.fullscreenItem.addEventListener('click', () => {
        if (this._target && typeof this._target.requestFullscreen === 'function') {
          this._target.requestFullscreen();
        }
        this.hide();
      });
    }
    
    if (this.darkModeItem) {
      this.darkModeItem.addEventListener('click', () => {
        // Toggle dark mode
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newDarkMode = !isDarkMode;
        
        // Update document body
        document.body.classList.toggle('dark-mode', newDarkMode);
        
        // Save preference
        localStorage.setItem('darkMode', newDarkMode);
        
        // Update target if it's a video player
        if (this._target && typeof this._target.setAttribute === 'function') {
          this._target.setAttribute('dark-mode', newDarkMode.toString());
        }
        
        // Update self
        this.setAttribute('dark-mode', newDarkMode.toString());
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('dark-mode-change', {
          bubbles: true,
          detail: {
            darkMode: newDarkMode
          }
        }));
        
        console.log('Dark mode toggled via menu to:', newDarkMode);
        
        // Hide menu
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
            
            if (this._target && typeof this._target.setPlaybackRate === 'function') {
              this._target.setPlaybackRate(rate);
            } else if (this._target && this._target.video) {
              // Direct access to video element
              this._target.video.playbackRate = rate;
            }
          } catch (error) {
            console.error('Error setting playback rate:', error);
          }
          
          this.hide();
        });
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
    
    const target = document.querySelector(this._targetSelector);
    if (target) {
      this._target = target;
      console.log('Found target for right-click menu:', this._targetSelector);
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
          this._setupContextMenu();
        }
      }, 500);
    }
  }
  
  _handleContextMenu(event) {
    event.preventDefault();
    
    // Update menu state if target is a video player
    if (this._target) {
      const video = this._target.video;
      if (video) {
        this._updatePlayPauseState(!video.paused);
        this._updateMuteState(video.muted);
        this._updateSpeedItems(video.playbackRate);
      }
    }
    
    // Show menu at cursor position
    this.show(event.clientX, event.clientY);
  }
  
  _handleDocumentClick(event) {
    // Hide menu if clicked outside
    if (this._isVisible && this.menu && !this.menu.contains(event.target)) {
      this.hide();
    }
  }
  
  _handleDarkModeChange(event) {
    this._darkMode = event.detail.darkMode;
    this._updateDarkMode();
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
  
  _updateDarkMode() {
    if (this._darkMode) {
      this.classList.add('dark-mode');
    } else {
      this.classList.remove('dark-mode');
    }
    
    if (this.lightIcon && this.darkIcon) {
      this.lightIcon.style.display = this._darkMode ? 'none' : 'block';
      this.darkIcon.style.display = this._darkMode ? 'block' : 'none';
    }
  }
  
  show(x, y) {
    if (!this.menu) return;
    
    // Set position
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
    
    // Show menu
    this.menu.style.display = 'block';
    this.menu.classList.add('visible');
    this._isVisible = true;
    
    // Adjust position to fit in viewport
    this._adjustPosition();
  }
  
  hide() {
    if (this.menu) {
      this.menu.style.display = 'none';
      this.menu.classList.remove('visible');
      this._isVisible = false;
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