class VolumeSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._volume = 1.0;
    this._muted = false;
    this._initialized = false;
    this._render();
  }

  static get observedAttributes() {
    return ['volume', 'muted', 'dark-mode'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'volume':
        this._volume = parseFloat(newValue) || 1.0;
        this._updateVolumeUI();
        break;
      case 'muted':
        this._muted = newValue !== null && newValue !== 'false';
        this._updateVolumeUI();
        break;
      case 'dark-mode':
        this._updateTheme(newValue === 'true');
        break;
    }
  }

  connectedCallback() {
    if (!this._initialized) {
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
          display: inline-flex;
          position: relative;
          align-items: center;
          min-width: 120px;
          --icon-color: #fff;
          --slider-color: #3498db;
          --slider-bg: #555;
          --hover-bg: rgba(255, 255, 255, 0.2);
        }
        
        :host([dark-mode]) {
          --icon-color: #fff;
          --slider-bg: #555;
          --hover-bg: rgba(255, 255, 255, 0.2);
        }
        
        /* Inherit colors from parent if set */
        :host {
          --icon-color: var(--icon-color, #fff);
          --slider-color: var(--primary-color, #3498db);
        }
        
        :host([dark-mode]) {
          --icon-color: var(--icon-color, #fff);
        }
        
        .volume-container {
          display: flex;
          align-items: center;
          position: relative;
          width: 100%;
          height: 40px;
        }
        
        .volume-button {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
          min-width: 40px;
          min-height: 40px;
          flex: 0 0 auto;
        }
        
        .volume-button:hover {
          background-color: var(--hover-bg);
        }
        
        .volume-icon, .mute-icon {
          width: 24px;
          height: 24px;
          fill: #fff;
        }
        
        .volume-icon {
          display: block;
        }
        
        .mute-icon {
          display: none;
        }
        
        :host([muted]) .volume-icon {
          display: none;
        }
        
        :host([muted]) .mute-icon {
          display: block;
        }
        
        .volume-slider-container {
          position: relative;
          width: 80px;
          height: 40px;
          display: flex;
          align-items: center;
          padding: 0 10px;
        }
        
        .volume-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: var(--slider-bg);
          outline: none;
        }
        
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--slider-color);
          cursor: pointer;
        }
        
        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--slider-color);
          cursor: pointer;
          border: none;
        }
      </style>
      
      <div class="volume-container">
        <button class="volume-button" aria-label="Mute/Unmute">
          <svg class="volume-icon" viewBox="0 0 24 24">
            <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
          </svg>
          <svg class="mute-icon" viewBox="0 0 24 24">
            <path d="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z" />
          </svg>
        </button>
        
        <div class="volume-slider-container">
          <input type="range" min="0" max="1" step="0.01" value="${this._volume}" class="volume-slider">
        </div>
      </div>
    `;

    // Cache DOM elements
    this.volumeContainer = this.shadowRoot.querySelector('.volume-container');
    this.volumeButton = this.shadowRoot.querySelector('.volume-button');
    this.volumeIcon = this.shadowRoot.querySelector('.volume-icon');
    this.muteIcon = this.shadowRoot.querySelector('.mute-icon');
    this.volumeSlider = this.shadowRoot.querySelector('.volume-slider');
    this.volumeSliderContainer = this.shadowRoot.querySelector('.volume-slider-container');
  }

  _initializeEventListeners() {
    this.volumeButton.addEventListener('click', this._onMuteClick.bind(this));
    this.volumeSlider.addEventListener('input', this._onVolumeChange.bind(this));
    this.volumeSlider.addEventListener('change', this._onVolumeChangeEnd.bind(this));
    
    // Touch events for mobile support
    this.volumeSlider.addEventListener('touchstart', this._onVolumeSliderTouch.bind(this));
    this.volumeSlider.addEventListener('touchend', this._onVolumeChangeEnd.bind(this));
  }

  _removeEventListeners() {
    this.volumeButton.removeEventListener('click', this._onMuteClick.bind(this));
    this.volumeSlider.removeEventListener('input', this._onVolumeChange.bind(this));
    this.volumeSlider.removeEventListener('change', this._onVolumeChangeEnd.bind(this));
    this.volumeSlider.removeEventListener('touchstart', this._onVolumeSliderTouch.bind(this));
    this.volumeSlider.removeEventListener('touchend', this._onVolumeChangeEnd.bind(this));
  }

  _onMuteClick() {
    console.log('VolumeSlider: Mute button clicked, current muted state:', this._muted);
    this._muted = !this._muted;
    this._updateVolumeUI();
    this._dispatchVolumeEvent();
  }

  _onVolumeChange(e) {
    this._volume = parseFloat(e.target.value);
    this._muted = this._volume === 0;
    this._updateVolumeUI();
    this._dispatchVolumeEvent();
  }

  _onVolumeChangeEnd() {
    // Additional event for when the user finishes changing the volume
    this._dispatchVolumeEvent('volume-change-end');
  }

  _onVolumeSliderTouch() {
    // Show the volume slider when touched on mobile
    this.volumeSliderContainer.classList.add('active');
    
    // Remove the active class after a delay
    setTimeout(() => {
      this.volumeSliderContainer.classList.remove('active');
    }, 3000);
  }

  _updateVolumeUI() {
    console.log('VolumeSlider: Updating UI, volume:', this._volume, 'muted:', this._muted);
    
    if (!this.volumeSlider) return;
    
    // Update slider value
    this.volumeSlider.value = this._muted ? 0 : this._volume;
    
    // Update muted attribute
    if (this._muted) {
      this.setAttribute('muted', '');
    } else {
      this.removeAttribute('muted');
    }
  }

  _updateTheme(isDarkMode) {
    if (isDarkMode) {
      this.setAttribute('dark-mode', '');
    } else {
      this.removeAttribute('dark-mode');
    }
  }

  _dispatchVolumeEvent(eventName = 'volume-change') {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail: {
        volume: this._muted ? 0 : this._volume,
        muted: this._muted
      }
    });
    this.dispatchEvent(event);
  }

  // Public API
  get volume() {
    return this._volume;
  }
  
  set volume(value) {
    this._volume = Math.max(0, Math.min(1, parseFloat(value) || 0));
    this.setAttribute('volume', this._volume);
  }
  
  get muted() {
    return this._muted;
  }
  
  set muted(value) {
    this._muted = Boolean(value);
    this.setAttribute('muted', this._muted);
  }
}

customElements.define('volume-slider', VolumeSlider); 