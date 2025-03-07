class VideoPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default state
    this._src = '';
    this._format = 'mp4';
    this._quality = 'hq';
    this._isPlaying = false;
    
    this.render();
  }
  
  static get observedAttributes() {
    return ['src', 'format', 'quality', 'poster'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'src':
        this._src = newValue;
        this._updateVideoSource();
        break;
      case 'format':
        this._format = newValue;
        this._updateVideoSource();
        break;
      case 'quality':
        this._quality = newValue;
        this._updateVideoSource();
        break;
      case 'poster':
        if (this.video) this.video.poster = newValue;
        break;
    }
  }
  
  connectedCallback() {
    // Initialize event listeners once the element is in the DOM
    this._initializeEventListeners();
    
    // Dispatch ready event
    this.dispatchEvent(new CustomEvent('video-player-ready', {
      bubbles: true,
      composed: true
    }));
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
        max-width: 100%;
        position: relative;
        aspect-ratio: 16/9;
        background-color: #000;
        overflow: hidden;
      }
      
      .video-container {
        width: 100%;
        height: 100%;
        position: relative;
      }
      
      video {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      
      ::slotted(video-controls) {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .video-container:hover ::slotted(video-controls) {
        opacity: 1;
      }
      
      @media (max-width: 768px) {
        :host {
          aspect-ratio: auto;
          height: 50vh;
        }
      }
    `;
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="video-container">
        <video 
          id="video" 
          preload="metadata"
          playsinline
        ></video>
        <slot></slot>
      </div>
    `;
    
    this.video = this.shadowRoot.getElementById('video');
    this._updateVideoSource();
  }
  
  _updateVideoSource() {
    if (!this.video || !this._src) return;
    
    // Handle both online and local sources
    const isUrl = this._src.startsWith('http') || this._src.startsWith('//');
    
    if (isUrl) {
      this.video.src = this._src;
    } else {
      // For local files served from our asset server
      this.video.src = `http://localhost:1212/assets/videos/${this._src}.${this._format}`;
    }
    
    // Load the video
    this.video.load();
  }
  
  _initializeEventListeners() {
    if (!this.video) return;
    
    // Listen for play/pause events to update state
    this.video.addEventListener('play', () => {
      this._isPlaying = true;
      this._notifyStateChange();
    });
    
    this.video.addEventListener('pause', () => {
      this._isPlaying = false;
      this._notifyStateChange();
    });
    
    this.video.addEventListener('timeupdate', () => {
      this._notifyStateChange();
    });
    
    this.video.addEventListener('volumechange', () => {
      this._notifyStateChange();
    });
    
    this.video.addEventListener('loadedmetadata', () => {
      this._notifyStateChange();
    });
  }
  
  _removeEventListeners() {
    // Clean up event listeners if needed
  }
  
  _notifyStateChange() {
    // Dispatch an event with the current state
    this.dispatchEvent(new CustomEvent('video-state-change', {
      bubbles: true,
      composed: true,
      detail: {
        isPlaying: this._isPlaying,
        currentTime: this.video.currentTime,
        duration: this.video.duration,
        volume: this.video.volume,
        muted: this.video.muted,
        playbackRate: this.video.playbackRate
      }
    }));
  }
  
  // Public API methods
  play() {
    if (this.video) this.video.play();
  }
  
  pause() {
    if (this.video) this.video.pause();
  }
  
  togglePlay() {
    if (this.video) {
      if (this._isPlaying) {
        this.video.pause();
      } else {
        this.video.play();
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
    if (this.video) this.video.muted = !this.video.muted;
  }
  
  seek(time) {
    if (this.video) this.video.currentTime = time;
  }
  
  setPlaybackRate(rate) {
    if (this.video) this.video.playbackRate = rate;
  }
  
  requestFullscreen() {
    if (this.video) {
      if (this.video.requestFullscreen) {
        this.video.requestFullscreen();
      } else if (this.video.webkitRequestFullscreen) {
        this.video.webkitRequestFullscreen();
      } else if (this.video.msRequestFullscreen) {
        this.video.msRequestFullscreen();
      }
    }
  }
}

customElements.define('video-player', VideoPlayer); 