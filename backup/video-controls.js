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
    
    this.render();
  }
  
  connectedCallback() {
    // Find the parent video player
    this._findVideoPlayer();
    
    // Initialize event listeners
    this._initializeEventListeners();
  }
  
  disconnectedCallback() {
    // Clean up event listeners
    this._removeEventListeners();
  }
  
  render() {
    const styles = `
      :host {
        display: block;
        width: 100%;
        background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
        padding: 10px;
        box-sizing: border-box;
        color: white;
        font-family: Arial, sans-serif;
      }
      
      .controls-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .progress-container {
        width: 100%;
        height: 5px;
        background-color: rgba(255,255,255,0.2);
        border-radius: 2.5px;
        cursor: pointer;
        position: relative;
      }
      
      .progress-bar {
        height: 100%;
        background-color: #f00;
        border-radius: 2.5px;
        width: 0%;
        transition: width 0.1s linear;
      }
      
      .controls-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .left-controls, .right-controls {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }
      
      button:hover {
        transform: scale(1.1);
      }
      
      .volume-container {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .volume-slider {
        width: 60px;
        height: 5px;
        -webkit-appearance: none;
        background-color: rgba(255,255,255,0.2);
        border-radius: 2.5px;
        outline: none;
      }
      
      .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: white;
        cursor: pointer;
      }
      
      .time-display {
        font-size: 12px;
        min-width: 80px;
      }
      
      .playback-rate-menu {
        position: relative;
      }
      
      .playback-rate-button {
        font-size: 12px;
        padding: 0 5px;
        width: auto;
      }
      
      .playback-rate-options {
        position: absolute;
        bottom: 100%;
        right: 0;
        background-color: rgba(0,0,0,0.8);
        border-radius: 4px;
        padding: 5px 0;
        display: none;
        flex-direction: column;
        min-width: 80px;
      }
      
      .playback-rate-options.show {
        display: flex;
      }
      
      .rate-option {
        padding: 5px 10px;
        cursor: pointer;
        text-align: center;
      }
      
      .rate-option:hover {
        background-color: rgba(255,255,255,0.1);
      }
      
      @media (max-width: 768px) {
        .volume-slider {
          width: 40px;
        }
        
        .time-display {
          min-width: 60px;
          font-size: 10px;
        }
      }
    `;
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="controls-container">
        <div class="progress-container" id="progress-container">
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
                <div class="rate-option" data-rate="0.5">0.5x</div>
                <div class="rate-option" data-rate="0.75">0.75x</div>
                <div class="rate-option" data-rate="1">1x</div>
                <div class="rate-option" data-rate="1.25">1.25x</div>
                <div class="rate-option" data-rate="1.5">1.5x</div>
                <div class="rate-option" data-rate="2">2x</div>
              </div>
            </div>
            <button id="fullscreen-btn" aria-label="Fullscreen">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Cache DOM elements
    this.progressContainer = this.shadowRoot.getElementById('progress-container');
    this.progressBar = this.shadowRoot.getElementById('progress-bar');
    this.playPauseBtn = this.shadowRoot.getElementById('play-pause-btn');
    this.playIcon = this.shadowRoot.getElementById('play-icon');
    this.pauseIcon = this.shadowRoot.getElementById('pause-icon');
    this.muteBtn = this.shadowRoot.getElementById('mute-btn');
    this.volumeIcon = this.shadowRoot.getElementById('volume-icon');
    this.volumeLow = this.shadowRoot.getElementById('volume-low');
    this.volumeHigh = this.shadowRoot.getElementById('volume-high');
    this.muteLine = this.shadowRoot.getElementById('mute-line');
    this.volumeSlider = this.shadowRoot.getElementById('volume-slider');
    this.timeDisplay = this.shadowRoot.getElementById('time-display');
    this.fullscreenBtn = this.shadowRoot.getElementById('fullscreen-btn');
    this.playbackRateBtn = this.shadowRoot.getElementById('playback-rate-btn');
    this.playbackRateOptions = this.shadowRoot.getElementById('playback-rate-options');
  }
  
  _findVideoPlayer() {
    // Find the parent video player component
    this.videoPlayer = this.closest('video-player');
    
    if (!this.videoPlayer) {
      console.error('video-controls must be a child of video-player');
    }
  }
  
  _initializeEventListeners() {
    if (!this.videoPlayer) return;
    
    // Listen for video state changes
    this.videoPlayer.addEventListener('video-state-change', (e) => {
      this._updateControlsState(e.detail);
    });
    
    // Play/Pause button
    this.playPauseBtn.addEventListener('click', () => {
      this.videoPlayer.togglePlay();
    });
    
    // Mute button
    this.muteBtn.addEventListener('click', () => {
      this.videoPlayer.toggleMute();
    });
    
    // Volume slider
    this.volumeSlider.addEventListener('input', () => {
      this.videoPlayer.setVolume(parseFloat(this.volumeSlider.value));
    });
    
    // Progress bar
    this.progressContainer.addEventListener('click', (e) => {
      const rect = this.progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const seekTime = pos * this._duration;
      this.videoPlayer.seek(seekTime);
    });
    
    // Fullscreen button
    this.fullscreenBtn.addEventListener('click', () => {
      this.videoPlayer.requestFullscreen();
    });
    
    // Playback rate menu
    this.playbackRateBtn.addEventListener('click', () => {
      this.playbackRateOptions.classList.toggle('show');
    });
    
    // Playback rate options
    this.playbackRateOptions.querySelectorAll('.rate-option').forEach(option => {
      option.addEventListener('click', () => {
        const rate = parseFloat(option.dataset.rate);
        this.videoPlayer.setPlaybackRate(rate);
        this.playbackRateOptions.classList.remove('show');
      });
    });
    
    // Close playback rate menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.playbackRateBtn.contains(e.target) && !this.playbackRateOptions.contains(e.target)) {
        this.playbackRateOptions.classList.remove('show');
      }
    });
  }
  
  _removeEventListeners() {
    // Clean up event listeners if needed
  }
  
  _updateControlsState(state) {
    // Update internal state
    this._isPlaying = state.isPlaying;
    this._currentTime = state.currentTime;
    this._duration = state.duration;
    this._volume = state.volume;
    this._muted = state.muted;
    this._playbackRate = state.playbackRate;
    
    // Update UI
    this._updatePlayPauseButton();
    this._updateProgressBar();
    this._updateTimeDisplay();
    this._updateVolumeControls();
    this._updatePlaybackRateDisplay();
  }
  
  _updatePlayPauseButton() {
    if (this._isPlaying) {
      this.playIcon.style.display = 'none';
      this.pauseIcon.style.display = 'block';
      this.playPauseBtn.setAttribute('aria-label', 'Pause');
    } else {
      this.playIcon.style.display = 'block';
      this.pauseIcon.style.display = 'none';
      this.playPauseBtn.setAttribute('aria-label', 'Play');
    }
  }
  
  _updateProgressBar() {
    if (this._duration) {
      const progress = (this._currentTime / this._duration) * 100;
      this.progressBar.style.width = `${progress}%`;
    } else {
      this.progressBar.style.width = '0%';
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
    this.volumeSlider.value = this._volume;
    
    if (this._muted || this._volume === 0) {
      this.volumeIcon.style.display = 'block';
      this.volumeLow.style.display = 'none';
      this.volumeHigh.style.display = 'none';
      this.muteLine.style.display = 'block';
    } else if (this._volume < 0.5) {
      this.volumeIcon.style.display = 'block';
      this.volumeLow.style.display = 'block';
      this.volumeHigh.style.display = 'none';
      this.muteLine.style.display = 'none';
    } else {
      this.volumeIcon.style.display = 'block';
      this.volumeLow.style.display = 'block';
      this.volumeHigh.style.display = 'block';
      this.muteLine.style.display = 'none';
    }
  }
  
  _updatePlaybackRateDisplay() {
    this.playbackRateBtn.textContent = `${this._playbackRate}x`;
  }
}

customElements.define('video-controls', VideoControls); 