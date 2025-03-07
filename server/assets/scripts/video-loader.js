/**
 * Video Loader Script
 * Loads videos for the video player dropdown
 */

function loadAvailableVideos() {
  const videoSelector = document.getElementById('video-selector');
  if (!videoSelector) return;
  
  // Clear existing options except for the first one (Sample Video)
  const sampleOption = videoSelector.options[0];
  const onlineOptions = Array.from(videoSelector.options)
    .filter(option => option.value.startsWith('http'));
  
  videoSelector.innerHTML = '';
  videoSelector.appendChild(sampleOption);
  
  // Add local video options
  const localVideos = [
    "AVATAR_Trailer",
    "Forest",
    "Forest_1",
    "AVATAR_Trailer",
    "Deep_sea_fish_play",
    "Deep_sea_fish_play_1",
    "Deep_sea_fish_play_2",
    "Deep_sea_fish_play_3",
    "Deep_sea_fish_play_4",
    "Penguins"
  ];
  
  // Add a separator
  const localHeader = document.createElement('optgroup');
  localHeader.label = 'Local Videos';
  videoSelector.appendChild(localHeader);
  
  // Add each video as an option
  localVideos.forEach(video => {
    const option = document.createElement('option');
    option.value = video;
    option.textContent = video;
    videoSelector.appendChild(option);
  });
  
  // Add online video options
  const onlineHeader = document.createElement('optgroup');
  onlineHeader.label = 'Online Videos';
  videoSelector.appendChild(onlineHeader);
  
  onlineOptions.forEach(option => {
    videoSelector.appendChild(option);
  });
}

// Load videos when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for components to be fully initialized
  setTimeout(loadAvailableVideos, 500);
}); 