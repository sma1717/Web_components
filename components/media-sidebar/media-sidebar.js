class MediaSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default state
    this._mediaItems = [];
    this._activeItemId = null;
    this._filter = '';
    this._activeTab = 'all'; // all, videos, images
    this._darkMode = localStorage.getItem('darkMode') === 'true';
    
    // Bind methods
    this._onFilterChange = this._onFilterChange.bind(this);
    this._onTabClick = this._onTabClick.bind(this);
    this._onMediaItemClick = this._onMediaItemClick.bind(this);
    this._onDarkModeChange = this._onDarkModeChange.bind(this);
    this._onCategoryHeaderClick = this._onCategoryHeaderClick.bind(this);
    
    // Initialize the component
    this._initialize();
  }
  
  static get observedAttributes() {
    return ['dark-mode', 'active-item'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'dark-mode':
        this._darkMode = newValue === 'true';
        this._updateDarkMode();
        break;
      case 'active-item':
        this._activeItemId = newValue;
        this._updateActiveItem();
        break;
    }
  }
  
  connectedCallback() {
    console.log('MediaSidebar connected to DOM');
    
    // Initialize event listeners
    setTimeout(() => {
      this._initializeEventListeners();
      
      // Apply dark mode if needed
      this._updateDarkMode();
      
      // Update active item if set
      if (this._activeItemId) {
        this._updateActiveItem();
      }
      
      console.log('MediaSidebar initialized');
    }, 100);
  }
  
  disconnectedCallback() {
    // Clean up event listeners
    this._removeEventListeners();
  }
  
  async _initialize() {
    // Render the component with default styles
    this._renderWithDefaultStyles();
    
    // Wait for the shadow DOM to be fully attached
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Cache elements
    this._cacheElements();
    
    // Initialize event listeners
    this._initializeEventListeners();
    
    // Apply dark mode if needed
    this._updateDarkMode();
    
    console.log('Media sidebar initialized');
  }
  
  _renderWithDefaultStyles() {
    const styles = `
      /* Default styles */
      :host {
        display: block;
        width: 100%;
        height: 100%;
        font-family: Arial, sans-serif;
        color: #333;
        background-color: #f5f5f5;
      }
      
      .sidebar-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      
      .sidebar-header {
        padding: 15px;
        background-color: #fff;
        border-bottom: 1px solid #e0e0e0;
      }
      
      .sidebar-title {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
      
      .sidebar-filter {
        padding: 10px 15px;
        background-color: #fff;
        border-bottom: 1px solid #e0e0e0;
      }
      
      .filter-input {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
      }
      
      .sidebar-tabs {
        display: flex;
        background-color: #fff;
        border-bottom: 1px solid #e0e0e0;
      }
      
      .sidebar-tab {
        flex: 1;
        padding: 10px;
        text-align: center;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s ease;
      }
      
      .sidebar-tab:hover {
        background-color: #f5f5f5;
      }
      
      .sidebar-tab.active {
        border-bottom: 2px solid #4285f4;
        color: #4285f4;
      }
      
      .media-list {
        list-style: none;
        margin: 0;
        padding: 10px;
        overflow-y: auto;
        flex: 1;
        max-height: 630px;
      }
      
      .media-item {
        display: flex;
        align-items: center;
        padding: 10px;
        margin-bottom: 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        background: rgba(255, 255, 255, 0.5);
      }
      
      .media-item:hover {
        background-color: rgba(66, 133, 244, 0.1);
      }
      
      .media-item.active {
        background-color: rgba(66, 133, 244, 0.2);
        border-left: 3px solid #4285f4;
      }
      
      .media-icon {
        width: 24px;
        height: 24px;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .media-details {
        flex: 1;
      }
      
      .media-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .media-type {
        font-size: 12px;
        color: #666;
      }
      
      .empty-message {
        text-align: center;
        padding: 20px;
        color: #666;
        font-style: italic;
      }
      
      /* Dark mode styles */
      :host(.dark-mode) {
        color: #f5f5f5;
        background-color: #1e1e1e;
      }
      
      :host(.dark-mode) .sidebar-header,
      :host(.dark-mode) .sidebar-filter,
      :host(.dark-mode) .sidebar-tabs {
        background-color: #2a2a2a;
        border-color: #444;
      }
      
      :host(.dark-mode) .sidebar-title {
        color: #f5f5f5;
      }
      
      :host(.dark-mode) .filter-input {
        background-color: #333;
        border-color: #444;
        color: #f5f5f5;
      }
      
      :host(.dark-mode) .sidebar-tab:hover {
        background-color: #333;
      }
      
      :host(.dark-mode) .sidebar-tab.active {
        border-color: #5c6bc0;
        color: #5c6bc0;
      }
      
      :host(.dark-mode) .media-item {
        background: rgba(255, 255, 255, 0.05);
      }
      
      :host(.dark-mode) .media-item:hover {
        background-color: rgba(92, 107, 192, 0.2);
      }
      
      :host(.dark-mode) .media-item.active {
        background-color: rgba(92, 107, 192, 0.3);
        border-left-color: #5c6bc0;
      }
      
      :host(.dark-mode) .media-type {
        color: #aaa;
      }
      
      :host(.dark-mode) .empty-message {
        color: #aaa;
      }
    `;
    
    const html = `
      <div class="sidebar-container">
        <div class="sidebar-header">
          <h2 class="sidebar-title">Media Library</h2>
        </div>
        
        <div class="sidebar-filter">
          <input type="text" class="filter-input" placeholder="Search media...">
        </div>
        
        <div class="sidebar-tabs">
          <div class="sidebar-tab active" data-tab="all">All</div>
          <div class="sidebar-tab" data-tab="videos">Videos</div>
          <div class="sidebar-tab" data-tab="images">Images</div>
        </div>
        
        <ul class="media-list">
          <!-- Media items will be rendered here -->
        </ul>
      </div>
    `;
    
    // Render the component
    this.shadowRoot.innerHTML = `<style>${styles}</style>${html}`;
  }
  
  _cacheElements() {
    this.container = this.shadowRoot.querySelector('.sidebar-container');
    this.title = this.shadowRoot.querySelector('.sidebar-title');
    this.filterInput = this.shadowRoot.querySelector('.filter-input');
    this.tabs = this.shadowRoot.querySelectorAll('.sidebar-tab');
    this.mediaList = this.shadowRoot.querySelector('.media-list');
    
    console.log('Media sidebar elements cached:', {
      container: !!this.container,
      title: !!this.title,
      filterInput: !!this.filterInput,
      tabs: this.tabs?.length,
      mediaList: !!this.mediaList
    });
  }
  
  _initializeEventListeners() {
    // Filter input
    if (this.filterInput) {
      this.filterInput.addEventListener('input', this._onFilterChange);
    }
    
    // Tabs
    if (this.tabs) {
      this.tabs.forEach(tab => {
        tab.addEventListener('click', this._onTabClick);
      });
    }
    
    // Listen for dark mode changes
    document.addEventListener('dark-mode-change', this._onDarkModeChange);
  }
  
  _removeEventListeners() {
    // Filter input
    if (this.filterInput) {
      this.filterInput.removeEventListener('input', this._onFilterChange);
    }
    
    // Tabs
    if (this.tabs) {
      this.tabs.forEach(tab => {
        tab.removeEventListener('click', this._onTabClick);
      });
    }
    
    // Remove media item click listeners
    this._removeMediaItemListeners();
    
    // Dark mode
    document.removeEventListener('dark-mode-change', this._onDarkModeChange);
  }
  
  _onFilterChange(event) {
    this._filter = event.target.value.toLowerCase();
    this._renderMediaItems();
  }
  
  _onTabClick(event) {
    const tab = event.currentTarget;
    const tabType = tab.dataset.tab;
    
    // Update active tab
    this._activeTab = tabType;
    
    // Update UI
    this.tabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabType);
    });
    
    // Re-render media items
    this._renderMediaItems();
  }
  
  _onMediaItemClick(event) {
    const item = event.currentTarget;
    const itemId = item.dataset.id;
    
    // Update active item
    this._activeItemId = itemId;
    this._updateActiveItem();
    
    // Find the selected media item
    const mediaItem = this._mediaItems.find(media => media.id === itemId);
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('media-selected', {
      bubbles: true,
      composed: true,
      detail: mediaItem
    }));
  }
  
  _onDarkModeChange(event) {
    this._darkMode = event.detail.darkMode;
    this._updateDarkMode();
  }
  
  _updateDarkMode() {
    if (this._darkMode) {
      this.classList.add('dark-mode');
    } else {
      this.classList.remove('dark-mode');
    }
  }
  
  _updateActiveItem() {
    if (!this.mediaList) return;
    
    // Remove active class from all items
    const items = this.mediaList.querySelectorAll('.media-item');
    items.forEach(item => {
      item.classList.toggle('active', item.dataset.id === this._activeItemId);
    });
    
    // Scroll active item into view
    const activeItem = this.mediaList.querySelector(`.media-item[data-id="${this._activeItemId}"]`);
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  
  _removeMediaItemListeners() {
    if (!this.mediaList) return;
    
    const items = this.mediaList.querySelectorAll('.media-item');
    items.forEach(item => {
      item.removeEventListener('click', this._onMediaItemClick);
    });
  }
  
  _renderMediaItems() {
    if (!this.mediaList) {
      console.error('Media list element not found');
      return;
    }
    
    console.log('Rendering media items:', this._mediaItems.length, 'Active tab:', this._activeTab);
    
    // Remove existing event listeners
    this._removeMediaItemListeners();
    
    // Filter media items based on active tab and search filter
    const filteredItems = this._mediaItems.filter(item => {
      // Filter by tab
      if (this._activeTab !== 'all' && item.type !== this._activeTab) {
        return false;
      }
      
      // Filter by search text
      if (this._filter && !item.name.toLowerCase().includes(this._filter.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    console.log('Filtered items:', filteredItems.length);
    
    // Clear the list first
    this.mediaList.innerHTML = '';
    
    // Create and append items
    if (filteredItems.length === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'No media items found';
      this.mediaList.appendChild(emptyMessage);
    } else {
      // Group items by category
      const groupedItems = this._groupItemsByCategory(filteredItems);
      
      // Render each category
      Object.keys(groupedItems).forEach(category => {
        // Create category header
        const categoryHeader = document.createElement('li');
        categoryHeader.className = 'category-header';
        categoryHeader.dataset.category = category;
        
        // Create header content
        const headerContent = document.createElement('div');
        headerContent.className = 'category-header-content';
        
        // Create header title
        const headerTitle = document.createElement('span');
        headerTitle.className = 'category-title';
        headerTitle.textContent = this._formatCategoryName(category);
        
        // Create toggle icon
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'category-toggle';
        toggleIcon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7,15L12,10L17,15H7Z" fill="currentColor"/></svg>';
        
        // Assemble header
        headerContent.appendChild(headerTitle);
        headerContent.appendChild(toggleIcon);
        categoryHeader.appendChild(headerContent);
        
        // Add click event listener
        categoryHeader.addEventListener('click', this._onCategoryHeaderClick);
        
        // Add to list
        this.mediaList.appendChild(categoryHeader);
        
        // Create category items container
        const categoryItems = document.createElement('ul');
        categoryItems.className = 'category-items expanded'; // Start expanded by default
        
        // Add items to category
        groupedItems[category].forEach(item => {
          const li = document.createElement('li');
          li.className = `media-item ${item.id === this._activeItemId ? 'active' : ''}`;
          li.dataset.id = item.id;
          li.dataset.type = item.type;
          li.dataset.category = item.category;
          
          const iconDiv = document.createElement('div');
          iconDiv.className = 'media-icon';
          iconDiv.innerHTML = this._getIconSvg(item.type);
          
          const detailsDiv = document.createElement('div');
          detailsDiv.className = 'media-details';
          
          const nameDiv = document.createElement('div');
          nameDiv.className = 'media-name';
          nameDiv.textContent = item.name;
          
          const typeDiv = document.createElement('div');
          typeDiv.className = 'media-type';
          typeDiv.textContent = this._getMediaTypeLabel(item.type);
          
          detailsDiv.appendChild(nameDiv);
          detailsDiv.appendChild(typeDiv);
          
          li.appendChild(iconDiv);
          li.appendChild(detailsDiv);
          
          // Add click event listener
          li.addEventListener('click', this._onMediaItemClick);
          
          categoryItems.appendChild(li);
        });
        
        // Add category items to list
        this.mediaList.appendChild(categoryItems);
      });
    }
  }
  
  /**
   * Group items by category
   */
  _groupItemsByCategory(items) {
    const grouped = {};
    
    items.forEach(item => {
      const category = item.category || 'uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return grouped;
  }
  
  /**
   * Format category name for display
   */
  _formatCategoryName(category) {
    if (!category) return 'Uncategorized';
    
    // Replace hyphens with spaces and capitalize each word
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Handle category header click
   */
  _onCategoryHeaderClick(event) {
    const header = event.currentTarget;
    const categoryItems = header.nextElementSibling;
    
    if (categoryItems && categoryItems.classList.contains('category-items')) {
      // Toggle expanded state
      const isExpanded = categoryItems.classList.toggle('expanded');
      
      // Update toggle icon
      const toggleIcon = header.querySelector('.category-toggle');
      if (toggleIcon) {
        toggleIcon.innerHTML = isExpanded
          ? '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7,15L12,10L17,15H7Z" fill="currentColor"/></svg>'
          : '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7,10L12,15L17,10H7Z" fill="currentColor"/></svg>';
      }
    }
  }
  
  _getIconSvg(type) {
    switch (type) {
      case 'videos':
        return `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
            <polygon points="10 9 16 12 10 15"></polygon>
          </svg>
        `;
      case 'images':
        return `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        `;
      default:
        return `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        `;
    }
  }
  
  _getMediaTypeLabel(type) {
    switch (type) {
      case 'videos':
        return 'Video';
      case 'images':
        return 'Image';
      default:
        return 'File';
    }
  }
  
  // Public API methods
  setMediaItems(items) {
    console.log('Setting media items:', items ? items.length : 0);
    this._mediaItems = Array.isArray(items) ? items : [];
    this._renderMediaItems();
  }
  
  getActiveItem() {
    return this._mediaItems.find(item => item.id === this._activeItemId) || null;
  }
  
  setActiveItem(itemId) {
    this._activeItemId = itemId;
    this._updateActiveItem();
  }
  
  setFilter(filter) {
    this._filter = filter.toLowerCase();
    if (this.filterInput) {
      this.filterInput.value = filter;
    }
    this._renderMediaItems();
  }
  
  setActiveTab(tab) {
    if (['all', 'videos', 'images'].includes(tab)) {
      this._activeTab = tab;
      
      // Update UI
      this.tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
      });
      
      // Re-render media items
      this._renderMediaItems();
    }
  }
}

customElements.define('media-sidebar', MediaSidebar); 