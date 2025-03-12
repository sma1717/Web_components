/**
 * Media Viewer Data
 * Contains all media items for the application
 */

const MediaData = {
  /**
   * Get all media items
   * @returns {Array} Array of media items
   */
  getAllItems() {
    // Default media items
    const defaultItems = [
      // Videos
      {
        id: 'video1',
        name: 'Volcano',
        src: 'Volcano',
        format: 'mp4',
        type: 'videos',
        category: 'offline-videos',
        thumbnail: 'https://picsum.photos/id/60/300/200',
        description: 'Dramatic footage of an active volcano with flowing lava.'
      },
      {
        id: 'video2',
        name: 'Forest',
        src: 'Forest',
        format: 'mp4',
        type: 'videos',
        category: 'offline-videos',
        thumbnail: 'https://picsum.photos/id/70/300/200',
        description: 'Peaceful scenes from a lush green forest.'
      },
      {
        id: 'video3',
        name: 'Forest 1',
        src: 'Forest_1',
        format: 'mp4',
        type: 'videos',
        category: 'offline-videos',
        thumbnail: 'https://picsum.photos/id/80/300/200',
        description: 'Additional footage of forest landscapes and wildlife.'
      },
      {
        id: 'video4',
        name: 'Penguins',
        src: 'Penguins',
        format: 'mp4',
        type: 'videos',
        category: 'offline-videos',
        thumbnail: 'https://picsum.photos/id/50/300/200',
        description: 'Adorable penguins in their natural habitat.'
      },
      {
        id: 'video5',
        name: 'Deep Sea Fish Play 1',
        src: 'Deep_sea_fish_play_1',
        format: 'mp4',
        type: 'videos',
        category: 'offline-videos',
        thumbnail: 'https://picsum.photos/id/10/300/200',
        description: 'Fascinating deep sea fish in their natural environment.'
      },
      {
        id: 'video6',
        name: 'Deep Sea Fish Play 2',
        src: 'Deep_sea_fish_play_2',
        format: 'mp4',
        type: 'videos',
        category: 'offline-videos',
        thumbnail: 'https://picsum.photos/id/20/300/200',
        description: 'More footage of exotic deep sea creatures.'
      },
      {
        id: 'video7',
        name: 'Deep Sea Fish Play 3',
        src: 'Deep_sea_fish_play_3',
        format: 'mp4',
        type: 'videos',
        category: 'offline-videos',
        thumbnail: 'https://picsum.photos/id/30/300/200',
        description: 'Continued exploration of deep sea marine life.'
      },
      {
        id: 'video8',
        name: 'Deep Sea Fish Play 4',
        src: 'Deep_sea_fish_play_4',
        format: 'mp4',
        type: 'videos',
        category: 'offline-videos',
        thumbnail: 'https://picsum.photos/id/40/300/200',
        description: 'Final part of the deep sea fish documentary series.'
      },
      
      // Online Videos
      {
        id: 'online-video1',
        name: 'WorkDrive video',
        src: 'https://files-accl.zohoexternal.com/public/workdrive-external/download/tq6dddf0d9c7d441c4d2ca650b5fcc6857744',
        // src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        id: 'video-1',
        name: 'Big Buck Bunny',
        src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'videos',
        category: 'online-videos',
        thumbnail: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
        description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.'
      },
      {
        id: 'video-2',
        name: 'Elephant Dream',
        src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'videos',
        category: 'online-videos',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Elephants_Dream_s5_both.jpg',
        description: 'The first Blender Open Movie from 2006.'
      },
      {
        id: 'video-3',
        name: 'Sintel',
        src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        type: 'videos',
        category: 'online-videos',
        thumbnail: 'https://durian.blender.org/wp-content/uploads/2010/05/sintel-0.jpg',
        description: 'Sintel is a fantasy computer animated short film.'
      },
      
      // Wallpapers
      {
        id: 'wallpaper-1',
        name: 'Wallpaper 1',
        src: '/assets/images/wallpaperflare.com_wallpaper%20(1).jpg',
        type: 'images',
        category: 'wallpapers',
        thumbnail: '/assets/images/wallpaperflare.com_wallpaper%20(1).jpg',
        description: 'Beautiful tropical beach with palm trees'
      },
      {
        id: 'wallpaper-2',
        name: 'Wallpaper 2',
        src: '/assets/images/wallpaperflare.com_wallpaper%20(2).jpg',
        type: 'images',
        category: 'wallpapers',
        thumbnail: '/assets/images/wallpaperflare.com_wallpaper%20(2).jpg',
        description: 'Serene mountain lake at sunset'
      },
      {
        id: 'wallpaper-3',
        name: 'Wallpaper 3',
        src: '/assets/images/wallpaperflare.com_wallpaper%20(3).jpg',
        type: 'images',
        category: 'wallpapers',
        thumbnail: '/assets/images/wallpaperflare.com_wallpaper%20(3).jpg',
        description: 'Peaceful forest path with sunlight'
      },
      {
        id: 'wallpaper-4',
        name: 'Wallpaper 4',
        src: '/assets/images/wallpaperflare.com_wallpaper%20(4).jpg',
        type: 'images',
        category: 'wallpapers',
        thumbnail: '/assets/images/wallpaperflare.com_wallpaper%20(4).jpg',
        description: 'Stunning ocean sunset with vibrant colors'
      },
      {
        id: 'wallpaper-5',
        name: 'Wallpaper 5',
        src: '/assets/images/wallpaperflare.com_wallpaper%20(5).jpg',
        type: 'images',
        category: 'wallpapers',
        thumbnail: '/assets/images/wallpaperflare.com_wallpaper%20(5).jpg',
        description: 'Majestic mountain range with snow caps'
      },
      {
        id: 'wallpaper-6',
        name: 'Wallpaper 6',
        src: '/assets/images/wallpaperflare.com_wallpaper%20(6).jpg',
        type: 'images',
        category: 'wallpapers',
        thumbnail: '/assets/images/wallpaperflare.com_wallpaper%20(6).jpg',
        description: 'Peaceful forest path with sunlight'
      },
      {
        id: 'wallpaper-7',
        name: 'Wallpaper 7',
        src: '/assets/images/wallpaperflare.com_wallpaper%20(7).jpg',
        type: 'images',
        category: 'wallpapers',
        thumbnail: '/assets/images/wallpaperflare.com_wallpaper%20(7).jpg',
        description: 'Peaceful forest path with sunlight'
      },
      {
        id: 'wallpaper-8',
        name: 'Wallpaper 8',
        src: '/assets/images/wallpaperflare.com_wallpaper%20(8).jpg',
        type: 'images',
        category: 'wallpapers',
        thumbnail: '/assets/images/wallpaperflare.com_wallpaper%20(8).jpg',
        description: 'Peaceful forest path with sunlight'
      },
      {
        id: 'wallpaper-9',
        name: 'Wallpaper 9',
        src: '/assets/images/wallpaperflare.com_wallpaper%20(9).jpg',
        type: 'images',
        category: 'wallpapers',
        thumbnail: '/assets/images/wallpaperflare.com_wallpaper%20(9).jpg',
        description: 'Peaceful forest path with sunlight'
      },
      {
        id: 'wallpaper-10',
        name: 'Wallpaper 10',
        src: '/assets/images/wallpaperflare.com_wallpaper%20(10).jpg',
        type: 'images',
        category: 'wallpapers',
        thumbnail: '/assets/images/wallpaperflare.com_wallpaper%20(10).jpg',
        description: 'Peaceful forest path with sunlight'
      },
      {
        id: 'wallpaper-11',
        name: 'Wallpaper 11',
        src: '/assets/images/wallpaperflare.com_wallpaper%20(11).jpg',
        type: 'images',
        category: 'wallpapers',
        thumbnail: '/assets/images/wallpaperflare.com_wallpaper%20(11).jpg',
        description: 'Peaceful forest path with sunlight'
      }
    ];
    
    return defaultItems;
  },
  
  /**
   * Get media items by category
   * @param {string} category - Category to filter by
   * @returns {Array} Filtered array of media items
   */
  getItemsByCategory(category) {
    if (!category) return this.getAllItems();
    return this.getAllItems().filter(item => item.category === category);
  },
  
  /**
   * Get media items by type
   * @param {string} type - Type to filter by (videos, images)
   * @returns {Array} Filtered array of media items
   */
  getItemsByType(type) {
    if (!type) return this.getAllItems();
    return this.getAllItems().filter(item => item.type === type);
  },
  
  /**
   * Search media items by name
   * @param {string} query - Search query
   * @returns {Array} Filtered array of media items
   */
  searchItems(query) {
    if (!query) return this.getAllItems();
    const lowerQuery = query.toLowerCase();
    return this.getAllItems().filter(item => 
      item.name.toLowerCase().includes(lowerQuery) || 
      (item.description && item.description.toLowerCase().includes(lowerQuery))
    );
  },
  
  /**
   * Get item by ID
   * @param {string} id - Item ID
   * @returns {Object|null} Media item or null if not found
   */
  getItemById(id) {
    if (!id) return null;
    return this.getAllItems().find(item => item.id === id) || null;
  }
};

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaData;
} 