class VideoPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default state
    this._src = '';
    this._format = 'mp4';
    this._quality = 'hq';
    this._isPlaying = false;
    this._darkMode = localStorage.getItem('darkMode') === 'true';
    this._initialized = false;
    this._isSeeking = false;
    
    // Bind methods
    this._onPlay = this._onPlay.bind(this);
    this._onPause = this._onPause.bind(this);
    this._onTimeUpdate = this._onTimeUpdate.bind(this);
    this._onVolumeChange = this._onVolumeChange.bind(this);
    this._onLoadedMetadata = this._onLoadedMetadata.bind(this);
    this._onEnded = this._onEnded.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._onSeeking = this._onSeeking.bind(this);
    this._onSeeked = this._onSeeked.bind(this);
    
    // Initialize the component
    this._initialize();
  }
  
  static get observedAttributes() {
    return ['src', 'format', 'quality', 'poster', 'dark-mode'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'src':
        this._src = newValue;
        if (this._initialized) {
          this._updateVideoSource();
        }
        break;
      case 'format':
        this._format = newValue;
        if (this._initialized) {
          this._updateVideoSource();
        }
        break;
      case 'quality':
        this._quality = newValue;
        if (this._initialized) {
          this._updateVideoSource();
        }
        break;
      case 'poster':
        if (this.video) this.video.poster = newValue;
        break;
      case 'dark-mode':
        this._darkMode = newValue === 'true';
        if (this._initialized) {
          this._updateDarkMode();
        }
        break;
    }
  }
  
  connectedCallback() {
    console.log('VideoPlayer connected to DOM');
    
    // Initialize event listeners once the element is in the DOM
    // Use setTimeout to ensure the component is fully rendered
    setTimeout(() => {
      this._initializeEventListeners();
      
      // Apply dark mode if needed
      this._updateDarkMode();
      
      // Dispatch ready event
      this.dispatchEvent(new CustomEvent('video-player-ready', {
        bubbles: true,
        composed: true
      }));
      
      console.log('VideoPlayer initialized');
    }, 100);
  }
  
  disconnectedCallback() {
    // Clean up event listeners
    this._removeEventListeners();
  }
  
  async _initialize() {
    // Load CSS
    const cssPath = 'components/video-player/video-player.css';
    try {
      const response = await fetch(cssPath);
      if (response.ok) {
        const css = await response.text();
        this._renderWithCSS(css);
      } else {
        console.error(`Failed to load CSS from ${cssPath}`);
        this._renderWithDefaultStyles();
      }
    } catch (error) {
      console.error(`Error loading CSS: ${error}`);
      this._renderWithDefaultStyles();
    }
    
    // Mark as initialized
    this._initialized = true;
    
    // Update video source if src was set before initialization
    if (this._src) {
      this._updateVideoSource();
    }
  }
  
  _renderWithCSS(css) {
    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <div class="video-container">
        <video 
          id="video" 
          preload="metadata"
          playsinline
        ></video>
        <div class="center-play-button" id="center-play-button">
          <svg viewBox="0 0 24 24" id="center-play-icon">
            <polygon points="5,3 19,12 5,21" fill="white"></polygon>
          </svg>
          <svg viewBox="0 0 24 24" id="center-pause-icon" style="display:none">
            <rect x="6" y="4" width="4" height="16" fill="white"></rect>
            <rect x="14" y="4" width="4" height="16" fill="white"></rect>
          </svg>
        </div>
        <slot></slot>
      </div>
    `;
    
    // Cache DOM elements
    this.video = this.shadowRoot.getElementById('video');
    this.centerPlayButton = this.shadowRoot.getElementById('center-play-button');
    this.centerPlayIcon = this.shadowRoot.getElementById('center-play-icon');
    this.centerPauseIcon = this.shadowRoot.getElementById('center-pause-icon');
    
    // Update video source
    this._updateVideoSource();
  }
  
  _renderWithDefaultStyles() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="components/video-player/video-player.css">
      <div class="video-container">
        <video 
          id="video" 
          playsinline 
          preload="metadata"
          ${this.hasAttribute('loop') ? 'loop' : ''}
          ${this.hasAttribute('muted') ? 'muted' : ''}
          ${this.hasAttribute('autoplay') ? 'autoplay' : ''}
        ></video>
        
        <div class="center-play-button">
          <svg viewBox="0 0 24 24">
            <polygon points="8,5 19,12 8,19" fill="white"></polygon>
          </svg>
        </div>
        
        <div class="video-overlay"></div>
        
        <div class="video-error">
          <div class="video-error-icon">⚠️</div>
          <div class="video-error-message">Failed to load video. Please try again later.</div>
        </div>
        
        <div class="video-loading" style="display:none;">
          <div class="loading-spinner"></div>
        </div>
        
        <slot></slot>
      </div>
    `;
    
    // Get references to key elements
    this.video = this.shadowRoot.getElementById('video');
    this.centerPlayButton = this.shadowRoot.querySelector('.center-play-button');
    this.videoOverlay = this.shadowRoot.querySelector('.video-overlay');
    this.videoError = this.shadowRoot.querySelector('.video-error');
    this.videoLoading = this.shadowRoot.querySelector('.video-loading');
    
    // Initialize UI
    this._updateCenterPlayButton();
    this._updateDarkMode();
    
    // Only update video source if we have a source to set
    if (this._src) {
      this._updateVideoSource();
    }
    
    // Add event listeners
    if (this.video) {
      this._initializeEventListeners();
    }
    
    this._initialized = true;
  }
  
  _updateVideoSource() {
    if (!this.video || !this._src) return;
    
    // Store current time and playing state
    const wasPlaying = !this.video.paused;
    const currentTime = this.video.currentTime;

    // Handle both online and local sources
    const isUrl = this._src.startsWith('https') || this._src.startsWith('http') || this._src.startsWith('blob') || this._src.startsWith('//');
    
    if (isUrl) {
      this.video.src = this._src;
    } else {
      // For local files served from our asset server
      // Encode the filename to handle spaces and special characters
      const encodedSrc = encodeURIComponent(this._src);
      this.video.src = `http://localhost:1122/assets/videos/${encodedSrc}.${this._format}`;
    }
    
    // Load the video
    this.video.load();
    
    // Add an event listener for when the video is ready
    const onLoadedMetadata = () => {
      // Restore time position if possible
      if (currentTime > 0 && currentTime < this.video.duration) {
        this.video.currentTime = currentTime;
      }
      
      // Restore playing state if it was playing
      if (wasPlaying) {
        this.video.play().catch(e => console.error('Error playing video:', e));
      }
      
      // Remove the event listener
      this.video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
    
    this.video.addEventListener('loadedmetadata', onLoadedMetadata);
  }
  
  _initializeEventListeners() {
    if (!this.video) {
      console.warn('Video element not found, cannot initialize event listeners');
      return;
    }
    
    console.log('Initializing video player event listeners');
    
    // Listen for play/pause events to update state
    this.video.addEventListener('play', this._onPlay);
    this.video.addEventListener('pause', this._onPause);
    this.video.addEventListener('timeupdate', this._onTimeUpdate);
    this.video.addEventListener('volumechange', this._onVolumeChange);
    this.video.addEventListener('loadedmetadata', this._onLoadedMetadata);
    this.video.addEventListener('ended', this._onEnded);
    this.video.addEventListener('seeking', this._onSeeking);
    this.video.addEventListener('seeked', this._onSeeked);
    
    // Listen for context menu event to show custom menu
    this.addEventListener('contextmenu', this._onContextMenu);
    
    // Add click event to toggle play/pause
    this.video.addEventListener('click', this._onVideoClick.bind(this));
    
    // Add click event to center play button
    if (this.centerPlayButton) {
      this.centerPlayButton.addEventListener('click', this._onCenterPlayButtonClick.bind(this));
      
      // Show the center play button initially
      this.centerPlayButton.classList.add('visible');
      setTimeout(() => {
        this.centerPlayButton.classList.remove('visible');
      }, 2000);
    }
  }
  
  _removeEventListeners() {
    if (!this.video) return;
    
    this.video.removeEventListener('play', this._onPlay);
    this.video.removeEventListener('pause', this._onPause);
    this.video.removeEventListener('timeupdate', this._onTimeUpdate);
    this.video.removeEventListener('volumechange', this._onVolumeChange);
    this.video.removeEventListener('loadedmetadata', this._onLoadedMetadata);
    this.video.removeEventListener('ended', this._onEnded);
    this.video.removeEventListener('seeking', this._onSeeking);
    this.video.removeEventListener('seeked', this._onSeeked);
    
    this.removeEventListener('contextmenu', this._onContextMenu);
    
    // Remove click event listener
    this.video.removeEventListener('click', this._onVideoClick);
    
    // Remove center play button click event
    if (this.centerPlayButton) {
      this.centerPlayButton.removeEventListener('click', this._onCenterPlayButtonClick);
    }
  }
  
  _onPlay() {
    console.log('Video play event');
    this._isPlaying = true;
    this._updateCenterPlayButton();
    this._notifyStateChange();
  }
  
  _onPause() {
    console.log('Video pause event');
    this._isPlaying = false;
    this._updateCenterPlayButton();
    this._notifyStateChange();
  }
  
  _onTimeUpdate() {
    if (!this._isSeeking) {
      this._notifyStateChange();
    }
  }
  
  _onVolumeChange() {
    this._notifyStateChange();
  }
  
  _onLoadedMetadata() {
    console.log('Video metadata loaded');
    this._notifyStateChange();
  }
  
  _onEnded() {
    console.log('Video ended');
    this._isPlaying = false;
    this._notifyStateChange();
  }
  
  _onSeeking() {
    this._isSeeking = true;
    // Don't pause the video during seeking, but notify state change
    this._notifyStateChange();
  }
  
  _onSeeked() {
    this._isSeeking = false;
    
    // If the video was playing before seeking started, ensure it continues playing
    if (this._isPlaying && this.video.paused) {
      this.video.play().catch(e => console.error('Error resuming playback after seek:', e));
    }
    
    this._notifyStateChange();
  }
  
  _onContextMenu(event) {
    console.log('Context menu event on video player');
    // Prevent the default context menu
    event.preventDefault();
    
    // Dispatch a custom event for the right-click menu component to handle
    this.dispatchEvent(new CustomEvent('video-context-menu', {
      bubbles: true,
      composed: true,
      detail: {
        x: event.clientX,
        y: event.clientY,
        isPlaying: this._isPlaying,
        playbackRate: this.video.playbackRate,
        darkMode: this._darkMode
      }
    }));
  }
  
  _onVideoClick(event) {
    // Prevent default behavior
    event.preventDefault();
    
    // Toggle play/pause
    this.togglePlay();
    
    // Hide center play button after a short delay when playing
    if (!this._isPlaying) { // It will be toggled after togglePlay, so check the opposite
      setTimeout(() => {
        if (this.centerPlayButton) {
          this.centerPlayButton.classList.remove('visible');
        }
      }, 300);
    }
  }
  
  _onCenterPlayButtonClick(event) {
    // Prevent event propagation to avoid triggering the video click event
    event.stopPropagation();
    
    // Toggle play/pause
    this.togglePlay();
    
    // Hide center play button after a short delay when playing
    if (!this._isPlaying) { // It will be toggled after togglePlay, so check the opposite
      setTimeout(() => {
        if (this.centerPlayButton) {
          this.centerPlayButton.classList.remove('visible');
        }
      }, 300);
    }
  }
  
  _updateCenterPlayButton() {
    if (!this.centerPlayButton || !this.centerPlayIcon || !this.centerPauseIcon) return;
    
    if (this._isPlaying) {
      this.centerPlayIcon.style.display = 'none';
      this.centerPauseIcon.style.display = 'block';
      
      // Hide the button after a short delay when playing
      setTimeout(() => {
        this.centerPlayButton.classList.remove('visible');
        this.centerPlayButton.classList.add('hidden');
      }, 500);
    } else {
      this.centerPlayIcon.style.display = 'block';
      this.centerPauseIcon.style.display = 'none';
      this.centerPlayButton.classList.add('visible');
      this.centerPlayButton.classList.remove('hidden');
    }
  }
  
  _notifyStateChange() {
    // Dispatch an event with the current state
    try {
      this.dispatchEvent(new CustomEvent('video-state-change', {
        bubbles: true,
        composed: true,
        detail: {
          isPlaying: this._isPlaying,
          currentTime: this.video.currentTime,
          duration: this.video.duration,
          volume: this.video.volume,
          muted: this.video.muted,
          playbackRate: this.video.playbackRate,
          isSeeking: this._isSeeking
        }
      }));
    } catch (error) {
      console.error('Error dispatching video-state-change event:', error);
    }
  }
  
  _updateDarkMode() {
    if (this._darkMode) {
      this.classList.add('dark-mode');
    } else {
      this.classList.remove('dark-mode');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', this._darkMode);
    
    // Notify about dark mode change
    try {
      console.log('Dispatching dark-mode-change event:', this._darkMode);
      this.dispatchEvent(new CustomEvent('dark-mode-change', {
        bubbles: true,
        composed: true,
        detail: {
          darkMode: this._darkMode
        }
      }));
    } catch (error) {
      console.error('Error dispatching dark-mode-change event:', error);
    }
  }
  
  // Public API methods
  play() {
    console.log('Play method called');
    const video = this.video;
    if (video) video.play().catch(e => console.error('Error playing video:', e));
  }
  
  pause() {
    console.log('Pause method called');
    const video = this.video;
    if (video) video.pause();
  }
  
  togglePlay() {
    console.log('Toggle play method called');
    const video = this.video;
    if (video) {
      if (this._isPlaying) {
        video.pause();
      } else {
        video.play().catch(e => console.error('Error playing video:', e));
      }
    }
  }
  
  setVolume(value) {
    if (this.video) this.video.volume = Math.max(0, Math.min(1, value));
  }
  
  mute() {
    if (this.video) this.video.muted = true;
  }
  
  unmute() {
    if (this.video) this.video.muted = false;
  }
  
  toggleMute() {
    console.log('Toggle mute method called');
    
    const video = this.video;
    if (!video) {
      console.error('Cannot toggle mute: video element not found');
      return;
    }
    
    // Toggle mute state
    video.muted = !video.muted;
    console.log('Mute state toggled, muted:', video.muted);
    
    // Notify state change
    this._notifyStateChange();
  }
  
  /**
   * Seek to a specific time in the video
   * @param {number} time - Time to seek to in seconds
   */
  seek(time) {
    console.log('Video Player seek() called with time:', time);
    
    // Validate video element
    if (!this.video) {
      console.error('Cannot seek: video element not available');
      return false;
    }
    
    // Ensure time is a valid number
    if (typeof time !== 'number' || isNaN(time)) {
      console.error('Invalid seek time (not a number):', time);
      return false;
    }
    
    try {
      // Get current duration (fallback to a large value if not available)
      const duration = this.video.duration || 9999;
      
      // Ensure time is within valid range
      const boundedTime = Math.max(0, Math.min(time, duration));
      
      // Log the seek operation
      console.log(`Seeking video to ${boundedTime.toFixed(2)}s / ${duration.toFixed(2)}s`);
      
      // Set the currentTime property directly
      this.video.currentTime = boundedTime;
      
      // Force update UI immediately
      this._currentTime = boundedTime;
      this._notifyStateChange();
      
      return true;
    } catch (error) {
      console.error('Error seeking video:', error);
      return false;
    }
  }
  
  /**
   * Seek backward by specified seconds
   * @param {number} seconds - Seconds to seek backward
   */
  seekBackward(seconds = 10) {
    console.log('[VideoPlayer] Seek backward called:', seconds);
    
    if (!this.video) {
      console.error('[VideoPlayer] Cannot seek: No video element');
      return;
    }
    
    try {
      // Get current time and calculate new time
      const currentTime = this.video.currentTime || 0;
      console.log('[VideoPlayer] Current time before seek:', currentTime);
      
      // Calculate new time, ensuring it doesn't go below 0
      const newTime = Math.max(currentTime - seconds, 0);
      
      // Set the new time
      this.video.currentTime = newTime;
      console.log('[VideoPlayer] New time after seek:', newTime);
      
      // Notify state change
      this._notifyStateChange();
    } catch (error) {
      console.error('[VideoPlayer] Error seeking backward:', error);
    }
  }
  
  /**
   * Seek forward by specified seconds
   * @param {number} seconds - Seconds to seek forward
   */
  seekForward(seconds = 10) {
    console.log('[VideoPlayer] Seek forward called:', seconds);
    
    if (!this.video) {
      console.error('[VideoPlayer] Cannot seek: No video element');
      return;
    }
    
    try {
      // Get current time and calculate new time
      const currentTime = this.video.currentTime || 0;
      console.log('[VideoPlayer] Current time before seek:', currentTime);
      
      // Calculate new time, ensuring it doesn't exceed duration
      const newTime = Math.min(currentTime + seconds, this.video.duration || 0);
      
      // Set the new time
      this.video.currentTime = newTime;
      console.log('[VideoPlayer] New time after seek:', newTime);
      
      // Notify state change
      this._notifyStateChange();
    } catch (error) {
      console.error('[VideoPlayer] Error seeking forward:', error);
    }
  }
  
  setPlaybackRate(rate) {
    console.log('Set playback rate method called:', rate);
    
    if (!this.video) {
      console.error('Cannot set playback rate: video element not found');
      return;
    }
    
    // Validate the rate is a valid number
    if (rate === undefined || rate === null || isNaN(rate) || !isFinite(rate) || rate <= 0) {
      console.error('Invalid playback rate:', rate);
      // Default to normal speed if invalid
      this.video.playbackRate = 1.0;
      return;
    }
    
    // Set to a valid rate within safe limits
    const validRate = Math.max(0.25, Math.min(4.0, rate));
    
    try {
      this.video.playbackRate = validRate;
      console.log('Playback rate set to:', validRate);
      
      // If the rate was adjusted, log it
      if (validRate !== rate) {
        console.log('Adjusted playback rate to safe value:', validRate);
      }
      
      // Dispatch event to notify other components
      this.dispatchEvent(new CustomEvent('playback-rate-change', {
        bubbles: true,
        composed: true,
        detail: { rate: validRate }
      }));
    } catch (error) {
      console.error('Error setting playback rate:', error);
    }
  }
  
  increasePlaybackRate() {
    console.log('Increase playback rate method called');
    if (this.video) {
      const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
      const currentIndex = rates.indexOf(this.video.playbackRate);
      const nextIndex = Math.min(rates.length - 1, currentIndex + 1);
      this.video.playbackRate = rates[nextIndex >= 0 ? nextIndex : 3]; // Default to 1x if not found
    }
  }
  
  decreasePlaybackRate() {
    console.log('Decrease playback rate method called');
    if (this.video) {
      const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
      const currentIndex = rates.indexOf(this.video.playbackRate);
      const prevIndex = Math.max(0, currentIndex - 1);
      this.video.playbackRate = rates[prevIndex >= 0 ? prevIndex : 3]; // Default to 1x if not found
    }
  }
  
  requestFullscreen() {
    console.log('Requesting fullscreen');
    
    if (!this.isConnected) {
      console.warn('Cannot request fullscreen: Element is not connected to the DOM');
      return;
    }
    
    try {
      const videoContainer = this.shadowRoot.querySelector('.video-container');
      
      if (!videoContainer) {
        console.warn('Cannot request fullscreen: Video container not found');
        return;
      }
      
      if (document.fullscreenElement) {
        console.log('Exiting fullscreen');
        document.exitFullscreen().catch(e => {
          console.error('Error exiting fullscreen:', e);
        });
      } else {
        console.log('Entering fullscreen');
        videoContainer.requestFullscreen().catch(e => {
          console.error('Error requesting fullscreen:', e);
        });
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }
  
  toggleDarkMode() {
    console.log('Video player toggling dark mode');
    
    // Toggle dark mode on the document body first
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    console.log('Dark mode set to:', isDarkMode);
    
    // Update our own dark mode state
    this._darkMode = isDarkMode;
    this._updateDarkMode();
    
    // Update all components that need dark mode
    // Update right-click menu
    const rightClickMenu = document.getElementById('right-click-menu');
    if (rightClickMenu) {
      console.log('Updating right-click menu dark mode:', isDarkMode);
      rightClickMenu.setAttribute('dark-mode', isDarkMode.toString());
    }
    
    // Update shortcut handler
    const shortcutHandler = document.getElementById('shortcut-handler');
    if (shortcutHandler) {
      console.log('Updating shortcut handler dark mode:', isDarkMode);
      shortcutHandler.setAttribute('dark-mode', isDarkMode.toString());
    }
    
    // Update media sidebar if it exists
    const mediaSidebar = document.getElementById('media-sidebar');
    if (mediaSidebar) {
      console.log('Updating media sidebar dark mode:', isDarkMode);
      mediaSidebar.setAttribute('dark-mode', isDarkMode.toString());
    }
    
    // Apply dark mode class to all relevant elements
    document.querySelectorAll('.dark-mode-aware').forEach(el => {
      if (isDarkMode) {
        el.classList.add('dark-mode');
      } else {
        el.classList.remove('dark-mode');
      }
    });
    
    // Find all custom elements that might support dark mode
    document.querySelectorAll('*').forEach(el => {
      if (el.tagName.includes('-') && typeof el.setAttribute === 'function' && el !== this) {
        try {
          el.setAttribute('dark-mode', isDarkMode.toString());
        } catch (e) {
          // Ignore errors for elements that don't support this attribute
        }
      }
    });
    
    // Dispatch dark mode change event
    document.dispatchEvent(new CustomEvent('dark-mode-change', {
      bubbles: true,
      detail: {
        darkMode: isDarkMode
      }
    }));
    
    console.log('Dark mode change event dispatched');
  }
  
  // Get available playback rates
  getPlaybackRates() {
    return [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  }
  
  // Get current playback rate
  getPlaybackRate() {
    return this.video ? this.video.playbackRate : 1;
  }
  
  // Helper method to get the video element
  get video() {
    return this._videoElement || this.shadowRoot?.querySelector('video') || null;
  }
  
  // Setter for the video element
  set video(element) {
    this._videoElement = element;
  }
}

customElements.define('video-player', VideoPlayer); 