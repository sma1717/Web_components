class DarkModeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isDarkMode = false;
    this._initialized = false;
    
    // Create a bound version of the handler for event listeners
    this._handleToggleClick = this._onToggleClick.bind(this);
    this._handleDarkModeChange = this._onDarkModeChangeFromService.bind(this);
    
    this._render();
  }

  static get observedAttributes() {
    return ['active', 'dark-mode'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'active') {
      this._isDarkMode = newValue !== null;
      this._updateToggleUI();
    } else if (name === 'dark-mode') {
      // Apply dark mode styling to this component itself
      this._updateTheme(newValue !== null);
    }
  }

  connectedCallback() {
    if (this._initialized) return;
    
    // Add event listeners
    this._initializeEventListeners();
    
    // Check if the dark mode service is available
    if (window.darkModeService) {
      // Set initial state based on service
      this._isDarkMode = window.darkModeService.isDarkMode();
      this._updateToggleUI();
      
      // Listen for dark mode changes from the service
      document.addEventListener('dark-mode-change', this._handleDarkModeChange);
    } else {
      // Fallback to checking localStorage
      this._checkStoredPreference();
    }
    
    this._initialized = true;
  }

  disconnectedCallback() {
    this._removeEventListeners();
    
    // Remove service listener
    document.removeEventListener('dark-mode-change', this._handleDarkModeChange);
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
          --icon-light-color: #fff;
          --icon-dark-color: #fff;
          --hover-bg: rgba(255, 255, 255, 0.2);
          width: 40px;
          height: 40px;
        }
        
        /* For topbar we need different colors */
        :host(.topbar) {
          --icon-light-color: #333;
          --icon-dark-color: #fff;
        }
        
        /* When in dark mode */
        :host([dark-mode]) {
          --icon-light-color: #fff;
          --icon-dark-color: #fff;
        }
        
        /* Inherit colors from parent if set */
        :host {
          --icon-light-color: var(--icon-color, #fff);
          --icon-dark-color: var(--icon-color, #fff);
        }
        
        .toggle-button {
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
        
        .toggle-button:hover {
          background-color: var(--hover-bg);
        }
        
        .toggle-button:active {
          transform: scale(0.95);
        }
        
        .light-icon, .dark-icon {
          width: 24px;
          height: 24px;
          transition: transform 0.3s ease;
        }
        
        .light-icon {
          color: var(--icon-light-color);
          fill: var(--icon-light-color);
          display: block;
        }
        
        .dark-icon {
          color: var(--icon-dark-color);
          fill: var(--icon-dark-color);
          display: none;
        }
        
        :host([active]) .light-icon {
          display: none;
        }
        
        :host([active]) .dark-icon {
          display: block;
        }
      </style>
      
      <button class="toggle-button" aria-label="Toggle dark mode">
        <!-- Sun icon (for light mode) -->
        <svg class="light-icon" viewBox="0 0 24 24">
          <path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z" />
        </svg>
        
        <!-- Moon icon (for dark mode) -->
        <svg class="dark-icon" viewBox="0 0 24 24">
          <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z" />
        </svg>
      </button>
    `;

    // Cache DOM elements
    this.button = this.shadowRoot.querySelector('.toggle-button');
    this.lightIcon = this.shadowRoot.querySelector('.light-icon');
    this.darkIcon = this.shadowRoot.querySelector('.dark-icon');
  }

  _initializeEventListeners() {
    this.button.addEventListener('click', this._handleToggleClick);
  }

  _removeEventListeners() {
    this.button.removeEventListener('click', this._handleToggleClick);
  }

  _onToggleClick() {
    this._isDarkMode = !this._isDarkMode;
    
    // If dark mode service is available, use it
    if (window.darkModeService) {
      window.darkModeService.toggle();
    } else {
      // Fallback to handling it ourselves
      this._updateToggleUI();
      this._savePreference();
      this._dispatchToggleEvent();
    }
  }

  _onDarkModeChangeFromService(e) {
    const { isDarkMode } = e.detail;
    
    if (this._isDarkMode !== isDarkMode) {
      this._isDarkMode = isDarkMode;
      this._updateToggleUI();
    }
  }

  _updateToggleUI() {
    if (this._isDarkMode) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }

  // Method that can be called from the dark mode service
  updateDarkMode(isDarkMode) {
    if (this._isDarkMode !== isDarkMode) {
      this._isDarkMode = isDarkMode;
      this._updateToggleUI();
    }
  }

  _checkStoredPreference() {
    try {
      const storedPreference = localStorage.getItem('dark-mode');
      
      if (storedPreference !== null) {
        this._isDarkMode = storedPreference === 'true';
        this._updateToggleUI();
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this._isDarkMode = prefersDark;
        this._updateToggleUI();
      }
    } catch (e) {
      console.warn('DarkModeToggle: Could not access localStorage');
    }
  }

  _savePreference() {
    try {
      localStorage.setItem('dark-mode', String(this._isDarkMode));
    } catch (e) {
      console.warn('DarkModeToggle: Could not save to localStorage');
    }
  }

  _dispatchToggleEvent() {
    const event = new CustomEvent('toggle', {
      bubbles: true,
      composed: true,
      detail: {
        active: this._isDarkMode
      }
    });
    this.dispatchEvent(event);
  }

  _updateTheme(isDarkMode) {
    // Update the component's own theme if needed
  }

  // Public API
  get isDarkMode() {
    return this._isDarkMode;
  }

  set isDarkMode(value) {
    const newValue = Boolean(value);
    if (this._isDarkMode !== newValue) {
      this._isDarkMode = newValue;
      this._updateToggleUI();
      if (window.darkModeService) {
        window.darkModeService.setDarkMode(newValue);
      } else {
        this._savePreference();
        this._dispatchToggleEvent();
      }
    }
  }

  toggle() {
    this._onToggleClick();
  }
}

customElements.define('dark-mode-toggle', DarkModeToggle); 