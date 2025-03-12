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
        border-bottom: 1px solid #e0e0e0;
      }
      
      .filter-input {
        width: 90%;
        padding: 8px 10px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 14px;
        outline: none;
        background-color: var(--background-color);
      }
      
      .filter-input:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
      }
      
      .sidebar-tabs {
        display: flex;
        border-bottom: 1px solid #e0e0e0;
      }
      
      .sidebar-tab {
        flex: 1;
        padding: 10px;
        text-align: center;
        cursor: pointer;
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }
      
      .sidebar-tab:hover {
        background-color: #f9f9f9;
      }
      
      .sidebar-tab.active {
        border-bottom-color: #3498db;
        color: #3498db;
        font-weight: bold;
      }
      
      .sidebar-content {
        flex: 1;
        overflow-y: auto;
        background-color: #fff;
      }
      
      .media-list {
        list-style: none;
        margin: 0;
        padding: 0;
        overflow-y: auto;
        height: calc(100% - 150px);  /* Account for header, filter, and tabs */
        max-height: 630px;
      }
      
      .group-header {
        padding: 12px 15px;
        cursor: pointer;
        border-bottom: 1px solid var(--border-color);
        user-select: none;
      }
      
      .group-header.type-group-header {
        font-weight: bold;
        font-size: 16px;
        color: #333;
        padding: 15px;
        border-top: 1px solid var(--border-color);
      }
      
      .group-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .group-title {
        flex: 1;
      }
      
      .group-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }
      
      .group-items {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }
      
      .group-items.expanded {
        max-height: 1000px;
      }
      
      .media-item {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        border-bottom: 1px solid #e0e0e0;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .media-item:hover {
        background-color: #f9f9f9;
      }
      
      .media-item.active {
        background-color: #e1f0fa;
        border-left: 4px solid #3498db;
      }
      
      .media-thumbnail {
        width: 60px;
        height: 40px;
        margin-right: 10px;
        object-fit: cover;
        border-radius: 4px;
        background-color: #eee;
      }
      
      .media-info {
        flex: 1;
        overflow: hidden;
      }
      
      .media-name {
        font-weight: bold;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .media-description {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .media-type-icon {
        margin-left: 10px;
        color: #999;
      }
      
      .empty-message {
        padding: 20px;
        text-align: center;
        color: #999;
        font-style: italic;
      }
      
      /* Dark mode styles */
      :host([dark-mode]) {
        color: #eee;
        background-color: #222;
      }
      
      :host([dark-mode]) .sidebar-header,
      :host([dark-mode]) .sidebar-filter,
      :host([dark-mode]) .sidebar-tabs,
      :host([dark-mode]) .sidebar-content {
        background-color: #333;
        border-color: #444;
      }
      
      :host([dark-mode]) .sidebar-title {
        color: #eee;
      }
      
      :host([dark-mode]) .filter-input {
        background-color: #444;
        border-color: #555;
        color: #eee;
      }
      
      :host([dark-mode]) .filter-input:focus {
        border-color: #4dabf7;
        box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.2);
      }
      
      :host([dark-mode]) .sidebar-tab {
        color: #ddd;
      }
      
      :host([dark-mode]) .sidebar-tab:hover {
        background-color: #3a3a3a;
      }
      
      :host([dark-mode]) .sidebar-tab.active {
        border-bottom-color: #4dabf7;
        color: #4dabf7;
      }
      
      :host([dark-mode]) .group-header {
        background-color: #2a2a2a;
        border-color: #444;
        color: #eee;
      }
      
      :host([dark-mode]) .group-header.type-group-header {
        background-color: #222;
        color: #eee;
        border-color: #444;
      }
      
      :host([dark-mode]) .media-item {
        border-color: #444;
      }
      
      :host([dark-mode]) .media-item:hover {
        background-color: #3a3a3a;
      }
      
      :host([dark-mode]) .media-item.active {
        background-color: #2c3e50;
        border-left-color: #4dabf7;
      }
      
      :host([dark-mode]) .media-description {
        color: #aaa;
      }
      
      :host([dark-mode]) .empty-message {
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
    
    // Debug: Log all media items
    console.log('All media items:', JSON.stringify(this._mediaItems.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      category: item.category
    }))));
    
    // Remove existing event listeners
    this._removeMediaItemListeners();
    
    // Filter media items based on active tab and search filter
    const filteredItems = this._mediaItems.filter(item => {
      // Filter by tab
      if (this._activeTab === 'wallpapers') {
        // For wallpapers tab, only show items with category 'wallpapers'
        if (item.category !== 'wallpapers') {
          console.log(`Filtering out item ${item.id} because it's not in wallpapers category`);
          return false;
        }
      } else if (this._activeTab !== 'all' && item.type !== this._activeTab) {
        // For other tabs, filter by type
        console.log(`Filtering out item ${item.id} because tab ${this._activeTab} doesn't match type ${item.type}`);
        return false;
      }
      
      // Filter by search text
      if (this._filter && !item.name.toLowerCase().includes(this._filter.toLowerCase())) {
        console.log(`Filtering out item ${item.id} because filter ${this._filter} doesn't match name ${item.name}`);
        return false;
      }
      
      return true;
    });
    
    console.log('Filtered items:', filteredItems.length);
    console.log('Filtered items details:', JSON.stringify(filteredItems.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      category: item.category
    }))));
    
    // Clear the list first
    this.mediaList.innerHTML = '';
    
    // Create and append items
    if (filteredItems.length === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'No media items found';
      this.mediaList.appendChild(emptyMessage);
    } else if (this._activeTab === 'wallpapers') {
      // For wallpapers tab, display items in a simple list
      console.log('Rendering wallpapers directly:', filteredItems.length);
      
      filteredItems.forEach(item => {
        const li = document.createElement('li');
        li.className = `media-item ${item.id === this._activeItemId ? 'active' : ''}`;
        li.dataset.id = item.id;
        
        // Create thumbnail
        const thumbnail = document.createElement('img');
        thumbnail.className = 'media-thumbnail';
        thumbnail.src = item.thumbnail || this._getDefaultThumbnail(item.type);
        thumbnail.alt = item.name;
        
        // Create info container
        const info = document.createElement('div');
        info.className = 'media-info';
        
        // Create name
        const name = document.createElement('div');
        name.className = 'media-name';
        name.textContent = item.name;
        
        // Assemble info
        info.appendChild(name);
        
        // Assemble item
        li.appendChild(thumbnail);
        li.appendChild(info);
        
        // Add event listener
        li.addEventListener('click', this._onMediaItemClick);
        
        this.mediaList.appendChild(li);
      });
    } else {
      // Group items by type and then by category
      const groupedItems = this._groupItemsByCategory(filteredItems);
      
      // Render each group
      Object.keys(groupedItems).forEach(group => {
        const groupData = groupedItems[group];
        
        // Create group header
        const groupHeader = document.createElement('li');
        groupHeader.className = 'group-header';
        groupHeader.dataset.group = group;
        
        // Add special class for type groups
        if (groupData.isTypeGroup) {
          groupHeader.classList.add('type-group-header');
        }
        
        // Create header content
        
        // Create header title
        
        if (this._formatGroupName(group) ) {
          
          const headerContent = document.createElement('div');
          headerContent.className = 'group-header-content';

          const headerTitle = document.createElement('span');
          headerTitle.className = 'group-title';
          headerTitle.textContent = this._formatGroupName(group);

          // Create toggle icon
          const toggleIcon = document.createElement('span');
          toggleIcon.className = 'group-toggle';
          toggleIcon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7,15L12,10L17,15H7Z" fill="currentColor"/></svg>';
          
          // Assemble header
          headerContent.appendChild(headerTitle);
          headerContent.appendChild(toggleIcon);
          groupHeader.appendChild(headerContent);
          
          // Add click event listener
          groupHeader.addEventListener('click', this._onCategoryHeaderClick);
          
          // Add to list
          this.mediaList.appendChild(groupHeader);
          
        }
        // Skip rendering items for type groups (they're just headers)
        if (groupData.isTypeGroup) {
          return;
        }
        
        // Create group items container
        const groupItems = document.createElement('ul');
        groupItems.className = 'group-items expanded'; // Start expanded by default
        
        // Add items to group
        if (Array.isArray(groupData.items)) {
          groupData.items.forEach(item => {
            const li = document.createElement('li');
            li.className = `media-item ${item.id === this._activeItemId ? 'active' : ''}`;
            li.dataset.id = item.id;
            
            // Create thumbnail
            const thumbnail = document.createElement('img');
            thumbnail.className = 'media-thumbnail';
            thumbnail.src = item.thumbnail || this._getDefaultThumbnail(item.type);
            thumbnail.alt = item.name;
            
            // Create info container
            const info = document.createElement('div');
            info.className = 'media-info';
            
            // Create name
            const name = document.createElement('div');
            name.className = 'media-name';
            name.textContent = item.name;
            
            // Create description
            const description = document.createElement('div');
            description.className = 'media-description';
            description.textContent = item.description || '';
            
            // Assemble info
            info.appendChild(name);
            info.appendChild(description);
            
            // Create type icon
            const typeIcon = document.createElement('div');
            typeIcon.className = 'media-type-icon';
            typeIcon.innerHTML = this._getIconSvg(item.type);
            
            // Assemble item
            li.appendChild(thumbnail);
            li.appendChild(info);
            li.appendChild(typeIcon);
            
            // Add event listener
            li.addEventListener('click', this._onMediaItemClick);
            
            groupItems.appendChild(li);
          });
        } else {
          console.warn(`Group ${group} has no items array:`, groupData);
        }
        
        // Add group items to list
        this.mediaList.appendChild(groupItems);
      });
    }
  }
  
  /**
   * Group items by type and then by category
   */
  _groupItemsByCategory(items) {
    const grouped = {};
    
    console.log('Grouping items by category:', items.length);
    
    // First group by type (videos, images)
    const typeGroups = {
      videos: [],
      images: []
    };
    
    items.forEach(item => {
      if (item.type && typeGroups[item.type] !== undefined) {
        typeGroups[item.type].push(item);
      } else {
        // If type is not recognized, add to a default group
        if (!typeGroups['other']) typeGroups['other'] = [];
        typeGroups['other'].push(item);
      }
    });
    
    console.log('Type groups:', Object.keys(typeGroups).map(type => `${type}: ${typeGroups[type].length}`));
    
    // Then for each type, group by category
    Object.keys(typeGroups).forEach(type => {
      if (typeGroups[type].length > 0) {
        const typeKey = `type-${type}`;
        grouped[typeKey] = { 
          isTypeGroup: true,
          type: type,
          items: []
        };
        
        // Group items within this type by category
        const categoryGroups = {};
        typeGroups[type].forEach(item => {
          const category = item.category || 'uncategorized';
          if (!categoryGroups[category]) {
            categoryGroups[category] = [];
          }
          categoryGroups[category].push(item);
        });
        
        console.log(`Categories for ${type}:`, Object.keys(categoryGroups).map(cat => `${cat}: ${categoryGroups[cat].length}`));
        
        // Add category groups to the type group
        Object.keys(categoryGroups).forEach(category => {
          grouped[`${typeKey}-${category}`] = {
            isTypeGroup: false,
            type: type,
            category: category,
            items: categoryGroups[category]
          };
        });
      }
    });
    
    return grouped;
  }
  
  /**
   * Format group name for display
   */
  _formatGroupName(group) {
    if (!group) return 'Uncategorized';
    
    // Check if this is a type group
    if (group.startsWith('type-')) {
      const type = group.replace('type-', '');
      return this._getMediaTypeLabel(type);
    }
    
    // Check if this is a category within a type
    if (group.includes('-')) {
      const parts = group.split('-');
      if (parts.length >= 3) {
        const category = parts.slice(2).join('-');
        return this._formatCategoryName(category);
      }
    }
    
    // Default formatting
    return group
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
   * Handle group header click
   */
  _onCategoryHeaderClick(event) {
    const header = event.currentTarget;
    const groupItems = header.nextElementSibling;
    
    if (groupItems && groupItems.classList.contains('group-items')) {
      // Toggle expanded state
      const isExpanded = groupItems.classList.toggle('expanded');
      
      // Update toggle icon
      const toggleIcon = header.querySelector('.group-toggle');
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
        return '';
    }
  }
  
  /**
   * Get default thumbnail for media type
   */
  _getDefaultThumbnail(type) {
    switch (type) {
      case 'videos':
        return '/assets/thumbnails/video-default.jpg';
      case 'images':
        return '/assets/thumbnails/image-default.jpg';
      default:
        return '/assets/thumbnails/media-default.jpg';
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
    if (['all', 'videos', 'images', 'wallpapers'].includes(tab)) {
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