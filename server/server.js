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
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime'
};

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
  
  // Special route to list videos
  if (url === '/assets/videos/list') {
    const videosDir = path.join(__dirname, 'assets', 'videos');
    fs.readdir(videosDir, (err, files) => {
      if (err) {
        console.error('Error reading videos directory:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read videos directory' }));
        return;
      }
      
      // Filter out non-video files and hidden files
      const videoFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.webm', '.ogg', '.mov'].includes(ext) && !file.startsWith('.');
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(videoFiles));
    });
    return;
  }
  
  // Serve index.html for root path
  if (url === '/') {
    url = '/index.html';
  }
  
  // Handle video file requests
  if (url.startsWith('/assets/videos/')) {
    const videoName = path.basename(url);
    const videoPath = path.join(__dirname, 'assets', 'videos', videoName);
    
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
  } else {
    // Other files are in the root directory
    filePath = path.join(__dirname, '..', url);
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
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        // Server error
        console.error(`Server error: ${err.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Media Viewer server running at http://localhost:${PORT}`);
  console.log(`Media Viewer Demo available at http://localhost:${PORT}/media-viewer-demo.html`);
  console.log(`About page available at http://localhost:${PORT}/about.html`);
}); 