const http = require('http');
const fs = require('fs');
const path = require('path');

// Server port
const PORT = 1122;

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime'
};

// Media file extensions
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

// Ensure directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Initialize media directories
function initializeMediaDirectories() {
  const assetsDir = path.join(__dirname, 'assets');
  const videosDir = path.join(assetsDir, 'videos');
  const imagesDir = path.join(assetsDir, 'images');
  const thumbnailsDir = path.join(assetsDir, 'thumbnails');
  
  ensureDirectoryExists(assetsDir);
  ensureDirectoryExists(videosDir);
  ensureDirectoryExists(imagesDir);
  ensureDirectoryExists(thumbnailsDir);
  
  // Create subdirectories for categories
  ensureDirectoryExists(path.join(videosDir, 'offline-videos'));
  ensureDirectoryExists(path.join(videosDir, 'online-videos'));
  ensureDirectoryExists(path.join(imagesDir, 'photos'));
  
  // Create default thumbnails if they don't exist
  createDefaultThumbnail(path.join(thumbnailsDir, 'video-default.jpg'), 'video');
  createDefaultThumbnail(path.join(thumbnailsDir, 'image-default.jpg'), 'image');
  createDefaultThumbnail(path.join(thumbnailsDir, 'media-default.jpg'), 'media');
}

// Create a default thumbnail with text
function createDefaultThumbnail(filePath, type) {
  if (fs.existsSync(filePath)) {
    return; // Thumbnail already exists
  }
  
  // Create a simple text file as a placeholder
  // In a real application, you would generate an actual image
  const content = `Default ${type} thumbnail placeholder`;
  fs.writeFileSync(filePath, content);
  console.log(`Created default ${type} thumbnail at ${filePath}`);
}

// Organize media files by type
function organizeMediaFiles() {
  const assetsDir = path.join(__dirname, 'assets');
  const videosDir = path.join(assetsDir, 'videos');
  const imagesDir = path.join(assetsDir, 'images');
  
  // Function to recursively scan directories
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && 
          entry.name !== 'videos' && 
          entry.name !== 'images' && 
          entry.name !== 'thumbnails') {
        // Recursively scan subdirectories
        scanDirectory(fullPath);
      } else if (entry.isFile() && !entry.name.startsWith('.')) {
        const ext = path.extname(entry.name).toLowerCase();
        
        // Move video files to videos directory
        if (VIDEO_EXTENSIONS.includes(ext)) {
          const destPath = path.join(videosDir, 'offline-videos', entry.name);
          if (!fs.existsSync(destPath)) {
            try {
              fs.copyFileSync(fullPath, destPath);
              console.log(`Copied video file: ${entry.name} to videos/offline-videos directory`);
              // Don't delete the original to avoid breaking existing references
            } catch (error) {
              console.error(`Error copying video file ${entry.name}:`, error.message);
            }
          }
        }
        
        // Move image files to images directory
        else if (IMAGE_EXTENSIONS.includes(ext)) {
          const destPath = path.join(imagesDir, 'photos', entry.name);
          if (!fs.existsSync(destPath)) {
            try {
              fs.copyFileSync(fullPath, destPath);
              console.log(`Copied image file: ${entry.name} to images/photos directory`);
              // Don't delete the original to avoid breaking existing references
            } catch (error) {
              console.error(`Error copying image file ${entry.name}:`, error.message);
            }
          }
        }
      }
    });
  }
  
  // Start scanning from the assets directory
  scanDirectory(assetsDir);
}

// Scan for all media files and generate a media data file
function scanMediaFiles() {
  const assetsDir = path.join(__dirname, 'assets');
  const videosDir = path.join(assetsDir, 'videos');
  const imagesDir = path.join(assetsDir, 'images');
  const thumbnailsDir = path.join(assetsDir, 'thumbnails');
  
  console.log(`Scanning for media files in: ${assetsDir}`);
  console.log(`Images directory: ${imagesDir}`);
  
  const mediaData = [];
  let idCounter = 1;
  
  // Scan video directories
  if (fs.existsSync(videosDir)) {
    console.log(`Videos directory exists: ${videosDir}`);
    const videoCategories = fs.readdirSync(videosDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`Found video categories: ${videoCategories.join(', ')}`);
    
    videoCategories.forEach(category => {
      const categoryDir = path.join(videosDir, category);
      const videoFiles = fs.readdirSync(categoryDir)
        .filter(file => VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase()));
      
      console.log(`Found ${videoFiles.length} videos in category: ${category}`);
      
      videoFiles.forEach(file => {
        const fileName = path.basename(file, path.extname(file));
        mediaData.push({
          id: `video-${idCounter++}`,
          name: fileName.replace(/_/g, ' '),
          src: `/assets/videos/${category}/${file}`,
          type: 'videos',
          category: category,
          thumbnail: `/assets/thumbnails/video-default.jpg`,
          description: `${fileName.replace(/_/g, ' ')} video`
        });
      });
    });
  } else {
    console.log(`Videos directory does not exist: ${videosDir}`);
  }
  
  // Scan images directory - both subdirectories and root level images
  if (fs.existsSync(imagesDir)) {
    console.log(`Images directory exists: ${imagesDir}`);
    // First check for image files directly in the images directory
    const rootImageFiles = fs.readdirSync(imagesDir)
      .filter(file => {
        const filePath = path.join(imagesDir, file);
        return fs.statSync(filePath).isFile() && 
               IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()) &&
               !file.startsWith('.');
      });
    
    console.log(`Found ${rootImageFiles.length} images in root images directory: ${rootImageFiles.join(', ')}`);
    
    // Add root level images to the media data
    rootImageFiles.forEach(file => {
      const fileName = path.basename(file, path.extname(file));
      // Use URL-encoded file names to handle spaces and special characters
      const encodedFile = encodeURIComponent(file);
      mediaData.push({
        id: `image-${idCounter++}`,
        name: fileName.replace(/_/g, ' '),
        src: `/assets/images/${encodedFile}`,
        type: 'images',
        category: 'wallpapers',
        thumbnail: `/assets/images/${encodedFile}`,
        description: `${fileName.replace(/_/g, ' ')} image`
      });
      
      // Log each image added to help with debugging
      console.log(`Added image to media data: ${fileName} with path /assets/images/${encodedFile}`);
    });
    
    // Then check for subdirectories
    const imageCategories = fs.readdirSync(imagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    imageCategories.forEach(category => {
      const categoryDir = path.join(imagesDir, category);
      const imageFiles = fs.readdirSync(categoryDir)
        .filter(file => IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()));
      
      imageFiles.forEach(file => {
        const fileName = path.basename(file, path.extname(file));
        // Use URL-encoded file names to handle spaces and special characters
        const encodedFile = encodeURIComponent(file);
        const encodedCategory = encodeURIComponent(category);
        mediaData.push({
          id: `image-${idCounter++}`,
          name: fileName.replace(/_/g, ' '),
          src: `/assets/images/${encodedCategory}/${encodedFile}`,
          type: 'images',
          category: category,
          thumbnail: `/assets/images/${encodedCategory}/${encodedFile}`,
          description: `${fileName.replace(/_/g, ' ')} image`
        });
      });
    });
  }
  
  // Scan all other directories in assets for media files
  function scanAssetsDirectory(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const entryRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      // Skip videos, images, and thumbnails directories as they're already processed
      if (entry.isDirectory() && 
          fullPath !== videosDir && 
          fullPath !== imagesDir && 
          fullPath !== thumbnailsDir) {
        scanAssetsDirectory(fullPath, entryRelativePath);
      } else if (entry.isFile() && !entry.name.startsWith('.')) {
        const ext = path.extname(entry.name).toLowerCase();
        const fileName = path.basename(entry.name, path.extname(entry.name));
        
        // Add video files
        if (VIDEO_EXTENSIONS.includes(ext)) {
          mediaData.push({
            id: `asset-video-${idCounter++}`,
            name: fileName.replace(/_/g, ' '),
            src: `/assets/${entryRelativePath}`,
            type: 'videos',
            category: 'other-videos',
            thumbnail: `/assets/thumbnails/video-default.jpg`,
            description: `${fileName.replace(/_/g, ' ')} video from assets`
          });
        }
        
        // Add image files
        else if (IMAGE_EXTENSIONS.includes(ext)) {
          mediaData.push({
            id: `asset-image-${idCounter++}`,
            name: fileName.replace(/_/g, ' '),
            src: `/assets/${entryRelativePath}`,
            type: 'images',
            category: 'other-images',
            thumbnail: `/assets/${entryRelativePath}`,
            description: `${fileName.replace(/_/g, ' ')} image from assets`
          });
        }
      }
    });
  }
  
  // Scan the assets directory for additional media files
  scanAssetsDirectory(assetsDir);
  
  // Add online videos
  const onlineVideos = [
    {
      id: `video-${idCounter++}`,
      name: 'Big Buck Bunny',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'videos',
      category: 'online-videos',
      thumbnail: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
      description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.'
    },
    {
      id: `video-${idCounter++}`,
      name: 'Elephant Dream',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'videos',
      category: 'online-videos',
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/320px-Elephants_Dream_s5_both.jpg',
      description: 'The first Blender Open Movie from 2006.'
    },
    {
      id: `video-${idCounter++}`,
      name: 'Sintel',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      type: 'videos',
      category: 'online-videos',
      thumbnail: 'https://durian.blender.org/wp-content/uploads/2010/05/sintel-0440.jpg',
      description: 'Third Blender Open Movie from 2010.'
    }
  ];
  
  mediaData.push(...onlineVideos);
  
  console.log(`Total media items found: ${mediaData.length}`);
  
  // Write media data to file
  const mediaDataPath = path.join(__dirname, '..', 'js', 'media-data-generated.js');
  const mediaDataContent = `
/**
 * Generated Media Viewer Data
 * Contains all media items for the application
 */

const MediaDataGenerated = {
  /**
   * Get all media items
   * @returns {Array} Array of media items
   */
  getAllItems() {
    return ${JSON.stringify(mediaData, null, 2)};
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
  module.exports = MediaDataGenerated;
}
`;
  
  fs.writeFileSync(mediaDataPath, mediaDataContent);
  console.log(`Generated media data file: ${mediaDataPath}`);
  
  return mediaData;
}

// Initialize media directories
initializeMediaDirectories();

// Organize media files
organizeMediaFiles();

// Scan media files and generate data
const mediaData = scanMediaFiles();

// Create request handler
const server = http.createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Parse URL
  let url = decodeURIComponent(req.url);
  
  // Special route to list all media
  if (url === '/api/media/list') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mediaData));
    return;
  }
  
  // Special route to organize media files
  if (url === '/api/media/organize') {
    try {
      organizeMediaFiles();
      const updatedMediaData = scanMediaFiles();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Media files organized successfully', mediaCount: updatedMediaData.length }));
    } catch (error) {
      console.error('Error organizing media files:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }
  
  // Serve index.html for root path
  if (url === '/') {
    url = '/index.html';
  }
  
  // Handle video file requests
  if (url.startsWith('/assets/videos/')) {
    const videoPath = path.join(__dirname, url);
    
    // Check if file exists
    fs.stat(videoPath, (err, stats) => {
      if (err) {
        console.error(`Video file not found: ${videoPath}`);
        res.writeHead(404);
        res.end('404 Not Found');
        return;
      }
      
      // Get file extension and content type
      const ext = path.extname(videoPath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      // Set headers for video streaming
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size
      });
      
      // Create read stream and pipe to response
      const fileStream = fs.createReadStream(videoPath);
      fileStream.pipe(res);
      
      // Handle errors
      fileStream.on('error', (error) => {
        console.error(`Error streaming video: ${error.message}`);
        res.end();
      });
    });
    return;
  }
  
  // Determine file path
  let filePath;
  if (url.startsWith('/assets/')) {
    // Assets are in the server/assets directory
    filePath = path.join(__dirname, url);
    console.log(`Serving asset from server directory: ${filePath}`);
  } else {
    // Other files are in the root directory
    filePath = path.join(__dirname, '..', url);
    console.log(`Serving file from root directory: ${filePath}`);
  }
  
  // Get file extension
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        console.error(`File not found: ${filePath}`);
        console.error(`Requested URL: ${url}`);
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        // Server error
        console.error(`Server error: ${err.code}`);
        console.error(`Error details: ${err.message}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      console.log(`Successfully served: ${url}`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
