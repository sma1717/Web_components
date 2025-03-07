class ImageViewer extends MediaBase {
  constructor() {
    super();
    
    // Override the type
    this._type = 'image';
    
    // Image-specific state
    this._zoomLevel = 1;
    this._rotation = 0;
    this._isDragging = false;
    this._dragStart = { x: 0, y: 0 };
    this._position = { x: 0, y: 0 };
    
    // Bind methods
    this._onZoomIn = this._onZoomIn.bind(this);
    this._onZoomOut = this._onZoomOut.bind(this);
    this._onRotateLeft = this._onRotateLeft.bind(this);
    this._onRotateRight = this._onRotateRight.bind(this);
    this._onReset = this._onReset.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
  }
  
  static get observedAttributes() {
    // Add image-specific attributes
    return [...super.observedAttributes, 'alt'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    // Handle image-specific attributes
    if (name === 'alt' && this.image) {
      this.image.alt = newValue;
    } else {
      // Let the parent class handle common attributes
      super.attributeChangedCallback(name, oldValue, newValue);
    }
  }
  
  async _initialize() {
    // Load CSS
    const cssPath = 'components/image-viewer/image-viewer.css';
    try {
      const response = await fetch(cssPath);
      if (response.ok) {
        const css = await response.text();
        this._renderWithCSS(css);
      } else {
        console.error(`Failed to load CSS from ${cssPath}`);
        this._renderWithDefaultStyles();
      }
    } catch (error) {
      console.error(`Error loading CSS: ${error}`);
      this._renderWithDefaultStyles();
    }
    
    // Mark as initialized
    this._initialized = true;
    
    // Update image source if src was set before initialization
    if (this._src) {
      this._updateSource();
    }
  }
  
  _renderWithCSS(css) {
    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <div class="image-container">
        <img id="image" draggable="false">
        <div class="zoom-container">
          <button class="zoom-button" id="zoom-in">+</button>
          <button class="zoom-button" id="zoom-out">-</button>
        </div>
        <div class="rotate-container">
          <button class="rotate-button" id="rotate-left">↺</button>
          <button class="rotate-button" id="rotate-right">↻</button>
        </div>
        <button class="reset-button" id="reset">⟲</button>
        <slot></slot>
      </div>
    `;
    
    this.image = this.shadowRoot.getElementById('image');
    this.zoomInButton = this.shadowRoot.getElementById('zoom-in');
    this.zoomOutButton = this.shadowRoot.getElementById('zoom-out');
    this.rotateLeftButton = this.shadowRoot.getElementById('rotate-left');
    this.rotateRightButton = this.shadowRoot.getElementById('rotate-right');
    this.resetButton = this.shadowRoot.getElementById('reset');
    this.container = this.shadowRoot.querySelector('.image-container');
    
    this._updateSource();
  }
  
  _renderWithDefaultStyles() {
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
      
      .image-container {
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        transition: transform 0.3s ease;
      }
      
      .zoom-container {
        position: absolute;
        bottom: 70px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        padding: 5px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .image-container:hover .zoom-container {
        opacity: 1;
      }
      
      .zoom-button {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .zoom-button:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
      
      .rotate-container {
        position: absolute;
        bottom: 70px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        padding: 5px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .image-container:hover .rotate-container {
        opacity: 1;
      }
      
      .rotate-button {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .rotate-button:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
      
      .reset-button {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s ease, opacity 0.3s ease;
        opacity: 0;
      }
      
      .image-container:hover .reset-button {
        opacity: 1;
      }
      
      .reset-button:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
      
      @media (max-width: 768px) {
        :host {
          aspect-ratio: auto;
          height: 50vh;
        }
        
        .zoom-container,
        .rotate-container {
          flex-direction: row;
        }
        
        .zoom-container {
          bottom: 20px;
          right: 20px;
        }
        
        .rotate-container {
          bottom: 20px;
          left: 20px;
        }
      }
    `;
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="image-container">
        <img id="image" draggable="false">
        <div class="zoom-container">
          <button class="zoom-button" id="zoom-in">+</button>
          <button class="zoom-button" id="zoom-out">-</button>
        </div>
        <div class="rotate-container">
          <button class="rotate-button" id="rotate-left">↺</button>
          <button class="rotate-button" id="rotate-right">↻</button>
        </div>
        <button class="reset-button" id="reset">⟲</button>
        <slot></slot>
      </div>
    `;
    
    this.image = this.shadowRoot.getElementById('image');
    this.zoomInButton = this.shadowRoot.getElementById('zoom-in');
    this.zoomOutButton = this.shadowRoot.getElementById('zoom-out');
    this.rotateLeftButton = this.shadowRoot.getElementById('rotate-left');
    this.rotateRightButton = this.shadowRoot.getElementById('rotate-right');
    this.resetButton = this.shadowRoot.getElementById('reset');
    this.container = this.shadowRoot.querySelector('.image-container');
    
    this._updateSource();
  }
  
  _updateSource() {
    if (!this.image || !this._src) return;
    
    // Handle both online and local sources
    const isUrl = this._src.startsWith('http') || this._src.startsWith('//');
    
    if (isUrl) {
      this.image.src = this._src;
    } else {
      // For local files served from our asset server
      // Encode the filename to handle spaces and special characters
      const encodedSrc = encodeURIComponent(this._src);
      this.image.src = `http://localhost:1212/assets/images/${encodedSrc}`;
    }
    
    // Reset zoom and rotation when changing images
    this._resetImageTransform();
  }
  
  _initializeEventListeners() {
    if (!this.image || !this.container) {
      console.warn('Image or container element not found, cannot initialize event listeners');
      return;
    }
    
    console.log('Initializing image viewer event listeners');
    
    // Zoom buttons
    this.zoomInButton.addEventListener('click', this._onZoomIn);
    this.zoomOutButton.addEventListener('click', this._onZoomOut);
    
    // Rotate buttons
    this.rotateLeftButton.addEventListener('click', this._onRotateLeft);
    this.rotateRightButton.addEventListener('click', this._onRotateRight);
    
    // Reset button
    this.resetButton.addEventListener('click', this._onReset);
    
    // Mouse events for dragging
    this.image.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    
    // Wheel event for zooming
    this.container.addEventListener('wheel', this._onWheel);
    
    // Double click to reset
    this.image.addEventListener('dblclick', this._onDoubleClick);
    
    // Context menu
    this.addEventListener('contextmenu', this._onContextMenu);
  }
  
  _removeEventListeners() {
    if (!this.image || !this.container) return;
    
    // Zoom buttons
    this.zoomInButton.removeEventListener('click', this._onZoomIn);
    this.zoomOutButton.removeEventListener('click', this._onZoomOut);
    
    // Rotate buttons
    this.rotateLeftButton.removeEventListener('click', this._onRotateLeft);
    this.rotateRightButton.removeEventListener('click', this._onRotateRight);
    
    // Reset button
    this.resetButton.removeEventListener('click', this._onReset);
    
    // Mouse events for dragging
    this.image.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    
    // Wheel event for zooming
    this.container.removeEventListener('wheel', this._onWheel);
    
    // Double click to reset
    this.image.removeEventListener('dblclick', this._onDoubleClick);
    
    // Context menu
    this.removeEventListener('contextmenu', this._onContextMenu);
  }
  
  _onZoomIn() {
    this._zoomLevel = Math.min(5, this._zoomLevel + 0.25);
    this._updateImageTransform();
    this._notifyStateChange();
  }
  
  _onZoomOut() {
    this._zoomLevel = Math.max(0.5, this._zoomLevel - 0.25);
    this._updateImageTransform();
    this._notifyStateChange();
  }
  
  _onRotateLeft() {
    this._rotation = (this._rotation - 90) % 360;
    this._updateImageTransform();
    this._notifyStateChange();
  }
  
  _onRotateRight() {
    this._rotation = (this._rotation + 90) % 360;
    this._updateImageTransform();
    this._notifyStateChange();
  }
  
  _onReset() {
    this._resetImageTransform();
    this._notifyStateChange();
  }
  
  _onMouseDown(event) {
    if (this._zoomLevel > 1) {
      this._isDragging = true;
      this._dragStart = {
        x: event.clientX - this._position.x,
        y: event.clientY - this._position.y
      };
      event.preventDefault();
    }
  }
  
  _onMouseMove(event) {
    if (this._isDragging) {
      this._position = {
        x: event.clientX - this._dragStart.x,
        y: event.clientY - this._dragStart.y
      };
      this._updateImageTransform();
    }
  }
  
  _onMouseUp() {
    this._isDragging = false;
  }
  
  _onWheel(event) {
    event.preventDefault();
    
    // Zoom in or out based on wheel direction
    if (event.deltaY < 0) {
      this._onZoomIn();
    } else {
      this._onZoomOut();
    }
  }
  
  _onDoubleClick() {
    this._resetImageTransform();
    this._notifyStateChange();
  }
  
  _resetImageTransform() {
    this._zoomLevel = 1;
    this._rotation = 0;
    this._position = { x: 0, y: 0 };
    this._updateImageTransform();
  }
  
  _updateImageTransform() {
    if (!this.image) return;
    
    // Apply zoom, rotation, and position
    this.image.style.transform = `
      translate(${this._position.x}px, ${this._position.y}px)
      rotate(${this._rotation}deg)
      scale(${this._zoomLevel})
    `;
  }
  
  _notifyStateChange() {
    // Dispatch an event with the current state
    try {
      this.dispatchEvent(new CustomEvent('image-state-change', {
        bubbles: true,
        composed: true,
        detail: {
          zoomLevel: this._zoomLevel,
          rotation: this._rotation,
          position: this._position,
          darkMode: this._darkMode
        }
      }));
    } catch (error) {
      console.error('Error dispatching image-state-change event:', error);
    }
  }
  
  // Public API methods
  zoomIn() {
    this._onZoomIn();
  }
  
  zoomOut() {
    this._onZoomOut();
  }
  
  rotateLeft() {
    this._onRotateLeft();
  }
  
  rotateRight() {
    this._onRotateRight();
  }
  
  reset() {
    this._resetImageTransform();
    this._notifyStateChange();
  }
  
  setZoom(level) {
    this._zoomLevel = Math.max(0.5, Math.min(5, level));
    this._updateImageTransform();
    this._notifyStateChange();
  }
  
  getZoomLevel() {
    return this._zoomLevel;
  }
  
  getRotation() {
    return this._rotation;
  }
}

// Make sure MediaBase is loaded before defining ImageViewer
if (typeof MediaBase !== 'undefined') {
  customElements.define('image-viewer', ImageViewer);
} else {
  console.error('MediaBase class not found. Make sure to load media-base.js before image-viewer.js');
} 