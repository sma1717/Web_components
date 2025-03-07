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
    return [
      // Local Videos
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
        type: 'videos',
        category: 'online-videos',
        thumbnail: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
        description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.'
      },
      {
        id: 'online-video2',
        name: 'Elephant Dream',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'videos',
        category: 'online-videos',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/320px-Elephants_Dream_s5_both.jpg',
        description: 'The first Blender Open Movie from 2006.'
      },
      {
        id: 'online-video3',
        name: 'Sintel',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        type: 'videos',
        category: 'online-videos',
        thumbnail: 'https://durian.blender.org/wp-content/uploads/2010/05/sintel-0440.jpg',
        description: 'Third Blender Open Movie from 2010.'
      },
      {
        id: 'online-video4',
        name: 'Tears of Steel',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        type: 'videos',
        category: 'online-videos',
        thumbnail: 'https://mango.blender.org/wp-content/uploads/2012/09/01_thom_celia_bridge.jpg',
        description: 'Tears of Steel was realized with crowd-funding by users of the open source 3D creation tool Blender.'
      },
      
      // High-Quality Images
      {
        id: 'image1',
        name: 'Mountain View',
        src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        type: 'images',
        category: 'nature',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
        description: 'Breathtaking view of mountains during sunset.'
      },
      {
        id: 'image2',
        name: 'Ocean Waves',
        src: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1626&q=80',
        type: 'images',
        category: 'nature',
        thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
        description: 'Serene ocean waves crashing on the shore.'
      },
      {
        id: 'image3',
        name: 'Desert Sunset',
        src: 'https://images.unsplash.com/photo-1682686581362-796145f0e123?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        type: 'images',
        category: 'nature',
        thumbnail: 'https://images.unsplash.com/photo-1682686581362-796145f0e123?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
        description: 'Stunning sunset over a vast desert landscape.'
      },
      {
        id: 'image4',
        name: 'Northern Lights',
        src: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        type: 'images',
        category: 'nature',
        thumbnail: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
        description: 'Magical northern lights illuminating the night sky.'
      },
      {
        id: 'image5',
        name: 'City Skyline',
        src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80',
        type: 'images',
        category: 'urban',
        thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
        description: 'Impressive city skyline with modern architecture.'
      },
      {
        id: 'image6',
        name: 'Architecture',
        src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        type: 'images',
        category: 'urban',
        thumbnail: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
        description: 'Fascinating architectural details of modern buildings.'
      }
    ];
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