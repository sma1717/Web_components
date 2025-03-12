class SeekButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  static get observedAttributes() {
    return ['direction', 'dark-mode', 'seek-time'];
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
        
        button {
          background: none;
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
          position: relative;
        }
        
        button:hover {
          background-color: var(--hover-bg);
        }
        
        button:active {
          transform: scale(0.95);
        }
        
        svg {
          width: 32px;
          height: 32px;
          fill: var(--icon-color);
        }
        
        :host([direction="backward"]) svg {
          transform: scaleX(-1);
        }
        
        .seek-time {
          position: absolute;
          font-size: 10px;
          color: var(--icon-color);
          font-weight: bold;
          text-align: center;
        }
      </style>
      
      <button aria-label="Seek">
        <svg viewBox="0 0 24 24">
          <path d="M12,5V1L7,6L12,11V7A6,6 0 0,1 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13H4A8,8 0 0,0 12,21A8,8 0 0,0 20,13A8,8 0 0,0 12,5Z" />
        </svg>
        <span class="seek-time">10</span>
      </button>
    `;

    this.button = this.shadowRoot.querySelector('button');
    this.seekTimeDisplay = this.shadowRoot.querySelector('.seek-time');
    this.button.addEventListener('click', this._onClick.bind(this));
    
    // Update direction and seek time display
    this._updateDirection();
    this._updateSeekTimeDisplay();
  }

  connectedCallback() {
    this._updateDirection();
    this._updateSeekTimeDisplay();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'direction') {
      this._updateDirection();
    } else if (name === 'seek-time') {
      this._updateSeekTimeDisplay();
    }
  }

  _updateDirection() {
    const direction = this.getAttribute('direction') || 'forward';
    this.button.setAttribute('aria-label', `Seek ${direction}`);
  }
  
  _updateSeekTimeDisplay() {
    if (this.seekTimeDisplay) {
      const seekTime = this.getAttribute('seek-time') || '10';
      this.seekTimeDisplay.textContent = seekTime;
    }
  }

  _onClick() {
    const direction = this.getAttribute('direction') || 'forward';
    const seekTime = parseInt(this.getAttribute('seek-time') || '10', 10);
    
    // Create a more detailed event object
    const event = new CustomEvent('seek', {
      bubbles: true,
      composed: true,
      detail: {
        direction,
        seekTime,
        seconds: seekTime // For compatibility with existing code
      }
    });
    this.dispatchEvent(event);
  }
}

customElements.define('seek-button', SeekButton); 