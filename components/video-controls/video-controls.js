// VideoControls component - manages the video player controls
class VideoControls extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._currentTime = 0;
    this._duration = 0;
    this._buffered = 0;
    this._volume = 1;
    this._muted = false;
    this._playing = false;
    this._playbackRate = 1;
    this._isDarkMode = false;
    this._initialized = false;
    this._render();
  }

  static get observedAttributes() {
    return ['dark-mode'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'dark-mode') {
      this._isDarkMode = newValue !== null && newValue !== 'false';
      this._updateDarkMode();
    }
  }

  connectedCallback() {
    if (!this._initialized) {
      this._findVideoPlayer();
      this._initializeEventListeners();
      this._initialized = true;
    }
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          padding: 10px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 4px;
          color: white;
          width: 100%;
          box-sizing: border-box;
          z-index: 100;
        }

        .controls-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 10px;
        }

        .seek-bar-container {
          width: 100%;
          margin-bottom: 5px;
        }

        .controls-row {
          display: flex;
          align-items: center;
          width: 100%;
          height: 40px;
        }

        .controls-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .controls-group.left {
          margin-right: auto;
        }

        .controls-group.right {
          margin-left: auto;
        }

        .time-display {
          font-size: 14px;
          font-family: monospace;
          color: white;
          user-select: none;
          display: inline-block;
          margin: 0 10px;
          min-width: 100px;
          text-align: center;
        }

        play-pause-button,
        seek-button,
        fullscreen-button,
        dark-mode-toggle {
          min-width: 40px;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        volume-slider {
          min-width: 100px;
          height: 40px;
        }

        speed-control {
          min-width: 80px;
          height: 40px;
        }

        /* Media queries for responsive design */
        @media (max-width: 768px) {
          :host {
            padding: 8px;
          }

          .controls-row {
            flex-wrap: wrap;
            gap: 10px;
          }

          .controls-group {
            gap: 5px;
          }

          .controls-group.right {
            margin-left: 0;
          }

          .time-display {
            font-size: 12px;
            min-width: 80px;
          }

          volume-slider {
            min-width: 80px;
          }
        }
      </style>

      <div class="controls-container">
        <div class="seek-bar-container">
          <seek-bar></seek-bar>
        </div>

        <div class="controls-row">
          <div class="controls-group left">
            <seek-button direction="backward" seek-time="10"></seek-button>
            <play-pause-button></play-pause-button>
            <seek-button direction="forward" seek-time="10"></seek-button>
            <volume-slider></volume-slider>
            <span class="time-display">0:00 / 0:00</span>
          </div>

          <div class="controls-group right">
            <speed-control></speed-control>
            <dark-mode-toggle></dark-mode-toggle>
            <fullscreen-button></fullscreen-button>
          </div>
        </div>
      </div>
    `;

    // Cache elements
    this.playPauseButton = this.shadowRoot.querySelector('play-pause-button');
    this.seekBackward = this.shadowRoot.querySelector('seek-button[direction="backward"]');
    this.seekForward = this.shadowRoot.querySelector('seek-button[direction="forward"]');
    this.seekBar = this.shadowRoot.querySelector('seek-bar');
    this.timeDisplay = this.shadowRoot.querySelector('.time-display');
    this.volumeSlider = this.shadowRoot.querySelector('volume-slider');
    this.speedControl = this.shadowRoot.querySelector('speed-control');
    this.darkModeToggle = this.shadowRoot.querySelector('dark-mode-toggle');
    this.fullscreenButton = this.shadowRoot.querySelector('fullscreen-button');

    // Set up event listeners
    this._setupEventListeners();
    
    // Initialize time display
    this._updateTimeDisplay();
  }

  _setupEventListeners() {
    // Play/Pause events
    this.playPauseButton.addEventListener('play', () => {
      this.dispatchEvent(new CustomEvent('play'));
    });

    this.playPauseButton.addEventListener('pause', () => {
      this.dispatchEvent(new CustomEvent('pause'));
    });

    // Seek events
    this.seekBackward.addEventListener('seek', (e) => {
      this.dispatchEvent(new CustomEvent('seek', {
        detail: { direction: 'backward', time: e.detail.seekTime }
      }));
    });

    this.seekForward.addEventListener('seek', (e) => {
      this.dispatchEvent(new CustomEvent('seek', {
        detail: { direction: 'forward', time: e.detail.seekTime }
      }));
    });

    // Seek bar events
    this.seekBar.addEventListener('seek', (e) => {
      this.dispatchEvent(new CustomEvent('seek-to', {
        detail: { currentTime: e.detail.currentTime }
      }));
    });
    
    // Volume events
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('volume-change', (e) => {
        this.dispatchEvent(new CustomEvent('volume-change', {
          detail: { volume: e.detail.volume }
        }));
      });
    }
    
    // Speed events
    if (this.speedControl) {
      this.speedControl.addEventListener('speed-change', (e) => {
        this.dispatchEvent(new CustomEvent('speed-change', {
          detail: { speed: e.detail.speed }
        }));
      });
    }
    
    // Fullscreen events
    if (this.fullscreenButton) {
      this.fullscreenButton.addEventListener('fullscreen-change', () => {
        this.dispatchEvent(new CustomEvent('fullscreen-change'));
      });
    }
    
    // Dark mode events
    if (this.darkModeToggle) {
      this.darkModeToggle.addEventListener('toggle', (e) => {
        this.dispatchEvent(new CustomEvent('dark-mode-change', {
          detail: { darkMode: e.detail.active }
        }));
      });
    }
  }

  _findVideoPlayer() {
    // First try: Direct parent element
    let parent = this.parentElement;
    if (parent && parent.tagName.toLowerCase() === 'video-player') {
      this.videoPlayer = parent;
      return;
    }
    
    // Second try: Look for video-player in the document
    const videoPlayer = document.querySelector('video-player');
    if (videoPlayer) {
      this.videoPlayer = videoPlayer;
      return;
    }
    
    console.error('VideoControls: No video player found');
  }

  _initializeEventListeners() {
    // Only add event listeners if we have a video player
    if (!this.videoPlayer) {
      console.error('Cannot initialize event listeners: no video player found');
      return;
    }
    
    // Listen for video player state changes
    this.videoPlayer.addEventListener('video-state-change', this._onVideoStateChange.bind(this));
    
    // Listen for sub-component events
    if (this.playPauseButton) {
      this.playPauseButton.addEventListener('play', this._onPlayClick.bind(this));
      this.playPauseButton.addEventListener('pause', this._onPauseClick.bind(this));
    }
    
    // Listen for seek button events
    if (this.seekBackward) {
      this.seekBackward.addEventListener('seek', this._onSeekBackward.bind(this));
    }
    
    if (this.seekForward) {
      this.seekForward.addEventListener('seek', this._onSeekForward.bind(this));
    }
    
    // Listen for seek bar events
    if (this.seekBar) {
      this.seekBar.addEventListener('seek', this._onSeek.bind(this));
      this.seekBar.addEventListener('seek-end', this._onSeekEnd.bind(this));
    }
    
    // Listen for volume slider events
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('volume-change', this._onVolumeChange.bind(this));
    }
    
    // Listen for speed control events
    if (this.speedControl) {
      this.speedControl.addEventListener('speed-change', this._onSpeedChange.bind(this));
    }
    
    // Listen for fullscreen button events
    if (this.fullscreenButton) {
      this.fullscreenButton.addEventListener('request-fullscreen', this._onFullscreenRequest.bind(this));
    }
    
    // Listen for dark mode toggle events
    if (this.darkModeToggle) {
      this.darkModeToggle.addEventListener('toggle', (e) => {
        this._isDarkMode = e.detail.active;
        this._updateDarkMode();
      });
    }
  }

  _removeEventListeners() {
    if (!this.videoPlayer) return;
    
    // Remove video player event listeners
    this.videoPlayer.removeEventListener('video-state-change', this._onVideoStateChange.bind(this));
    
    // Remove sub-component event listeners
    if (this.playPauseButton) {
      this.playPauseButton.removeEventListener('play', this._onPlayClick.bind(this));
      this.playPauseButton.removeEventListener('pause', this._onPauseClick.bind(this));
    }
    
    // Remove seek button event listeners
    if (this.seekBackward) {
      this.seekBackward.removeEventListener('seek', this._onSeekBackward.bind(this));
    }
    
    if (this.seekForward) {
      this.seekForward.removeEventListener('seek', this._onSeekForward.bind(this));
    }
    
    // Remove seek bar event listeners
    if (this.seekBar) {
      this.seekBar.removeEventListener('seek', this._onSeek.bind(this));
      this.seekBar.removeEventListener('seek-end', this._onSeekEnd.bind(this));
    }
    
    // Remove volume slider event listeners
    if (this.volumeSlider) {
      this.volumeSlider.removeEventListener('volume-change', this._onVolumeChange.bind(this));
    }
    
    // Remove speed control event listeners
    if (this.speedControl) {
      this.speedControl.removeEventListener('speed-change', this._onSpeedChange.bind(this));
    }
    
    // Remove fullscreen button event listeners
    if (this.fullscreenButton) {
      this.fullscreenButton.removeEventListener('request-fullscreen', this._onFullscreenRequest.bind(this));
    }
    
    // Remove dark mode toggle event listeners
    if (this.darkModeToggle) {
      this.darkModeToggle.removeEventListener('toggle');
    }
  }

  _onVideoStateChange(e) {
    const state = e.detail;
    console.log('VideoControls: Received video state change:', state);
    
    // Update time display and seek bar
    this._currentTime = state.currentTime || 0;
    this._duration = state.duration || 0;
    this._buffered = state.buffered || 0;
    
    // Update time display
    this._updateTimeDisplay();
    
    // Update seek bar
    if (this.seekBar) {
      this.seekBar.currentTime = this._currentTime;
      this.seekBar.duration = this._duration;
      this.seekBar.buffered = this._buffered;
    }
    
    // Update play/pause button
    this._playing = state.isPlaying;
    console.log('VideoControls: Setting play button state to:', this._playing);
    if (this.playPauseButton) {
      this.playPauseButton.playing = this._playing;
    }
    
    // Update volume slider
    if (this.volumeSlider) {
      this._volume = state.volume !== undefined ? state.volume : this._volume;
      this._muted = state.muted !== undefined ? state.muted : this._muted;
      this.volumeSlider.volume = this._volume;
      this.volumeSlider.muted = this._muted;
    }
    
    // Update playback rate
    if (this.speedControl) {
      this._playbackRate = state.playbackRate || this._playbackRate;
      this.speedControl.speed = this._playbackRate;
    }
  }

  _onPlayClick() {
    console.log('VideoControls: Play button clicked');
    if (this.videoPlayer) {
      console.log('VideoControls: Calling play() on video player');
      this.videoPlayer.play();
      
      // Update our internal state
      this._playing = true;
      
      // Update the play/pause button
      if (this.playPauseButton) {
        console.log('VideoControls: Updating play/pause button to playing=true');
        this.playPauseButton.playing = true;
      }
    }
  }

  _onPauseClick() {
    console.log('VideoControls: Pause button clicked');
    if (this.videoPlayer) {
      console.log('VideoControls: Calling pause() on video player');
      this.videoPlayer.pause();
      
      // Update our internal state
      this._playing = false;
      
      // Update the play/pause button
      if (this.playPauseButton) {
        console.log('VideoControls: Updating play/pause button to playing=false');
        this.playPauseButton.playing = false;
      }
    }
  }

  _onVolumeChange(e) {
    if (!this.videoPlayer) return;
    
    const { volume, muted } = e.detail;
    
    if (muted) {
      this.videoPlayer.mute();
    } else {
      this.videoPlayer.unmute();
      this.videoPlayer.setVolume(volume);
    }
  }

  _onSeek(e) {
    if (!this.videoPlayer) return;
    
    const { currentTime } = e.detail;
    this.videoPlayer.seek(currentTime);
  }

  _onSeekEnd(e) {
    if (!this.videoPlayer) return;
    
    const { currentTime } = e.detail;
    this.videoPlayer.seek(currentTime);
  }

  _onSpeedChange(e) {
    console.log('VideoControls: Speed change event received:', e.detail);
    if (this.videoPlayer) {
      const { speed } = e.detail;
      this._playbackRate = speed;
      
      // Set the playback rate on the video player
      console.log('VideoControls: Setting playback rate to:', speed);
      this.videoPlayer.setPlaybackRate(speed);
    }
  }

  _onFullscreenRequest() {
    if (this.videoPlayer) {
      this.videoPlayer.requestFullscreen();
    }
  }

  _onSeekBackward(e) {
    console.log('VideoControls: Seek backward event received:', e.detail);
    if (this.videoPlayer) {
      const { seconds } = e.detail;
      this.videoPlayer.seekBackward(seconds);
    }
  }

  _onSeekForward(e) {
    console.log('VideoControls: Seek forward event received:', e.detail);
    if (this.videoPlayer) {
      const { seconds } = e.detail;
      this.videoPlayer.seekForward(seconds);
    }
  }

  _updateTimeDisplay() {
    if (!this.timeDisplay) return;
    
    const currentTimeFormatted = this._formatTime(this._currentTime);
    const durationFormatted = this._formatTime(this._duration);
    
    this.timeDisplay.textContent = `${currentTimeFormatted} / ${durationFormatted}`;
  }

  _updateDarkMode() {
    // Update dark mode for all sub-components
    if (this.playPauseButton) this.playPauseButton.setAttribute('dark-mode', this._isDarkMode);
    if (this.seekBackward) this.seekBackward.setAttribute('dark-mode', this._isDarkMode);
    if (this.seekForward) this.seekForward.setAttribute('dark-mode', this._isDarkMode);
    if (this.seekBar) this.seekBar.setAttribute('dark-mode', this._isDarkMode);
    if (this.volumeSlider) this.volumeSlider.setAttribute('dark-mode', this._isDarkMode);
    if (this.speedControl) this.speedControl.setAttribute('dark-mode', this._isDarkMode);
    if (this.fullscreenButton) this.fullscreenButton.setAttribute('dark-mode', this._isDarkMode);
    
    // For dark mode toggle, we need to set the active attribute
    if (this.darkModeToggle) {
      if (this._isDarkMode) {
        this.darkModeToggle.setAttribute('active', '');
        this.darkModeToggle.setAttribute('dark-mode', 'true');
      } else {
        this.darkModeToggle.removeAttribute('active');
        this.darkModeToggle.removeAttribute('dark-mode');
      }
    }
  }

  _formatTime(seconds) {
    seconds = Math.max(0, seconds);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Public methods to control the UI state
  setPlaying(isPlaying) {
    this.playPauseButton.playing = isPlaying;
  }

  setProgress(progress) {
    this.seekBar.progress = progress;
  }

  setVolume(volume) {
    this.volumeSlider.volume = volume;
  }

  setSpeed(speed) {
    this.speedControl.speed = speed;
  }

  setFullscreen(isFullscreen) {
    this.fullscreenButton.fullscreen = isFullscreen;
  }
}

customElements.define('video-controls', VideoControls); 