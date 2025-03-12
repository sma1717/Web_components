/**
 * Dark Mode Service
 * 
 * A centralized service to handle dark mode across the application.
 * This service provides methods to:
 * - Get the current dark mode state
 * - Toggle dark mode
 * - Set dark mode explicitly
 * - Listen for dark mode changes
 * 
 * It uses localStorage to persist the user's preference.
 */
class DarkModeService {
  constructor() {
    this._isDarkMode = false;
    this._initialized = false;
    
    // List of selectors that should receive dark mode attribute
    this._darkModeElements = [
      'html',
      'body',
      'media-sidebar',
      '.sidebar-wrapper',
      '.media-item',
      'video-player',
      'image-viewer',
      'video-controls',
      'right-click-menu',
      '.media-viewer-container',
      '.viewer-wrapper',
      'play-pause-button',
      'seek-button',
      'volume-slider',
      'speed-control',
      'fullscreen-button',
      'seek-bar'
    ];
    
    // Bind methods to maintain this context
    this._onSystemPreferenceChange = this._onSystemPreferenceChange.bind(this);
  }

  initialize() {
    if (this._initialized) return;
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check stored preference, fallback to system preference
    try {
      const storedPreference = localStorage.getItem('dark-mode');
      this._isDarkMode = storedPreference !== null ? storedPreference === 'true' : prefersDark;
    } catch (e) {
      this._isDarkMode = prefersDark;
      console.warn('Could not access localStorage for dark mode preference');
    }

    // Apply initial state
    this._applyDarkMode();
    
    // Listen for system preference changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Use the appropriate event based on browser support
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', this._onSystemPreferenceChange);
    } else if (darkModeMediaQuery.addListener) {
      // For older browsers
      darkModeMediaQuery.addListener(this._onSystemPreferenceChange);
    }

    this._initialized = true;
    console.log('DarkModeService: Initialized with dark mode:', this._isDarkMode);
  }
  
  _onSystemPreferenceChange(e) {
    if (localStorage.getItem('dark-mode') === null) {
      this._isDarkMode = e.matches;
      this._applyDarkMode();
    }
  }

  toggle() {
    this._isDarkMode = !this._isDarkMode;
    this._applyDarkMode();
    return this._isDarkMode;
  }
  
  setDarkMode(value) {
    const newValue = Boolean(value);
    if (this._isDarkMode !== newValue) {
      this._isDarkMode = newValue;
      this._applyDarkMode();
    }
    return this._isDarkMode;
  }

  _applyDarkMode() {
    // Update all elements
    if (this._isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      this._addDarkModeToAllElements();
    } else {
      document.documentElement.classList.remove('dark-theme');
      this._removeDarkModeFromAllElements();
    }

    // Save preference
    try {
      localStorage.setItem('dark-mode', String(this._isDarkMode));
    } catch (e) {
      console.warn('Could not save dark mode preference to localStorage');
    }

    // Dispatch event
    const event = new CustomEvent('dark-mode-change', {
      bubbles: true,
      composed: true,
      detail: { isDarkMode: this._isDarkMode }
    });
    document.dispatchEvent(event);

    // Update all dark mode toggles to match
    this._updateAllDarkModeToggles();

    console.log('DarkModeService: Dark mode updated:', this._isDarkMode);
  }
  
  _addDarkModeToAllElements() {
    this._darkModeElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.setAttribute('dark-mode', '');
        // For web components that might be in shadow DOM
        if (el.updateDarkMode && typeof el.updateDarkMode === 'function') {
          el.updateDarkMode(true);
        }
      });
    });
  }
  
  _removeDarkModeFromAllElements() {
    this._darkModeElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.removeAttribute('dark-mode');
        // For web components that might be in shadow DOM
        if (el.updateDarkMode && typeof el.updateDarkMode === 'function') {
          el.updateDarkMode(false);
        }
      });
    });
  }
  
  _updateAllDarkModeToggles() {
    // Find all dark-mode-toggle elements and update them
    const darkModeToggles = document.querySelectorAll('dark-mode-toggle');
    darkModeToggles.forEach(toggle => {
      if (this._isDarkMode) {
        toggle.setAttribute('active', '');
      } else {
        toggle.removeAttribute('active');
      }
    });
  }

  isDarkMode() {
    return this._isDarkMode;
  }
}

// Create global instance
window.darkModeService = new DarkModeService(); 