class PlayPauseButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isPlaying = false;
    this._initialized = false;
    this._isUpdating = false;
    this._render();
  }

  static get observedAttributes() {
    return ['playing', 'dark-mode'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._initialized || oldValue === newValue) return;
    
    switch (name) {
      case 'playing':
        if (!this._isUpdating) {
          this._isPlaying = newValue !== null;
          this._updateButtonUI();
        }
        break;
      case 'dark-mode':
        // This is for styling only, no need to trigger UI updates
        break;
    }
  }

  connectedCallback() {
    this._initialized = true;
    this._initializeEventListeners();
    this._updateButtonUI();
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          --icon-color: #fff;
          --hover-bg: rgba(255, 255, 255, 0.2);
        }
        
        :host([dark-mode]) {
          --icon-color: #fff;
          --hover-bg: rgba(255, 255, 255, 0.2);
        }
        
        /* Inherit colors from parent if set */
        :host {
          --icon-color: var(--icon-color, #fff);
        }
        
        :host([dark-mode]) {
          --icon-color: var(--icon-color, #fff);
        }
        
        .play-pause-button {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        
        .play-pause-button:hover {
          background-color: var(--hover-bg);
        }
        
        .play-pause-button:active {
          transform: scale(0.95);
        }
        
        .play-icon, .pause-icon {
          width: 24px;
          height: 24px;
          fill: #fff;
        }
        
        .play-icon {
          display: block;
        }
        
        .pause-icon {
          display: none;
        }
        
        :host([playing]) .play-icon {
          display: none;
        }
        
        :host([playing]) .pause-icon {
          display: block;
        }
      </style>
      
      <button class="play-pause-button" aria-label="Play/Pause">
        <svg class="play-icon" viewBox="0 0 24 24">
          <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
        </svg>
        <svg class="pause-icon" viewBox="0 0 24 24">
          <path d="M14,19H18V5H14M6,19H10V5H6V19Z" />
        </svg>
      </button>
    `;

    // Cache DOM elements
    this.button = this.shadowRoot.querySelector('.play-pause-button');
    this.playIcon = this.shadowRoot.querySelector('.play-icon');
    this.pauseIcon = this.shadowRoot.querySelector('.pause-icon');
  }

  _initializeEventListeners() {
    this.button.addEventListener('click', this._onButtonClick.bind(this));
  }

  _removeEventListeners() {
    this.button.removeEventListener('click', this._onButtonClick.bind(this));
  }

  _onButtonClick() {
    console.log('PlayPauseButton: Button clicked, current playing state:', this._isPlaying);
    this.toggle();
  }

  _updateButtonUI() {
    if (this._isUpdating) return;
    
    this._isUpdating = true;
    console.log('PlayPauseButton: Updating UI, isPlaying:', this._isPlaying);
    
    if (this._isPlaying) {
      this.setAttribute('playing', '');
    } else {
      this.removeAttribute('playing');
    }
    
    this._isUpdating = false;
  }

  _updateTheme(isDarkMode) {
    if (isDarkMode) {
      this.setAttribute('dark-mode', '');
    } else {
      this.removeAttribute('dark-mode');
    }
  }

  _dispatchPlayPauseEvent() {
    const eventName = this._isPlaying ? 'play' : 'pause';
    console.log(`PlayPauseButton: Dispatching ${eventName} event, playing=${this._isPlaying}`);
    const event = new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail: { playing: this._isPlaying }
    });
    this.dispatchEvent(event);
  }

  // Public API
  get playing() {
    return this._isPlaying;
  }
  
  set playing(value) {
    const newValue = Boolean(value);
    console.log('PlayPauseButton: Setting playing to:', newValue, 'current:', this._isPlaying);
    if (this._isPlaying !== newValue) {
      this._isPlaying = newValue;
      this._updateButtonUI();
    }
  }
  
  play() {
    if (!this._isPlaying) {
      this._isPlaying = true;
      this._updateButtonUI();
      this._dispatchPlayPauseEvent();
    }
  }
  
  pause() {
    if (this._isPlaying) {
      this._isPlaying = false;
      this._updateButtonUI();
      this._dispatchPlayPauseEvent();
    }
  }
  
  toggle() {
    this._isPlaying = !this._isPlaying;
    this._updateButtonUI();
    this._dispatchPlayPauseEvent();
  }
}

customElements.define('play-pause-button', PlayPauseButton); 