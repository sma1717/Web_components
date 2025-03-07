class VideoControls extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default state
    this._isPlaying = false;
    this._currentTime = 0;
    this._duration = 0;
    this._volume = 1;
    this._muted = false;
    this._playbackRate = 1;
    this._darkMode = localStorage.getItem('darkMode') === 'true';
    this._isSeeking = false;
    
    // Bind methods to ensure proper 'this' context
    this._onVideoStateChange = this._onVideoStateChange.bind(this);
    this._onDarkModeChange = this._onDarkModeChange.bind(this);
    this._onPlayPauseClick = this._onPlayPauseClick.bind(this);
    this._onMuteClick = this._onMuteClick.bind(this);
    this._onVolumeChange = this._onVolumeChange.bind(this);
    this._onProgressClick = this._onProgressClick.bind(this);
    this._onFullscreenClick = this._onFullscreenClick.bind(this);
    this._onPlaybackRateButtonClick = this._onPlaybackRateButtonClick.bind(this);
    this._onRateOptionClick = this._onRateOptionClick.bind(this);
    this._onDarkModeToggle = this._onDarkModeToggle.bind(this);
    this._onDocumentClick = this._onDocumentClick.bind(this);
    this._onSkipForwardClick = this._onSkipForwardClick.bind(this);
    this._onSkipBackwardClick = this._onSkipBackwardClick.bind(this);
    this._handleMediaChanged = this._handleMediaChanged.bind(this);
    
    // Initialize the component
    this._initialize();
  }
  
  connectedCallback() {
    console.log('VideoControls connected to DOM');
    
    // Find the parent video player
    this._findVideoPlayer();
    
    // Initialize event listeners only after the component is fully rendered
    // and the video player is found
    setTimeout(() => {
      // Refresh cache once more after connecting to DOM
      this._refreshCache();
      
      if (this.videoPlayer) {
        this._initializeEventListeners();
      }
      
      // Listen for media changes
      document.addEventListener('media-changed', this._handleMediaChanged);
    }, 100);
  }
  
  disconnectedCallback() {
    console.log('VideoControls disconnected from DOM');
    
    // Clean up event listeners
    this._removeEventListeners();
    
    // Remove media change listener
    document.removeEventListener('media-changed', this._handleMediaChanged);
  }
  
  async _initialize() {
    // Load CSS
    const cssPath = 'components/video-controls/video-controls.css';
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
    
    // Ensure elements are properly cached after rendering
    setTimeout(() => {
      this._refreshCache();
      console.log('Delayed element cache refresh completed');
    }, 300);
  }
  
  _renderWithCSS(css) {
    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <div class="controls-container">
        <div class="progress-container" id="progress-container">
          <div class="buffer-bar" id="buffer-bar"></div>
          <div class="progress-bar" id="progress-bar"></div>
        </div>
        <div class="controls-row">
          <div class="left-controls">
            <button id="play-pause-btn" aria-label="Play">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5,3 19,12 5,21" id="play-icon"></polygon>
                <g id="pause-icon" style="display:none">
                  <line x1="6" y1="4" x2="6" y2="20"></line>
                  <line x1="18" y1="4" x2="18" y2="20"></line>
                </g>
              </svg>
            </button>
            
            <!-- Skip backward button -->
            <button id="skip-backward-btn" aria-label="Skip Backward 10 Seconds">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,8 8,12 12,16"></polyline>
                <text x="12" y="13" font-size="6" text-anchor="middle" fill="currentColor">10</text>
              </svg>
            </button>
            
            <!-- Skip forward button -->
            <button id="skip-forward-btn" aria-label="Skip Forward 10 Seconds">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,8 16,12 12,16"></polyline>
                <text x="12" y="13" font-size="6" text-anchor="middle" fill="currentColor">10</text>
              </svg>
            </button>
            
            <div class="volume-container">
              <button id="mute-btn" aria-label="Mute">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" id="volume-icon"></polygon>
                  <path d="M15 8a5 5 0 0 1 0 8" id="volume-low"></path>
                  <path d="M19 5a9 9 0 0 1 0 14" id="volume-high"></path>
                  <line x1="2" y1="22" x2="22" y2="2" id="mute-line" style="display:none"></line>
                </svg>
              </button>
              <input type="range" class="volume-slider" id="volume-slider" min="0" max="1" step="0.1" value="1">
            </div>
            <div class="time-display" id="time-display">0:00 / 0:00</div>
          </div>
          <div class="right-controls">
            <div class="playback-rate-menu">
              <button class="playback-rate-button" id="playback-rate-btn">1x</button>
              <div class="playback-rate-options" id="playback-rate-options">
                <div class="rate-option" data-rate="0.25">0.25x</div>
                <div class="rate-option" data-rate="0.5">0.5x</div>
                <div class="rate-option" data-rate="0.75">0.75x</div>
                <div class="rate-option" data-rate="1">1x</div>
                <div class="rate-option" data-rate="1.25">1.25x</div>
                <div class="rate-option" data-rate="1.5">1.5x</div>
                <div class="rate-option" data-rate="1.75">1.75x</div>
                <div class="rate-option" data-rate="2">2x</div>
              </div>
            </div>
            <button id="dark-mode-btn" class="dark-mode-toggle" aria-label="Toggle Dark Mode">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path id="light-icon" d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                <path id="light-rays" d="M12 2v2m0 16v2m-8-10H2m20 0h-2m-3.5-6.5L15 7M5 19l1.5-1.5m12.5-12.5L17.5 6.5M5 5l1.5 1.5"></path>
                <path id="dark-icon" style="display:none" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-4.54-4.54c-.44-.06-.9-.1-1.36-.1z"></path>
              </svg>
            </button>
            <button id="fullscreen-btn" aria-label="Fullscreen">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    
    this._cacheElements();
  }
  
  _renderWithDefaultStyles() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="components/video-controls/video-controls.css">
      <div class="video-controls">
        <div class="progress-container">
          <div class="buffer-bar"></div>
          <div class="progress-bar"></div>
          <div class="hover-time">0:00</div>
        </div>
        
        <div class="controls-bar">
        <div class="left-controls">
          <button class="play-pause-button">
            <svg class="play-icon" viewBox="0 0 24 24" width="24" height="24">
              <polygon points="9,5 19,12 9,19" fill="currentColor"></polygon>
            </svg>
            <svg class="pause-icon" viewBox="0 0 24 24" width="24" height="24" style="display:none">
              <rect x="7" y="5" width="3" height="14" fill="currentColor"></rect>
              <rect x="14" y="5" width="3" height="14" fill="currentColor"></rect>
            </svg>
          </button>
          
          <button class="skip-backward-button">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M12,5V1L7,6l5,5V7c3.3,0,6,2.7,6,6s-2.7,6-6,6s-6-2.7-6-6H4c0,4.4,3.6,8,8,8s8-3.6,8-8S16.4,5,12,5z" fill="currentColor"/>
              <text x="12" y="13">10s</text>
            </svg>
          </button>
          
          <button class="skip-forward-button">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M12,5V1l5,5l-5,5V7c-3.3,0-6,2.7-6,6s2.7,6,6,6s6-2.7,6-6h2c0,4.4-3.6,8-8,8s-8-3.6-8-8S7.6,5,12,5z" fill="currentColor"/>
              <text x="12" y="13">10s</text>
            </svg>
          </button>
          
          <div class="volume-container">
            <button class="mute-button">
              <svg class="volume-icon" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
              </svg>
              <svg class="mute-icon" viewBox="0 0 24 24" style="display: none;">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/>
              </svg>
            </button>
            <div class="volume-slider-container">
              <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="1">
            </div>
          </div>
          
          <div class="time-display">0:00 / 0:00</div>
          </div>
          <div class="right-controls">
            <button class="playback-rate-button">
              <span>1x</span>
            </button>
            <div class="playback-rate-options">
              <div class="rate-option" data-rate="0.25">0.25x</div>
              <div class="rate-option" data-rate="0.5">0.5x</div>
              <div class="rate-option" data-rate="0.75">0.75x</div>
              <div class="rate-option active" data-rate="1">1x</div>
              <div class="rate-option" data-rate="1.25">1.25x</div>
              <div class="rate-option" data-rate="1.5">1.5x</div>
              <div class="rate-option" data-rate="1.75">1.75x</div>
              <div class="rate-option" data-rate="2">2x</div>
            </div>
            
            <button class="fullscreen-button">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
              </svg>
            </button>
            
            <button class="dark-mode-button">
              <svg class="light-icon" viewBox="0 0 24 24" width="24" height="24">
                <circle cx="12" cy="12" r="5" fill="currentColor"/>
                <path class="light-rays" d="M12,2V4M12,20v2M2,12H4M20,12h2M17.7,6.3L16.3,7.7M7.7,16.3L6.3,17.7M16.3,16.3L17.7,17.7M7.7,7.7L6.3,6.3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg class="dark-icon" viewBox="0 0 24 24" width="24" height="24" style="display:none">
                <path d="M12,3c-5,0-9,4-9,9s4,9,9,9s9-4,9-9c0-0.5,0-0.9-0.1-1.4c-1,1.4-2.6,2.3-4.4,2.3c-3,0-5.4-2.4-5.4-5.4c0-1.8,0.9-3.4,2.3-4.4C12.9,3,12.5,3,12,3z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    
    this._cacheElements();
  }
  
  _cacheElements() {
    // Get references to all the elements we need to interact with
    this.progressContainer = this.shadowRoot.querySelector('.progress-container');
    this.progressBar = this.shadowRoot.querySelector('.progress-bar');
    this.bufferBar = this.shadowRoot.querySelector('.buffer-bar');
    this.hoverTime = this.shadowRoot.querySelector('.hover-time');
    this.playPauseBtn = this.shadowRoot.querySelector('.play-pause-button');
    this.playIcon = this.shadowRoot.querySelector('.play-icon');
    this.pauseIcon = this.shadowRoot.querySelector('.pause-icon');
    this.muteBtn = this.shadowRoot.querySelector('.mute-button');
    this.volumeIcon = this.shadowRoot.querySelector('.volume-icon');
    this.volumeLow = this.shadowRoot.querySelector('.volume-low');
    this.volumeHigh = this.shadowRoot.querySelector('.volume-high');
    this.muteLine = this.shadowRoot.querySelector('.mute-line');
    this.volumeSlider = this.shadowRoot.querySelector('.volume-slider');
    this.timeDisplay = this.shadowRoot.querySelector('.time-display');
    this.fullscreenBtn = this.shadowRoot.querySelector('.fullscreen-button');
    this.playbackRateBtn = this.shadowRoot.querySelector('.playback-rate-button');
    this.playbackRateOptions = this.shadowRoot.querySelector('.playback-rate-options');
    this.darkModeBtn = this.shadowRoot.querySelector('.dark-mode-button');
    this.lightIcon = this.shadowRoot.querySelector('.light-icon');
    this.darkIcon = this.shadowRoot.querySelector('.dark-icon');
    this.skipForwardBtn = this.shadowRoot.querySelector('.skip-forward-button');
    this.skipBackwardBtn = this.shadowRoot.querySelector('.skip-backward-button');
    
    // Force refresh caching after a small delay to ensure DOM is fully rendered
    setTimeout(() => this._refreshCache(), 100);
    
    console.log('Video controls elements cached:', {
      playPauseBtn: !!this.playPauseBtn,
      playIcon: !!this.playIcon,
      pauseIcon: !!this.pauseIcon,
      progressContainer: !!this.progressContainer,
      skipForwardBtn: !!this.skipForwardBtn,
      skipBackwardBtn: !!this.skipBackwardBtn,
      hoverTime: !!this.hoverTime
    });
  }
  
  _refreshCache() {
    // Re-query all essential elements if they're not found
    if (!this.playIcon) this.playIcon = this.shadowRoot.querySelector('.play-icon');
    if (!this.pauseIcon) this.pauseIcon = this.shadowRoot.querySelector('.pause-icon');
    if (!this.volumeIcon) this.volumeIcon = this.shadowRoot.querySelector('.volume-icon');
    if (!this.muteIcon) this.muteIcon = this.shadowRoot.querySelector('.mute-icon');
    if (!this.volumeSlider) this.volumeSlider = this.shadowRoot.querySelector('.volume-slider');
    if (!this.volumeSliderContainer) this.volumeSliderContainer = this.shadowRoot.querySelector('.volume-slider-container');
    if (!this.volumeContainer) this.volumeContainer = this.shadowRoot.querySelector('.volume-container');
    if (!this.progressBar) this.progressBar = this.shadowRoot.querySelector('.progress-bar');
    if (!this.bufferBar) this.bufferBar = this.shadowRoot.querySelector('.buffer-bar');
    if (!this.timeDisplay) this.timeDisplay = this.shadowRoot.querySelector('.time-display');
    if (!this.playbackRateBtn) this.playbackRateBtn = this.shadowRoot.querySelector('.playback-rate-button');
    if (!this.playbackRateOptions) this.playbackRateOptions = this.shadowRoot.querySelector('.playback-rate-options');
    
    // Log the results of refreshed cache
    const cacheStatus = {
      playIcon: !!this.playIcon,
      pauseIcon: !!this.pauseIcon,
      volumeControls: !!(this.volumeIcon && this.muteIcon && this.volumeSlider),
      progressBar: !!this.progressBar,
      timeDisplay: !!this.timeDisplay
    };
    
    console.log('Cache refreshed:', cacheStatus);
    
    // Return false if any essential elements are missing
    return !(cacheStatus.playIcon && cacheStatus.pauseIcon && 
            cacheStatus.volumeControls && cacheStatus.progressBar && 
            cacheStatus.timeDisplay);
  }
  
  /**
   * Find the parent video player element
   */
  _findVideoPlayer() {
    console.log('[VideoControls] Finding video player');
    
    // First try: Direct parent element
    let parent = this.parentElement;
    if (parent && parent.tagName.toLowerCase() === 'video-player') {
      console.log('[VideoControls] Found video player (direct parent)');
      this.videoPlayer = parent;
      return;
    }
    
    // Second try: Closest video-player ancestor
    parent = this.closest('video-player');
    if (parent) {
      console.log('[VideoControls] Found video player (ancestor)');
      this.videoPlayer = parent;
      return;
    }
    
    // Third try: Find by selector in the document
    parent = document.querySelector('video-player');
    if (parent) {
      console.log('[VideoControls] Found video player (document query)');
      this.videoPlayer = parent;
      return;
    }
    
    console.error('[VideoControls] Could not find video player');
    this.videoPlayer = null;
  }
  
  _initializeEventListeners() {
    // Only add event listeners if we have a video player
    if (!this.videoPlayer) {
      console.error('Cannot initialize event listeners: no video player found');
      return;
    }
    
    console.log('Initializing video controls event listeners');
    
    // Listen for video player state changes
    this.videoPlayer.addEventListener('video-state-change', this._onVideoStateChange);
    this.videoPlayer.addEventListener('dark-mode-change', this._onDarkModeChange);
    
    // Add button click handlers
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', this._onPlayPauseClick);
    }
    
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', this._onMuteClick);
    }
    
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', this._onVolumeChange);
    }
    
    // Add progress container events
    if (this.progressContainer) {
      this.progressContainer.addEventListener('click', this._onProgressClick);
      // Add hover events for showing time on hover
      this.progressContainer.addEventListener('mousemove', this._onProgressHover.bind(this));
      this.progressContainer.addEventListener('mouseleave', this._onProgressLeave.bind(this));
    }
    
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', this._onFullscreenClick);
    }
    
    if (this.playbackRateBtn) {
      this.playbackRateBtn.addEventListener('click', this._onPlaybackRateButtonClick);
    }
    
    if (this.darkModeBtn) {
      this.darkModeBtn.addEventListener('click', this._onDarkModeToggle);
    }
    
    if (this.skipForwardBtn) {
      this.skipForwardBtn.addEventListener('click', this._onSkipForwardClick);
    }
    
    if (this.skipBackwardBtn) {
      this.skipBackwardBtn.addEventListener('click', this._onSkipBackwardClick);
    }
    
    // Add document click handler for closing playback rate options
    document.addEventListener('click', this._onDocumentClick);
    
    // Get initial state from video player if available
    try {
      if (this.videoPlayer.video) {
        this._isPlaying = !this.videoPlayer.video.paused;
        this._currentTime = this.videoPlayer.video.currentTime;
        this._duration = this.videoPlayer.video.duration;
        this._volume = this.videoPlayer.video.volume;
        this._muted = this.videoPlayer.video.muted;
        this._playbackRate = this.videoPlayer.video.playbackRate;
        
        console.log('Initial video state:', {
          isPlaying: this._isPlaying,
          currentTime: this._currentTime,
          duration: this._duration,
          volume: this._volume,
          muted: this._muted,
          playbackRate: this._playbackRate
        });
        
        // Update UI with initial state
        this._updateControlsState({
          isPlaying: this._isPlaying,
          currentTime: this._currentTime,
          duration: this._duration,
          volume: this._volume,
          muted: this._muted,
          playbackRate: this._playbackRate
        });
      }
    } catch (error) {
      console.error('Error getting initial video state:', error);
    }
  }
  
  _removeEventListeners() {
    if (!this.videoPlayer) return;
    
    this.videoPlayer.removeEventListener('video-state-change', this._onVideoStateChange);
    this.videoPlayer.removeEventListener('dark-mode-change', this._onDarkModeChange);
    
    if (this.playPauseBtn) {
      this.playPauseBtn.removeEventListener('click', this._onPlayPauseClick);
    }
    if (this.muteBtn) {
      this.muteBtn.removeEventListener('click', this._onMuteClick);
    }
    if (this.volumeSlider) {
      this.volumeSlider.removeEventListener('input', this._onVolumeChange);
    }
    if (this.progressContainer) {
      this.progressContainer.removeEventListener('click', this._onProgressClick);
      this.progressContainer.removeEventListener('mousemove', this._onProgressHover.bind(this));
      this.progressContainer.removeEventListener('mouseleave', this._onProgressLeave.bind(this));
    }
    if (this.fullscreenBtn) {
      this.fullscreenBtn.removeEventListener('click', this._onFullscreenClick);
    }
    if (this.playbackRateBtn) {
      this.playbackRateBtn.removeEventListener('click', this._onPlaybackRateButtonClick);
    }
    if (this.darkModeBtn) {
      this.darkModeBtn.removeEventListener('click', this._onDarkModeToggle);
    }
    
    document.removeEventListener('click', this._onDocumentClick);
  }
  
  _onPlayPauseClick() {
    console.log('Play/pause button clicked, current state:', this._isPlaying);
    
    if (!this.videoPlayer) {
      console.error('No video player found');
      return;
    }
    
    if (this._isPlaying) {
      this.videoPlayer.pause();
      this._isPlaying = false; // Immediately update local state for responsive UI
      this._updatePlayPauseButton(); // Update the button immediately
    } else {
      this.videoPlayer.play();
      this._isPlaying = true; // Immediately update local state for responsive UI
      this._updatePlayPauseButton(); // Update the button immediately
    }
  }
  
  _onMuteClick() {
    console.log('Mute button clicked');
    
    if (!this.videoPlayer) {
      console.error('Cannot toggle mute: video player not found');
      return;
    }
    
    // Toggle mute state
    if (typeof this.videoPlayer.toggleMute === 'function') {
      this.videoPlayer.toggleMute();
      
      // Update UI immediately for better feedback
      this._muted = !this._muted;
      this._updateVolumeControls();
    } else {
      console.error('Video player does not have toggleMute method');
    }
  }
  
  _onVolumeChange(event) {
    if (!this.videoPlayer || !this.videoPlayer.video) {
      return;
    }
    
    const video = this.videoPlayer.video;
    const newVolume = parseFloat(event.target.value);
    
    // Set volume on video
    video.volume = newVolume;
    
    // If volume is 0, mute the video, otherwise unmute
    if (newVolume === 0) {
      video.muted = true;
    } else if (video.muted) {
      video.muted = false;
    }
    
    // Update UI
    this._updateVolumeControls();
  }
  
  /**
   * Handle click on the progress bar
   * @param {MouseEvent} event - The click event
   * @private
   */
  _onProgressClick(event) {
    console.log('[VideoControls] Progress bar clicked');
    
    // Make sure we have a valid video player
    this._findVideoPlayer();
    if (!this.videoPlayer) {
      console.error('[VideoControls] Cannot seek: No video player found');
      return;
    }
    
    // Get the video element directly
    const video = this.videoPlayer.querySelector('video') || this.videoPlayer.video;
    if (!video) {
      console.error('[VideoControls] Cannot seek: No video element found');
      return;
    }
    
    try {
      // Calculate time from click position
      const rect = this.progressContainer.getBoundingClientRect();
      const position = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const seekTime = position * (video.duration || 0);
      
      console.log('[VideoControls] Seeking to position:', position, 'time:', seekTime);
      
      // Check if video is seekable
      const isSeekable = video.seekable && video.seekable.length > 0 && 
                         video.seekable.end(0) > 0 && 
                         seekTime <= video.seekable.end(0);
      
      console.log('[VideoControls] Seekable range:', 
                 video.seekable && video.seekable.length > 0 ? 
                 `${video.seekable.start(0)} - ${video.seekable.end(0)}` : 'Not available');
      
      // Check if video is ready for seeking
      if (video.readyState >= 2 && isSeekable) {
        // Set the new time directly on the video element
        video.currentTime = seekTime;
        console.log('[VideoControls] After seek - New time set to:', seekTime);
        
        // Force UI update
        this._currentTime = seekTime;
        this._updateProgressBar();
        this._updateTimeDisplay();
        
        // If video is paused and we have auto-play on seek enabled, play the video
        if (video.paused && this.getAttribute('auto-play-on-seek') === 'true') {
          video.play().catch(err => console.error('[VideoControls] Error playing after seek:', err));
        }
      } else {
        // If video is not ready, wait for it to be seekable
        console.log('[VideoControls] Video not ready for seeking, waiting for it to be seekable...');
        
        // Function to attempt seeking when the video becomes seekable
        const attemptSeek = () => {
          // Check if the video is now seekable to our target time
          const nowSeekable = video.seekable && video.seekable.length > 0 && 
                             video.seekable.end(0) > 0 && 
                             seekTime <= video.seekable.end(0);
          
          if (video.readyState >= 2 && nowSeekable) {
            // Video is now seekable, set the time
            video.currentTime = seekTime;
            console.log('[VideoControls] Delayed seek - New time set to:', seekTime);
            
            // Force UI update
            this._currentTime = seekTime;
            this._updateProgressBar();
            this._updateTimeDisplay();
            
            // If video is paused and we have auto-play on seek enabled, play the video
            if (video.paused && this.getAttribute('auto-play-on-seek') === 'true') {
              video.play().catch(err => console.error('[VideoControls] Error playing after seek:', err));
            }
            
            // Clean up event listeners
            video.removeEventListener('canplay', attemptSeek);
            video.removeEventListener('loadedmetadata', attemptSeek);
            video.removeEventListener('seeked', attemptSeek);
            clearInterval(seekableCheckInterval);
          }
        };
        
        // Add event listeners for various video loading events
        video.addEventListener('canplay', attemptSeek);
        video.addEventListener('loadedmetadata', attemptSeek);
        video.addEventListener('seeked', attemptSeek);
        
        // Also check periodically in case events don't fire
        const seekableCheckInterval = setInterval(() => {
          const nowSeekable = video.seekable && video.seekable.length > 0 && 
                             video.seekable.end(0) > 0 && 
                             seekTime <= video.seekable.end(0);
          
          console.log('[VideoControls] Checking seekable range:', 
                     video.seekable && video.seekable.length > 0 ? 
                     `${video.seekable.start(0)} - ${video.seekable.end(0)}` : 'Not available');
          
          if (video.readyState >= 2 && nowSeekable) {
            // Video is now seekable, set the time
            video.currentTime = seekTime;
            console.log('[VideoControls] Interval seek - New time set to:', seekTime);
            
            // Force UI update
            this._currentTime = seekTime;
            this._updateProgressBar();
            this._updateTimeDisplay();
            
            // If video is paused and we have auto-play on seek enabled, play the video
            if (video.paused && this.getAttribute('auto-play-on-seek') === 'true') {
              video.play().catch(err => console.error('[VideoControls] Error playing after seek:', err));
            }
            
            // Clean up event listeners
            video.removeEventListener('canplay', attemptSeek);
            video.removeEventListener('loadedmetadata', attemptSeek);
            video.removeEventListener('seeked', attemptSeek);
            clearInterval(seekableCheckInterval);
          }
        }, 500);
        
        // Clear the interval after 10 seconds to prevent memory leaks
        setTimeout(() => {
          clearInterval(seekableCheckInterval);
        }, 10000);
      }
    } catch (err) {
      console.error('[VideoControls] Error setting currentTime:', err);
    }
  }
  
  _onFullscreenClick() {
    console.log('Fullscreen clicked');
    if (this.videoPlayer) {
      this.videoPlayer.requestFullscreen();
    }
  }
  
  _onPlaybackRateButtonClick(e) {
    console.log('Playback rate button clicked');
    
    // Make sure we have the rate options element
    if (!this.playbackRateOptions) {
      this.playbackRateOptions = this.shadowRoot.querySelector('.playback-rate-options');
      if (!this.playbackRateOptions) {
        console.error('Playback rate options element not found');
        return;
      }
    }
    
    // Toggle visibility of playback rate options
    const isVisible = this.playbackRateOptions.classList.toggle('visible');
    console.log('Playback rate menu visibility:', isVisible);
    
    // If showing the menu, add listeners to options if needed
    if (isVisible) {
      this._attachRateOptionListeners();
      this._updateActiveRateOption();
    }
    
    // Prevent the click from immediately closing the menu
    e.stopPropagation();
  }
  
  _attachRateOptionListeners() {
    const rateOptions = this.playbackRateOptions.querySelectorAll('.rate-option');
    
    if (rateOptions.length === 0) {
      console.warn('No rate options found in the menu');
      return;
    }
    
    console.log(`Adding click listeners to ${rateOptions.length} rate options`);
    
    rateOptions.forEach(option => {
      // First remove any existing listeners to prevent duplicates
      option.removeEventListener('click', this._onRateOptionClick);
      
      // Add fresh listener
      option.addEventListener('click', this._onRateOptionClick);
    });
  }
  
  _onRateOptionClick(e) {
    console.log('Rate option clicked');
    
    try {
      // Get the selected rate
      const rateValue = e.target.getAttribute('data-rate');
      const rate = parseFloat(rateValue);
      
      if (isNaN(rate)) {
        console.error('Invalid playback rate:', rateValue);
        return;
      }
      
      console.log('Setting playback rate to:', rate);
      
      // Set the rate on the video player
      if (this.videoPlayer) {
        if (typeof this.videoPlayer.setPlaybackRate === 'function') {
          this.videoPlayer.setPlaybackRate(rate);
        } else if (this.videoPlayer.video) {
          // Direct fallback
          this.videoPlayer.video.playbackRate = rate;
        }
        
        // Update local state
        this._playbackRate = rate;
        this._updatePlaybackRateDisplay();
      } else {
        console.error('Video player not found for rate change');
      }
      
      // Hide the menu
      if (this.playbackRateOptions) {
        this.playbackRateOptions.classList.remove('visible');
      }
    } catch (error) {
      console.error('Error handling rate option click:', error);
    }
    
    // Prevent bubbling
    e.stopPropagation();
  }
  
  _updatePlaybackRateDisplay() {
    if (this.playbackRateBtn) {
      // Ensure button exists and has a child span
      const span = this.playbackRateBtn.querySelector('span');
      if (span) {
        span.textContent = `${this._playbackRate}x`;
      } else {
        console.warn('Playback rate button span not found');
      }
    }
    
    this._updateActiveRateOption();
  }
  
  _updateActiveRateOption() {
    if (!this.playbackRateOptions) {
      return;
    }
    
    // Remove active class from all options
    const allOptions = this.playbackRateOptions.querySelectorAll('.rate-option');
    allOptions.forEach(option => option.classList.remove('active'));
    
    // Find and activate the matching option
    const activeOption = this.playbackRateOptions.querySelector(`.rate-option[data-rate="${this._playbackRate}"]`);
    if (activeOption) {
      activeOption.classList.add('active');
    }
  }
  
  _onDarkModeToggle() {
    console.log('Dark mode toggle clicked');
    
    // Toggle dark mode on the document body first
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    console.log('Dark mode set to:', isDarkMode);
    
    // Update all components that need dark mode
    // First, update the video player
    if (this.videoPlayer) {
      console.log('Updating video player dark mode:', isDarkMode);
      this.videoPlayer.setAttribute('dark-mode', isDarkMode.toString());
    }
    
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
      if (el.tagName.includes('-') && typeof el.setAttribute === 'function') {
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
  
  _onDocumentClick(e) {
    // Close playback rate options when clicking outside
    if (this.playbackRateOptions && 
        this.playbackRateOptions.classList.contains('visible') &&
        !this.playbackRateOptions.contains(e.target) &&
        !this.playbackRateBtn.contains(e.target)) {
      this.playbackRateOptions.classList.remove('visible');
      console.log('Closed playback rate options via document click');
    }
  }
  
  _onVideoStateChange(e) {
    // Update our local state from the video player's state
    const state = e.detail;
    
    // Try to ensure we have all necessary elements before updating state
    this._ensureControlsExist();
    
    // Update our internal state
    this._isPlaying = state.isPlaying;
    this._currentTime = state.currentTime;
    this._duration = state.duration;
    this._volume = state.volume;
    this._muted = state.muted;
    this._playbackRate = state.playbackRate;
    this._isSeeking = state.isSeeking || false;
    
    console.log('Video state updated:', { 
      isPlaying: this._isPlaying,
      currentTime: this._currentTime,
      volume: this._volume,
      muted: this._muted
    });
    
    // Update UI
    this._updateControlsState(state);
  }
  
  _onDarkModeChange(e) {
    console.log('Dark mode changed:', e.detail);
    this._darkMode = e.detail.darkMode;
    this._updateDarkMode();
  }
  
  _updateControlsState(state) {
    // Ensure that we have cached DOM elements before updating
    const missingElements = this._refreshCache();
    if (missingElements) {
      console.warn('Some essential control elements are still missing after refresh');
    }
    
    // Update UI even if some elements are missing (we'll handle each case individually)
    this._updatePlayPauseButton();
    this._updateProgressBar();
    this._updateTimeDisplay();
    this._updateVolumeControls();
    this._updatePlaybackRateDisplay();
  }
  
  _updatePlayPauseButton() {
    console.log('Updating play/pause button, isPlaying:', this._isPlaying);
    
    // Check if we need to recreate the controls
    if (this._ensureControlsExist()) {
      console.log('Controls recreated, deferring update');
      return;
    }
    
    try {
      // Update the button state based on isPlaying
      if (this._isPlaying) {
        this.playIcon.style.display = 'none';
        this.pauseIcon.style.display = 'block';
        console.log('Showing pause icon');
      } else {
        this.playIcon.style.display = 'block';
        this.pauseIcon.style.display = 'none';
        console.log('Showing play icon');
      }
    } catch (error) {
      console.error('Error updating play/pause button:', error);
    }
  }
  
  _updateProgressBar() {
    if (!this.progressBar || !this.bufferBar) return;
    
    // Calculate progress percentage
    const progress = this._duration > 0 ? (this._currentTime / this._duration) * 100 : 0;
    
    // Apply progress to the bar with a visual indicator for seeking state
    this.progressBar.style.width = `${progress}%`;
    
    // Add a visual indicator when seeking
    if (this._isSeeking) {
      this.progressBar.classList.add('seeking');
    } else {
      this.progressBar.classList.remove('seeking');
    }
    
    // Update buffer bar if buffer information is available
    if (this.videoPlayer && this.videoPlayer.video) {
      const video = this.videoPlayer.video;
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / this._duration) * 100;
        this.bufferBar.style.width = `${bufferedPercent}%`;
      }
    }
  }
  
  _updateTimeDisplay() {
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    
    const currentTimeFormatted = formatTime(this._currentTime);
    const durationFormatted = formatTime(this._duration);
    
    this.timeDisplay.textContent = `${currentTimeFormatted} / ${durationFormatted}`;
  }
  
  _updateVolumeControls() {
    // Check if we need to recreate the controls
    if (this._ensureControlsExist()) {
      console.log('Controls recreated, deferring update');
      return;
    }
    
    if (!this.videoPlayer || !this.videoPlayer.video) {
      return;
    }
    
    const video = this.videoPlayer.video;
    
    // Update volume slider value
    if (this.volumeSlider) {
      this.volumeSlider.value = video.muted ? 0 : video.volume;
      
      // Create or update volume level indicator
      if (!this.volumeLevel) {
        // Find the volume slider container
        const volumeContainer = this.volumeSlider.closest('.volume-slider-container');
        if (!volumeContainer) {
          console.error('Volume slider container not found');
          return;
        }
        
        // Create the volume level indicator
        this.volumeLevel = document.createElement('div');
        this.volumeLevel.className = 'volume-level';
        
        // Insert the volume level into the container
        volumeContainer.appendChild(this.volumeLevel);
      }
      
      // Update volume level width based on current volume
      const volumePercentage = video.muted ? 0 : (video.volume * 100);
      this.volumeLevel.style.width = `${volumePercentage}%`;
    }
    
    // Update mute button icons
    if (this.volumeIcon && this.muteIcon) {
      if (video.muted || video.volume === 0) {
        this.volumeIcon.style.display = 'none';
        this.muteIcon.style.display = 'block';
      } else {
        this.volumeIcon.style.display = 'block';
        this.muteIcon.style.display = 'none';
      }
    }
  }
  
  _updateDarkMode() {
    // Update the component's dark mode class
    if (this._darkMode) {
      this.classList.add('dark-mode');
    } else {
      this.classList.remove('dark-mode');
    }
    
    // Update the dark mode icon
    if (this.lightIcon && this.darkIcon) {
      if (this._darkMode) {
        this.lightIcon.style.display = 'none';
        this.darkIcon.style.display = 'block';
      } else {
        this.lightIcon.style.display = 'block';
        this.darkIcon.style.display = 'none';
      }
    }
  }
  
  /**
   * Skip forward by 10 seconds
   */
  _onSkipForwardClick() {
    console.log('[VideoControls] Skip forward button clicked');
    
    // Try to find the video player if not already available
    if (!this.videoPlayer) {
      this._findVideoPlayer();
    }
    
    if (!this.videoPlayer) {
      console.error('[VideoControls] Cannot skip: No video player found');
      return;
    }
    
    // Direct fallback approach - get the video element and set time directly
    const video = this.videoPlayer.querySelector('video') || this.videoPlayer.video;
    if (!video) {
      console.error('[VideoControls] Cannot skip: No video element found');
      return;
    }
    
    try {
      // Get current time and calculate new time
      const currentTime = video.currentTime || 0;
      const skipAmount = 10;
      
      // Make sure we don't exceed the duration
      let newTime = currentTime + skipAmount;
      if (video.duration && !isNaN(video.duration)) {
        newTime = Math.min(newTime, video.duration);
      }
      
      // Check if video is seekable
      const isSeekable = video.seekable && video.seekable.length > 0 && 
                         video.seekable.end(0) > 0 && 
                         newTime <= video.seekable.end(0);
      
      console.log('[VideoControls] Seekable range:', 
                 video.seekable && video.seekable.length > 0 ? 
                 `${video.seekable.start(0)} - ${video.seekable.end(0)}` : 'Not available');
      
      // Check if video is ready for seeking
      if (video.readyState >= 2 && isSeekable) {
        // Set the new time directly on the video element
        video.currentTime = newTime;
        console.log('[VideoControls] After skip - New time set to:', newTime);
        
        // Force UI update
        this._currentTime = newTime;
        this._updateProgressBar();
        this._updateTimeDisplay();
      } else {
        // If video is not ready, wait for it to be seekable
        console.log('[VideoControls] Video not ready for seeking, waiting for it to be seekable...');
        
        // Function to attempt seeking when the video becomes seekable
        const attemptSeek = () => {
          // Check if the video is now seekable to our target time
          const nowSeekable = video.seekable && video.seekable.length > 0 && 
                             video.seekable.end(0) > 0 && 
                             newTime <= video.seekable.end(0);
          
          if (video.readyState >= 2 && nowSeekable) {
            // Video is now seekable, set the time
            video.currentTime = newTime;
            console.log('[VideoControls] Delayed seek - New time set to:', newTime);
            
            // Force UI update
            this._currentTime = newTime;
            this._updateProgressBar();
            this._updateTimeDisplay();
            
            // Clean up event listeners
            video.removeEventListener('canplay', attemptSeek);
            video.removeEventListener('loadedmetadata', attemptSeek);
            video.removeEventListener('seeked', attemptSeek);
            clearInterval(seekableCheckInterval);
          }
        };
        
        // Add event listeners for various video loading events
        video.addEventListener('canplay', attemptSeek);
        video.addEventListener('loadedmetadata', attemptSeek);
        video.addEventListener('seeked', attemptSeek);
        
        // Also check periodically in case events don't fire
        const seekableCheckInterval = setInterval(() => {
          const nowSeekable = video.seekable && video.seekable.length > 0 && 
                             video.seekable.end(0) > 0 && 
                             newTime <= video.seekable.end(0);
          
          console.log('[VideoControls] Checking seekable range:', 
                     video.seekable && video.seekable.length > 0 ? 
                     `${video.seekable.start(0)} - ${video.seekable.end(0)}` : 'Not available');
          
          if (video.readyState >= 2 && nowSeekable) {
            // Video is now seekable, set the time
            video.currentTime = newTime;
            console.log('[VideoControls] Interval seek - New time set to:', newTime);
            
            // Force UI update
            this._currentTime = newTime;
            this._updateProgressBar();
            this._updateTimeDisplay();
            
            // Clean up event listeners
            video.removeEventListener('canplay', attemptSeek);
            video.removeEventListener('loadedmetadata', attemptSeek);
            video.removeEventListener('seeked', attemptSeek);
            clearInterval(seekableCheckInterval);
          }
        }, 500);
        
        // Clear the interval after 10 seconds to prevent memory leaks
        setTimeout(() => {
          clearInterval(seekableCheckInterval);
        }, 10000);
      }
    } catch (err) {
      console.error('[VideoControls] Error setting currentTime:', err);
    }
  }

  /**
   * Skip backward by 10 seconds
   */
  _onSkipBackwardClick() {
    console.log('[VideoControls] Skip backward button clicked');
    
    // Try to find the video player if not already available
    if (!this.videoPlayer) {
      this._findVideoPlayer();
    }
    
    if (!this.videoPlayer) {
      console.error('[VideoControls] Cannot skip: No video player found');
      return;
    }
    
    // Direct fallback approach - get the video element and set time directly
    const video = this.videoPlayer.querySelector('video') || this.videoPlayer.video;
    if (!video) {
      console.error('[VideoControls] Cannot skip: No video element found');
      return;
    }
    
    try {
      // Get current time and calculate new time
      const currentTime = video.currentTime || 0;
      const skipAmount = 10;
      
      // Make sure we don't go below 0
      const newTime = Math.max(currentTime - skipAmount, 0);
      
      // Check if video is seekable
      const isSeekable = video.seekable && video.seekable.length > 0 && 
                         video.seekable.end(0) > 0 && 
                         newTime <= video.seekable.end(0);
      
      console.log('[VideoControls] Seekable range:', 
                 video.seekable && video.seekable.length > 0 ? 
                 `${video.seekable.start(0)} - ${video.seekable.end(0)}` : 'Not available');
      
      // Check if video is ready for seeking
      if (video.readyState >= 2 && isSeekable) {
        // Set the new time directly on the video element
        video.currentTime = newTime;
        console.log('[VideoControls] After skip - New time set to:', newTime);
        
        // Force UI update
        this._currentTime = newTime;
        this._updateProgressBar();
        this._updateTimeDisplay();
      } else {
        // If video is not ready, wait for it to be seekable
        console.log('[VideoControls] Video not ready for seeking, waiting for it to be seekable...');
        
        // Function to attempt seeking when the video becomes seekable
        const attemptSeek = () => {
          // Check if the video is now seekable to our target time
          const nowSeekable = video.seekable && video.seekable.length > 0 && 
                             video.seekable.end(0) > 0 && 
                             newTime <= video.seekable.end(0);
          
          if (video.readyState >= 2 && nowSeekable) {
            // Video is now seekable, set the time
            video.currentTime = newTime;
            console.log('[VideoControls] Delayed seek - New time set to:', newTime);
            
            // Force UI update
            this._currentTime = newTime;
            this._updateProgressBar();
            this._updateTimeDisplay();
            
            // Clean up event listeners
            video.removeEventListener('canplay', attemptSeek);
            video.removeEventListener('loadedmetadata', attemptSeek);
            video.removeEventListener('seeked', attemptSeek);
            clearInterval(seekableCheckInterval);
          }
        };
        
        // Add event listeners for various video loading events
        video.addEventListener('canplay', attemptSeek);
        video.addEventListener('loadedmetadata', attemptSeek);
        video.addEventListener('seeked', attemptSeek);
        
        // Also check periodically in case events don't fire
        const seekableCheckInterval = setInterval(() => {
          const nowSeekable = video.seekable && video.seekable.length > 0 && 
                             video.seekable.end(0) > 0 && 
                             newTime <= video.seekable.end(0);
          
          console.log('[VideoControls] Checking seekable range:', 
                     video.seekable && video.seekable.length > 0 ? 
                     `${video.seekable.start(0)} - ${video.seekable.end(0)}` : 'Not available');
          
          if (video.readyState >= 2 && nowSeekable) {
            // Video is now seekable, set the time
            video.currentTime = newTime;
            console.log('[VideoControls] Interval seek - New time set to:', newTime);
            
            // Force UI update
            this._currentTime = newTime;
            this._updateProgressBar();
            this._updateTimeDisplay();
            
            // Clean up event listeners
            video.removeEventListener('canplay', attemptSeek);
            video.removeEventListener('loadedmetadata', attemptSeek);
            video.removeEventListener('seeked', attemptSeek);
            clearInterval(seekableCheckInterval);
          }
        }, 500);
        
        // Clear the interval after 10 seconds to prevent memory leaks
        setTimeout(() => {
          clearInterval(seekableCheckInterval);
        }, 10000);
      }
    } catch (err) {
      console.error('[VideoControls] Error setting currentTime:', err);
    }
  }
  
  _handleMediaChanged(event) {
    console.log('Video controls detected media change:', event.detail);
    
    // Re-find the video player after media change
    setTimeout(() => {
      this._findVideoPlayer();
    }, 300);
  }
  
  // Make sure controls exist - if not, recreate them
  _ensureControlsExist() {
    // Check if we have all the critical elements
    const hasMissingElements = this._refreshCache();
    
    if (hasMissingElements) {
      console.warn('Missing critical UI elements - recreating controls');
      
      // Recreate the entire UI
      this._renderWithDefaultStyles();
      
      // Re-initialize event listeners
      setTimeout(() => {
        this._refreshCache();
        this._initializeEventListeners();
      }, 100);
      
      return true;
    }
    
    return false;
  }
  
  _onProgressHover(event) {
    if (!this.progressContainer || !this.videoPlayer || !this.videoPlayer.video) return;
    
    const rect = this.progressContainer.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const time = position * (this.videoPlayer.video.duration || 0);
    
    // Store the hover position and time for click handler to use
    this._hoverPosition = position;
    this._hoverTime = time;
    
    // Show hover time at the cursor position
    if (!this.hoverTime) {
      this.hoverTime = document.createElement('div');
      this.hoverTime.className = 'hover-time';
      this.progressContainer.appendChild(this.hoverTime);
    }
    
    // Set the hover time position and content
    this.hoverTime.style.display = 'block';
    this.hoverTime.style.left = `${event.clientX - rect.left}px`;
    this.hoverTime.textContent = this._formatTime(time);
  }
  
  _onProgressLeave() {
    if (this.hoverTime) {
      this.hoverTime.style.display = 'none';
    }
  }
  
  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}

customElements.define('video-controls', VideoControls); 