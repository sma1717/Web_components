class SpeedControl extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._speed = 1;
    this._speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
    this._isOpen = false;
    this._initialized = false;
    this._render();
    
    // Bind methods
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
  }

  static get observedAttributes() {
    return ['speed', 'dark-mode'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._initialized) return;
    
    switch (name) {
      case 'speed':
        if (newValue !== null) {
          this._speed = parseFloat(newValue);
          this._updateSpeedUI();
        }
        break;
      case 'dark-mode':
        this._updateTheme(newValue !== null);
        break;
    }
  }

  connectedCallback() {
    this._initialized = true;
    this._initializeEventListeners();
    
    // Add document click listener for closing dropdown
    document.addEventListener('click', this._handleOutsideClick);
  }

  disconnectedCallback() {
    this._removeEventListeners();
    
    // Remove document click listener
    document.removeEventListener('click', this._handleOutsideClick);
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          --text-color: #fff;
          --dropdown-text-color: #333; /* Specific color for dropdown text */
          --bg-color: transparent;
          --hover-bg: rgba(255, 255, 255, 0.2);
          --dropdown-bg: white;
          --dropdown-border: #ddd;
          --dropdown-hover: #f5f5f5;
          --primary-color: #3498db;
          height: 40px;
          width: 40px;
        }
        
        :host([dark-mode]) {
          --text-color: #fff;
          --dropdown-text-color: #fff; /* Specific color for dropdown text in dark mode */
          --bg-color: transparent;
          --hover-bg: rgba(255, 255, 255, 0.2);
          --dropdown-bg: #444;
          --dropdown-border: #555;
          --dropdown-hover: #555;
        }
        
        /* Inherit colors from parent if set, but keep dropdown text color fixed */
        :host {
          --text-color: var(--icon-color, #fff);
        }
        
        :host([dark-mode]) {
          --text-color: var(--icon-color, #fff);
        }
        
        .speed-button {
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
          color: var(--text-color);
          font-size: 14px;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        
        .speed-button:hover {
          background-color: var(--hover-bg);
        }
        
        .speed-button:active {
          transform: scale(0.95);
        }
        
        .speed-dropdown {
          position: absolute;
          bottom: 100%;
          left: 0;
          background-color: var(--dropdown-bg);
          border: 1px solid var(--dropdown-border);
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
          min-width: 100px;
          display: none;
          margin-bottom: 5px;
        }
        
        .speed-dropdown.open {
          display: block;
        }
        
        .speed-option {
          padding: 8px 12px;
          cursor: pointer;
          color: var(--dropdown-text-color); /* Use specific dropdown text color */
          font-size: 14px;
          border-bottom: 1px solid var(--dropdown-border);
        }
        
        .speed-option:last-child {
          border-bottom: none;
        }
        
        .speed-option:hover {
          background-color: var(--dropdown-hover);
        }
        
        .speed-option.active {
          background-color: var(--primary-color);
          color: white;
          font-weight: bold;
        }
        
        .dropdown-icon {
          width: 12px;
          height: 12px;
          margin-left: 5px;
          fill: var(--text-color);
        }
      </style>
      
      <button class="speed-button" aria-label="Playback speed">
        <span class="speed-label">${this._speed}x</span>
        <svg class="dropdown-icon" viewBox="0 0 24 24">
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </button>
      
      <div class="speed-dropdown">
        ${this._speedOptions.map(speed => `
          <div class="speed-option ${speed === this._speed ? 'active' : ''}" data-speed="${speed}">
            ${speed === 1 ? 'Normal (1x)' : `${speed}x`}
          </div>
        `).join('')}
      </div>
    `;

    // Cache DOM elements
    this.speedButton = this.shadowRoot.querySelector('.speed-button');
    this.speedLabel = this.shadowRoot.querySelector('.speed-label');
    this.speedDropdown = this.shadowRoot.querySelector('.speed-dropdown');
    this.speedOptions = this.shadowRoot.querySelectorAll('.speed-option');
  }

  _initializeEventListeners() {
    this.speedButton.addEventListener('click', this._toggleDropdown.bind(this));
    
    this.speedOptions.forEach(option => {
      option.addEventListener('click', this._onSpeedOptionClick.bind(this));
    });
  }

  _removeEventListeners() {
    this.speedButton.removeEventListener('click', this._toggleDropdown.bind(this));
    
    this.speedOptions.forEach(option => {
      option.removeEventListener('click', this._onSpeedOptionClick.bind(this));
    });
  }

  _toggleDropdown(e) {
    e.stopPropagation();
    this._isOpen = !this._isOpen;
    console.log('SpeedControl: Toggling dropdown, isOpen:', this._isOpen);
    this.speedDropdown.classList.toggle('open', this._isOpen);
  }

  _onSpeedOptionClick(e) {
    const speed = parseFloat(e.target.dataset.speed);
    console.log('SpeedControl: Speed option clicked:', speed);
    this._speed = speed;
    this.setAttribute('speed', speed);
    this._updateSpeedUI();
    this._closeDropdown();
    this._dispatchSpeedEvent();
  }

  _handleOutsideClick(e) {
    if (this._isOpen && !this.contains(e.target)) {
      console.log('SpeedControl: Outside click detected, closing dropdown');
      this._closeDropdown();
    }
  }

  _closeDropdown() {
    this._isOpen = false;
    this.speedDropdown.classList.remove('open');
  }

  _updateSpeedUI() {
    console.log('SpeedControl: Updating UI, speed:', this._speed);
    
    // Update speed label
    if (this.speedLabel) {
      this.speedLabel.textContent = `${this._speed}x`;
    }
    
    // Update active class on options
    this.speedOptions.forEach(option => {
      const optionSpeed = parseFloat(option.dataset.speed);
      if (optionSpeed === this._speed) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  _updateTheme(isDarkMode) {
    // Prevent infinite recursion by not setting attributes
    // Just apply the theme directly
    if (isDarkMode) {
      this.shadowRoot.host.classList.add('dark-mode');
    } else {
      this.shadowRoot.host.classList.remove('dark-mode');
    }
  }

  _dispatchSpeedEvent() {
    console.log('SpeedControl: Dispatching speed-change event, speed:', this._speed);
    const event = new CustomEvent('speed-change', {
      bubbles: true,
      composed: true,
      detail: {
        speed: this._speed
      }
    });
    this.dispatchEvent(event);
  }

  // Public API
  get speed() {
    return this._speed;
  }
  
  set speed(value) {
    const newValue = parseFloat(value);
    if (!isNaN(newValue) && this._speed !== newValue) {
      this._speed = newValue;
      this._updateSpeedUI();
    }
  }
  
  setSpeedOptions(options) {
    if (Array.isArray(options) && options.length > 0) {
      this._speedOptions = options;
      this._render();
      this._initializeEventListeners();
    }
  }
}

customElements.define('speed-control', SpeedControl); 