class SeekBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._currentTime = 0;
    this._duration = 0;
    this._buffered = 0;
    this._isDragging = false;
    this._initialized = false;
    this._render();
  }

  static get observedAttributes() {
    return ['current-time', 'duration', 'buffered', 'dark-mode'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'current-time':
        this._currentTime = parseFloat(newValue) || 0;
        if (!this._isDragging) {
          this._updateSeekUI();
        }
        break;
      case 'duration':
        this._duration = parseFloat(newValue) || 0;
        this._updateSeekUI();
        break;
      case 'buffered':
        this._buffered = parseFloat(newValue) || 0;
        this._updateBufferUI();
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
          display: block;
          width: 100%;
          --bar-height: 8px;
          --thumb-size: 16px;
          --progress-color: #3498db;
          --buffer-color: rgba(255, 255, 255, 0.3);
          --background-color: rgba(255, 255, 255, 0.2);
          --hover-color: rgba(255, 255, 255, 0.1);
          --time-tooltip-bg: rgba(0, 0, 0, 0.7);
          --time-tooltip-color: white;
        }
        
        :host([dark-mode]) {
          --buffer-color: rgba(255, 255, 255, 0.3);
          --background-color: rgba(255, 255, 255, 0.2);
          --hover-color: rgba(255, 255, 255, 0.1);
        }
        
        /* Inherit colors from parent if set */
        :host {
          --progress-color: var(--primary-color, #3498db);
        }
        
        .seek-container {
          position: relative;
          height: calc(var(--bar-height) + 16px);
          cursor: pointer;
          touch-action: none;
          margin: 5px 0;
        }
        
        .seek-bar {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          height: var(--bar-height);
          background-color: var(--background-color);
          border-radius: calc(var(--bar-height) / 2);
          overflow: hidden;
        }
        
        .buffer-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background-color: var(--buffer-color);
          border-radius: calc(var(--bar-height) / 2);
          width: 0%;
        }
        
        .progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 0%;
          background-color: var(--progress-color);
          border-radius: calc(var(--bar-height) / 2);
          transition: width 0.1s linear;
        }
        
        .seek-thumb {
          position: absolute;
          top: 50%;
          left: 0;
          width: var(--thumb-size);
          height: var(--thumb-size);
          background-color: var(--progress-color);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .seek-container:hover .seek-thumb,
        .seek-container.active .seek-thumb {
          opacity: 1;
        }
        
        .seek-hover-time {
          position: absolute;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 12px;
          bottom: 100%;
          transform: translateX(-50%);
          display: none;
          pointer-events: none;
          margin-bottom: 5px;
          white-space: nowrap;
        }
        
        .seek-container:hover .seek-hover-time {
          display: block;
        }
        
        /* Hover effect */
        .seek-hover-track {
          position: absolute;
          width: 100%;
          height: var(--hover-height);
          background-color: transparent;
          transition: background-color 0.2s;
        }
        
        .seek-container:hover .seek-hover-track {
          background-color: var(--hover-color);
        }
      </style>
      
      <div class="seek-container">
        <div class="seek-hover-track"></div>
        <div class="seek-bar">
          <div class="buffer-bar"></div>
          <div class="progress-bar"></div>
        </div>
        <div class="seek-thumb"></div>
        <div class="seek-hover-time">0:00</div>
      </div>
    `;

    // Cache DOM elements
    this.seekContainer = this.shadowRoot.querySelector('.seek-container');
    this.progressBar = this.shadowRoot.querySelector('.progress-bar');
    this.bufferBar = this.shadowRoot.querySelector('.buffer-bar');
    this.seekThumb = this.shadowRoot.querySelector('.seek-thumb');
    this.hoverTime = this.shadowRoot.querySelector('.seek-hover-time');
  }

  _initializeEventListeners() {
    // Mouse events
    this.seekContainer.addEventListener('mousedown', this._onSeekStart.bind(this));
    document.addEventListener('mousemove', this._onSeekMove.bind(this));
    document.addEventListener('mouseup', this._onSeekEnd.bind(this));
    
    // Touch events for mobile
    this.seekContainer.addEventListener('touchstart', this._onSeekStart.bind(this));
    document.addEventListener('touchmove', this._onSeekMove.bind(this));
    document.addEventListener('touchend', this._onSeekEnd.bind(this));
    
    // Hover events
    this.seekContainer.addEventListener('mousemove', this._onHover.bind(this));
    this.seekContainer.addEventListener('mouseleave', this._onLeave.bind(this));
  }

  _removeEventListeners() {
    // Mouse events
    this.seekContainer.removeEventListener('mousedown', this._onSeekStart.bind(this));
    document.removeEventListener('mousemove', this._onSeekMove.bind(this));
    document.removeEventListener('mouseup', this._onSeekEnd.bind(this));
    
    // Touch events
    this.seekContainer.removeEventListener('touchstart', this._onSeekStart.bind(this));
    document.removeEventListener('touchmove', this._onSeekMove.bind(this));
    document.removeEventListener('touchend', this._onSeekEnd.bind(this));
    
    // Hover events
    this.seekContainer.removeEventListener('mousemove', this._onHover.bind(this));
    this.seekContainer.removeEventListener('mouseleave', this._onLeave.bind(this));
  }

  _onSeekStart(e) {
    e.preventDefault();
    this._isDragging = true;
    this.seekContainer.classList.add('dragging');
    
    // Calculate seek position
    const position = this._getEventPosition(e);
    this._updateSeekPosition(position);
  }

  _onSeekMove(e) {
    if (!this._isDragging) return;
    
    // Calculate seek position
    const position = this._getEventPosition(e);
    this._updateSeekPosition(position);
  }

  _onSeekEnd() {
    if (!this._isDragging) return;
    
    this._isDragging = false;
    this.seekContainer.classList.remove('dragging');
    
    // Dispatch seek-end event
    this._dispatchSeekEvent('seek-end');
  }

  _onHover(e) {
    if (this._isDragging) return;
    
    const rect = this.seekContainer.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const hoverTime = position * this._duration;
    
    // Update hover time display
    this.hoverTime.textContent = this._formatTime(hoverTime);
    this.hoverTime.style.left = `${position * 100}%`;
  }

  _onLeave() {
    if (this._isDragging) return;
    
    // Hide hover time
    this.hoverTime.style.display = 'none';
  }

  _getEventPosition(e) {
    const rect = this.seekContainer.getBoundingClientRect();
    let clientX;
    
    // Handle both mouse and touch events
    if (e.type.startsWith('touch')) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    // Calculate position as percentage (0-1)
    let position = (clientX - rect.left) / rect.width;
    
    // Clamp position between 0 and 1
    position = Math.max(0, Math.min(1, position));
    
    return position;
  }

  _updateSeekPosition(position) {
    // Update UI
    this.progressBar.style.width = `${position * 100}%`;
    this.seekThumb.style.left = `${position * 100}%`;
    
    // Calculate time
    const seekTime = position * this._duration;
    
    // Update hover time
    this.hoverTime.textContent = this._formatTime(seekTime);
    this.hoverTime.style.left = `${position * 100}%`;
    
    // Update current time
    this._currentTime = seekTime;
    
    // Dispatch seek event
    this._dispatchSeekEvent('seek');
  }

  _updateSeekUI() {
    if (!this.progressBar || !this.seekThumb || this._duration === 0) return;
    
    const position = this._currentTime / this._duration;
    this.progressBar.style.width = `${position * 100}%`;
    this.seekThumb.style.left = `${position * 100}%`;
  }

  _updateBufferUI() {
    if (!this.bufferBar || this._duration === 0) return;
    
    const bufferPosition = this._buffered / this._duration;
    this.bufferBar.style.width = `${bufferPosition * 100}%`;
  }

  _updateTheme(isDarkMode) {
    if (isDarkMode) {
      this.setAttribute('dark-mode', '');
    } else {
      this.removeAttribute('dark-mode');
    }
  }

  _formatTime(seconds) {
    seconds = Math.max(0, seconds);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  _dispatchSeekEvent(eventName = 'seek') {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail: {
        currentTime: this._currentTime,
        position: this._currentTime / this._duration
      }
    });
    this.dispatchEvent(event);
  }

  // Public API
  get currentTime() {
    return this._currentTime;
  }
  
  set currentTime(value) {
    this._currentTime = Math.max(0, Math.min(this._duration, parseFloat(value) || 0));
    this.setAttribute('current-time', this._currentTime);
  }
  
  get duration() {
    return this._duration;
  }
  
  set duration(value) {
    this._duration = Math.max(0, parseFloat(value) || 0);
    this.setAttribute('duration', this._duration);
  }
  
  get buffered() {
    return this._buffered;
  }
  
  set buffered(value) {
    this._buffered = Math.max(0, Math.min(this._duration, parseFloat(value) || 0));
    this.setAttribute('buffered', this._buffered);
  }
}

customElements.define('seek-bar', SeekBar); 