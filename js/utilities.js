/**
 * Media Viewer Utilities
 * Common functionality used across the media viewer application
 */

const MediaViewerUtils = {
  /**
   * Toggle dark mode for the application
   * @param {boolean} isDarkMode - Whether to enable or disable dark mode
   * @returns {boolean} The new dark mode state
   */
  toggleDarkMode(forceDarkMode = null) {
    // Get the current state if not forcing a specific state
    let isDarkMode = forceDarkMode !== null ? forceDarkMode : document.body.classList.contains('dark-mode');
    
    if (forceDarkMode === null) {
      // Toggle the state if not forcing
      isDarkMode = !isDarkMode;
    }
    
    // Update document body
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Save preference
    localStorage.setItem('darkMode', isDarkMode);
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('dark-mode-change', {
      bubbles: true,
      detail: {
        darkMode: isDarkMode
      }
    }));
    
    return isDarkMode;
  },
  
  /**
   * Format time in seconds to MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  },
  
  /**
   * Check if a URL is from a specific domain
   * @param {string} url - URL to check
   * @param {string} domain - Domain to check against
   * @returns {boolean} Whether the URL is from the specified domain
   */
  isUrlFromDomain(url, domain) {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes(domain);
    } catch (e) {
      return false;
    }
  },
  
  /**
   * Get file extension from a URL or path
   * @param {string} path - URL or path
   * @returns {string} File extension
   */
  getFileExtension(path) {
    if (!path) return '';
    const parts = path.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  },
  
  /**
   * Debounce function to limit how often a function is called
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },
  
  /**
   * Notify that media has changed
   * @param {Object} mediaItem - The media item that was selected
   */
  notifyMediaChanged(mediaItem) {
    if (!mediaItem) return;
    
    document.dispatchEvent(new CustomEvent('media-changed', {
      bubbles: true,
      detail: { 
        mediaType: mediaItem.type,
        mediaItem: mediaItem
      }
    }));
  },
  
  /**
   * Initialize dark mode based on saved preference
   */
  initDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    }
    return isDarkMode;
  }
};

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaViewerUtils;
} 