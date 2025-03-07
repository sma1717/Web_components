# Media Viewer

A modern, web-based application for viewing and managing various media types. Built with web components and modern JavaScript, it offers a responsive, customizable interface for browsing and playing videos and viewing images.

## Features

- **Media Organization:** Categorized sidebar with collapsible sections for easy navigation
- **Video Playback:** Full-featured video player with playback controls, volume adjustment, and seeking
- **Image Viewing:** High-quality image display with zoom capabilities
- **Dark Mode:** Toggle between light and dark themes for comfortable viewing in any environment
- **Keyboard Shortcuts:** Navigate and control media playback using keyboard shortcuts
- **Right-Click Menu:** Context-sensitive menu for quick access to common actions
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices
- **Search Functionality:** Filter media items by name or description

## Project Structure

```
media-viewer/
├── components/             # Web components
│   ├── image-viewer/       # Image viewer component
│   ├── media-base/         # Base component for media types
│   ├── media-sidebar/      # Sidebar for media navigation
│   ├── right-click-menu/   # Context menu component
│   ├── shortcut-handler/   # Keyboard shortcut handler
│   ├── video-controls/     # Video playback controls
│   └── video-player/       # Video player component
├── js/                     # JavaScript utilities and data
│   ├── media-data.js       # Media item data
│   └── utilities.js        # Common utility functions
├── server/                 # Server for local development
│   ├── server.js           # Node.js server
│   └── assets/             # Media assets (videos, images)
├── styles/                 # CSS styles
│   └── main.css            # Main stylesheet
├── about.html              # About page
├── index.html              # Redirect to main application
├── media-viewer-demo.html  # Main application page
├── video-player-test.html  # Test page for video player
├── package.json            # Project configuration
└── README.md               # Project documentation
```

## Getting Started

1. Clone the repository
2. Install dependencies (if any): `npm install`
3. Start the server: `npm start` or `node server/server.js`
4. Open `http://localhost:1122/` in your browser

## Application Pages

- **Main Application:** http://localhost:1122/media-viewer-demo.html
- **About Page:** http://localhost:1122/about.html
- **Video Player Test:** http://localhost:1122/video-player-test.html

## Supported Media Formats

- **Video:** MP4, WebM, Ogg, MOV
- **Images:** JPEG, PNG, GIF, WebP
- **Sources:** Local files, remote URLs

## Technology Stack

- **Web Components:** Custom elements for encapsulated, reusable UI components
- **JavaScript:** Modern ES6+ features for clean, maintainable code
- **CSS3:** Advanced styling with CSS variables for theming
- **HTML5:** Semantic markup for accessibility and SEO
- **Node.js:** Server for local development and asset serving

## Key Utilities

The project includes several utility functions in `js/utilities.js`:

- **toggleDarkMode:** Switch between dark and light modes
- **formatTime:** Convert seconds to MM:SS format
- **isUrlFromDomain:** Check if a URL belongs to a specific domain
- **getFileExtension:** Extract file extension from a path
- **debounce:** Limit how often a function can be called
- **notifyMediaChanged:** Dispatch event when media changes
- **initDarkMode:** Initialize dark mode based on saved preference

## Media Data Management

Media items are managed in `js/media-data.js` with these methods:

- **getAllItems:** Get all media items
- **getItemsByCategory:** Filter items by category
- **getItemsByType:** Filter items by type (videos/images)
- **searchItems:** Search items by name or description
- **getItemById:** Get a specific item by ID

## How to Extend & Customize

The Media Viewer is designed to be easily extended and customized:

1. **Add New Components:** Create new web components by extending existing ones or building from scratch
2. **Customize Styling:** Modify CSS variables in the main stylesheet or component-specific styles
3. **Add Media Types:** Implement new media handlers by following the established pattern
4. **Extend Functionality:** Add new features by creating new components or enhancing existing ones
5. **Integration:** Easily integrate with other web applications using the component-based architecture

## Future Enhancements

- Audio player component for music and podcasts
- PDF viewer for documents
- Playlist creation and management
- User accounts and preferences
- Media sharing capabilities
- Advanced filtering and sorting options
- Customizable themes and layouts
- Integration with cloud storage services

## License

Copyright © 2025 Media Viewer 