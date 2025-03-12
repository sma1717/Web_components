class FullscreenButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isFullscreen = false;
    this._initialized = false;
    this._render();
  }

  static get observedAttributes() {
    return ['fullscreen', 'dark-mode'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'fullscreen':
        this._isFullscreen = newValue !== null && newValue !== 'false';
        this._updateButtonUI();
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
    
    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', this._onFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this._onFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this._onFullscreenChange.bind(this));
    document.addEventListener('MSFullscreenChange', this._onFullscreenChange.bind(this));
  }

  disconnectedCallback() {
    this._removeEventListeners();
    
    // Remove fullscreen change listeners
    document.removeEventListener('fullscreenchange', this._onFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this._onFullscreenChange.bind(this));
    document.removeEventListener('mozfullscreenchange', this._onFullscreenChange.bind(this));
    document.removeEventListener('MSFullscreenChange', this._onFullscreenChange.bind(this));
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
        
        .fullscreen-button {
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
        
        .fullscreen-button:hover {
          background-color: var(--hover-bg);
        }
        
        .fullscreen-button:active {
          transform: scale(0.95);
        }
        
        .fullscreen-icon, .exit-fullscreen-icon {
          width: 24px;
          height: 24px;
          fill: #fff;
        }
        
        .fullscreen-icon {
          display: block;
        }
        
        .exit-fullscreen-icon {
          display: none;
        }
        
        :host([fullscreen]) .fullscreen-icon {
          display: none;
        }
        
        :host([fullscreen]) .exit-fullscreen-icon {
          display: block;
        }
      </style>
      
      <button class="fullscreen-button" aria-label="Toggle fullscreen">
        <svg class="fullscreen-icon" viewBox="0 0 24 24">
          <path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" />
        </svg>
        <svg class="exit-fullscreen-icon" viewBox="0 0 24 24">
          <path d="M14,14H19V16H16V19H14V14M5,14H10V19H8V16H5V14M8,5H10V10H5V8H8V5M19,8V10H14V5H16V8H19Z" />
        </svg>
      </button>
    `;

    // Cache DOM elements
    this.button = this.shadowRoot.querySelector('.fullscreen-button');
    this.fullscreenIcon = this.shadowRoot.querySelector('.fullscreen-icon');
    this.exitFullscreenIcon = this.shadowRoot.querySelector('.exit-fullscreen-icon');
  }

  _initializeEventListeners() {
    this.button.addEventListener('click', this._onButtonClick.bind(this));
  }

  _removeEventListeners() {
    this.button.removeEventListener('click', this._onButtonClick.bind(this));
  }

  _onButtonClick() {
    this._toggleFullscreen();
  }

  _onFullscreenChange() {
    // Check if currently in fullscreen mode
    const isFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
    
    // Update state
    this._isFullscreen = isFullscreen;
    this._updateButtonUI();
  }

  _toggleFullscreen() {
    if (this._isFullscreen) {
      this._exitFullscreen();
    } else {
      this._requestFullscreen();
    }
  }

  _requestFullscreen() {
    // Dispatch event for parent to handle
    const event = new CustomEvent('request-fullscreen', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  _updateButtonUI() {
    if (this._isFullscreen) {
      this.setAttribute('fullscreen', '');
    } else {
      this.removeAttribute('fullscreen');
    }
  }

  _updateTheme(isDarkMode) {
    if (isDarkMode) {
      this.setAttribute('dark-mode', '');
    } else {
      this.removeAttribute('dark-mode');
    }
  }

  // Public API
  get isFullscreen() {
    return this._isFullscreen;
  }
  
  set isFullscreen(value) {
    this._isFullscreen = Boolean(value);
    this._updateButtonUI();
  }
}

customElements.define('fullscreen-button', FullscreenButton); 