/**
 * Base class for media components (video, image, etc.)
 * This class provides common functionality for all media types
 */
class MediaBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default state
    this._src = '';
    this._type = 'unknown'; // Will be set by child classes (video, image, etc.)
    this._darkMode = localStorage.getItem('darkMode') === 'true';
    this._initialized = false;
    
    // Initialize the component
    this._initialize();
  }
  
  static get observedAttributes() {
    return ['src', 'dark-mode'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'src':
        this._src = newValue;
        if (this._initialized) {
          this._updateSource();
        }
        break;
      case 'dark-mode':
        this._darkMode = newValue === 'true';
        if (this._initialized) {
          this._updateDarkMode();
        }
        break;
    }
  }
  
  connectedCallback() {
    console.log(`${this._type} component connected to DOM`);
    
    // Initialize event listeners once the element is in the DOM
    // Use setTimeout to ensure the component is fully rendered
    setTimeout(() => {
      this._initializeEventListeners();
      
      // Apply dark mode if needed
      this._updateDarkMode();
      
      // Dispatch ready event
      this.dispatchEvent(new CustomEvent(`${this._type}-ready`, {
        bubbles: true,
        composed: true
      }));
      
      console.log(`${this._type} component initialized`);
    }, 100);
  }
  
  disconnectedCallback() {
    // Clean up event listeners
    this._removeEventListeners();
  }
  
  async _initialize() {
    // This method should be overridden by child classes
    console.warn('_initialize method not implemented');
    
    // Mark as initialized
    this._initialized = true;
  }
  
  _initializeEventListeners() {
    // This method should be overridden by child classes
    console.warn('_initializeEventListeners method not implemented');
  }
  
  _removeEventListeners() {
    // This method should be overridden by child classes
    console.warn('_removeEventListeners method not implemented');
  }
  
  _updateSource() {
    // This method should be overridden by child classes
    console.warn('_updateSource method not implemented');
  }
  
  _updateDarkMode() {
    if (this._darkMode) {
      this.classList.add('dark-mode');
    } else {
      this.classList.remove('dark-mode');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', this._darkMode);
    
    // Notify about dark mode change
    try {
      console.log('Dispatching dark-mode-change event:', this._darkMode);
      this.dispatchEvent(new CustomEvent('dark-mode-change', {
        bubbles: true,
        composed: true,
        detail: {
          darkMode: this._darkMode
        }
      }));
    } catch (error) {
      console.error('Error dispatching dark-mode-change event:', error);
    }
  }
  
  toggleDarkMode() {
    this._darkMode = !this._darkMode;
    this._updateDarkMode();
    
    // Also toggle dark mode on the document body
    const isDarkMode = this._darkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    
    // Update any other components that need dark mode
    const rightClickMenu = document.getElementById('right-click-menu');
    if (rightClickMenu) {
      rightClickMenu.setAttribute('dark-mode', isDarkMode.toString());
    }
    
    // Apply dark mode class to all relevant elements
    document.querySelectorAll('.dark-mode-aware').forEach(el => {
      if (isDarkMode) {
        el.classList.add('dark-mode');
      } else {
        el.classList.remove('dark-mode');
      }
    });
  }
  
  // Method to handle context menu events
  _onContextMenu(event) {
    // Prevent the default context menu
    event.preventDefault();
    
    // Dispatch a custom event for the right-click menu component to handle
    this.dispatchEvent(new CustomEvent(`${this._type}-context-menu`, {
      bubbles: true,
      composed: true,
      detail: {
        x: event.clientX,
        y: event.clientY,
        darkMode: this._darkMode,
        type: this._type
      }
    }));
  }
  
  // Method to request fullscreen
  requestFullscreen() {
    console.log('Request fullscreen method called');
    if (this.shadowRoot.firstElementChild) {
      const element = this.shadowRoot.firstElementChild;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
  }
}

// Export the class
window.MediaBase = MediaBase; 