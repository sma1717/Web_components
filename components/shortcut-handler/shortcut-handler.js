class ShortcutHandler extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default state
    this._targetSelector = '';
    this._target = null;
    this._isActive = true;
    this._skipForwardSeconds = 10;
    this._skipBackwardSeconds = 10;
    this._darkMode = localStorage.getItem('darkMode') === 'true';
    this._initialized = false;
    
    // Bind methods
    this._handleKeydown = this._handleKeydown.bind(this);
    this._setupTarget = this._setupTarget.bind(this);
    this._handleMediaChanged = this._handleMediaChanged.bind(this);
    
    // Initialize the component
    this._renderWithDefaultStyles();
    
    console.log('ShortcutHandler constructor completed');
  }
  
  static get observedAttributes() {
    return ['target', 'active'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'target':
        console.log(`Target changed from "${oldValue}" to "${newValue}"`);
        this._targetSelector = newValue;
        this._setupTarget();
        break;
      case 'active':
        this._isActive = newValue === 'true';
        this._updateActive();
        break;
    }
  }
  
  connectedCallback() {
    console.log('ShortcutHandler connected to DOM');
    
    // Setup key events
    window.addEventListener('keydown', this._handleKeydown);
    
    // Listen for media changes
    document.addEventListener('media-changed', this._handleMediaChanged);
    
    // Set target if attribute provided
    if (this.hasAttribute('target')) {
      this._targetSelector = this.getAttribute('target');
      this._setupTarget();
    }
    
    // Set active state
    this._isActive = this.hasAttribute('active') ? 
      this.getAttribute('active') === 'true' : 
      true;
      
    this._updateActive();
    
    this._initialized = true;
  }
  
  disconnectedCallback() {
    window.removeEventListener('keydown', this._handleKeydown);
    document.removeEventListener('media-changed', this._handleMediaChanged);
  }
  
  _renderWithDefaultStyles() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="components/shortcut-handler/shortcut-handler.css">
      <div class="shortcut-handler">
        <div class="status-indicator ${this._isActive ? 'active' : 'inactive'}">
          Shortcuts: ${this._isActive ? 'Active' : 'Inactive'}
        </div>
        <div class="feedback"></div>
      </div>
    `;
    
    // Cache elements for later use
    this.statusIndicator = this.shadowRoot.querySelector('.status-indicator');
    this.feedback = this.shadowRoot.querySelector('.feedback');
    
    // Add click listener to toggle active state
    if (this.statusIndicator) {
      this.statusIndicator.addEventListener('click', () => {
        this.setActive(!this._isActive);
      });
    }
  }
  
  _setupTarget() {
    console.log('Setting up target with selector:', this._targetSelector);
    
    // If no selector, clear target
    if (!this._targetSelector) {
      this._target = null;
      return;
    }
    
    // Find target in the DOM
    this._target = document.querySelector(this._targetSelector);
    
    if (this._target) {
      console.log('Found shortcut handler target:', this._target);
    } else {
      console.warn('Shortcut handler target not found with selector:', this._targetSelector);
      
      // Schedule a retry with delay
      setTimeout(() => {
        this._target = document.querySelector(this._targetSelector);
        
        if (this._target) {
          console.log('Found shortcut handler target on retry:', this._target);
        } else {
          console.warn('Still cannot find shortcut handler target after retry');
        }
      }, 500);
    }
  }
  
  _updateActive() {
    if (this.statusIndicator && this.statusText) {
      this.statusText.textContent = this._isActive ? 'Active' : 'Inactive';
      
      this.statusIndicator.classList.toggle('active', this._isActive);
      this.statusIndicator.classList.toggle('inactive', !this._isActive);
      
      // Show the indicator briefly
      this.statusIndicator.classList.add('show');
      setTimeout(() => {
        this.statusIndicator.classList.remove('show');
      }, 2000);
    }
  }
  
  _handleKeydown(event) {
    if (!this._isActive) return;
    
    // Get the target element if not already found
    if (!this._target && this._targetSelector) {
      this._target = document.querySelector(this._targetSelector);
    }
    
    if (!this._target) {
      console.warn('No target found for shortcut handling');
      return;
    }
    
    console.log('Handling keydown event:', event.key);
    
    // Handle shortcuts
    switch (event.key.toLowerCase()) {
      case ' ':
      case 'k':
        // Play/Pause
        if (typeof this._target.togglePlay === 'function') {
          event.preventDefault();
          this._target.togglePlay();
          this._showFeedback('Play/Pause');
        }
        break;
        
      case 'f':
        // Fullscreen
        if (typeof this._target.requestFullscreen === 'function') {
          event.preventDefault();
          this._target.requestFullscreen();
          this._showFeedback('Fullscreen');
        }
        break;
        
      case 'm':
        // Mute
        if (typeof this._target.toggleMute === 'function') {
          event.preventDefault();
          this._target.toggleMute();
          this._showFeedback('Mute Toggle');
        }
        break;
        
      case 'j':
      case 'arrowleft':
        // Seek backward
        if (typeof this._target.seekBackward === 'function') {
          event.preventDefault();
          this._target.seekBackward(10);
          this._showFeedback('Backward 10s');
        }
        break;
        
      case 'l':
      case 'arrowright':
        // Seek forward
        if (typeof this._target.seekForward === 'function') {
          event.preventDefault();
          this._target.seekForward(10);
          this._showFeedback('Forward 10s');
        }
        break;
        
      case ',':
      case '<':
        // Decrease playback rate
        if (typeof this._target.decreasePlaybackRate === 'function') {
          event.preventDefault();
          this._target.decreasePlaybackRate();
          this._showFeedback('Speed Down');
        }
        break;
        
      case '.':
      case '>':
        // Increase playback rate
        if (typeof this._target.increasePlaybackRate === 'function') {
          event.preventDefault();
          this._target.increasePlaybackRate();
          this._showFeedback('Speed Up');
        }
        break;
        
      case 'd':
        // Toggle dark mode
        if (typeof this._target.toggleDarkMode === 'function') {
          event.preventDefault();
          this._target.toggleDarkMode();
          this._showFeedback('Dark Mode Toggle');
        }
        break;
    }
  }
  
  _showFeedback(action) {
    // Create a temporary feedback element
    const feedback = document.createElement('div');
    feedback.style.position = 'fixed';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%)';
    feedback.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    feedback.style.color = 'white';
    feedback.style.padding = '10px 20px';
    feedback.style.borderRadius = '4px';
    feedback.style.fontFamily = 'Arial, sans-serif';
    feedback.style.fontSize = '16px';
    feedback.style.zIndex = '10000';
    feedback.style.pointerEvents = 'none';
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.2s ease';
    feedback.textContent = action;
    
    // Add to document
    document.body.appendChild(feedback);
    
    // Animate in
    setTimeout(() => {
      feedback.style.opacity = '1';
    }, 0);
    
    // Remove after delay
    setTimeout(() => {
      feedback.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(feedback);
      }, 200);
    }, 1000);
  }
  
  _handleMediaChanged(event) {
    console.log('Shortcut handler detected media change:', event.detail);
    
    // Wait for DOM updates
    setTimeout(() => {
      console.log('Updating shortcut target after media change');
      this._setupTarget();
    }, 300);
  }
  
  // Public API
  
  /**
   * Set the target element for shortcuts
   * @param {string} selector - CSS selector for the target element
   */
  setTarget(selector) {
    this._targetSelector = selector;
    this.setAttribute('target', selector);
    this._setupTarget();
  }
  
  /**
   * Enable or disable shortcuts
   * @param {boolean} active - Whether shortcuts should be active
   */
  setActive(active) {
    this._isActive = active;
    this.setAttribute('active', active.toString());
    this._updateActive();
  }
}

// Define the custom element
customElements.define('shortcut-handler', ShortcutHandler); 