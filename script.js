// Minimum dimensions
const MIN_WIDTH = 280;
const MIN_HEIGHT = 220;
let highestZIndex = 10; // Start with a base z-index value

// Throttle function for performance optimization
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Function to center a window
function centerWindow(win) {
  const winWidth = win.offsetWidth;
  const winHeight = win.offsetHeight;
  const container = document.getElementById('windows-container');
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;

  win.style.left = (containerWidth / 2 - winWidth / 2) + 'px';
  win.style.top = (containerHeight / 2 - winHeight / 2) + 'px';
}

// Function to bring the window to the front
function bringWindowToFront(win) {
  highestZIndex++;
  win.style.zIndex = highestZIndex;
}

// Function to create a new window with a specific title and URL
function createWindow(id, title, url) {
  // Check if the window with this ID already exists
  if (document.getElementById(id)) {
    const existingWindow = document.getElementById(id);
    bringWindowToFront(existingWindow); // Bring the existing window to the front
    return;
  }

  const windowDiv = document.createElement('div');
  windowDiv.classList.add('window');
  windowDiv.id = id; // Assign a unique id based on the icon clicked
  windowDiv.style.zIndex = ++highestZIndex; // Set z-index and increment

  // Calculate dimensions as 50% of the container's width and height
  const container = document.getElementById('windows-container');
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const defaultWidth = containerWidth * 0.5; // 50% of the container's width
  const defaultHeight = containerHeight * 0.5; // 50% of the container's height

  windowDiv.style.width = `${defaultWidth}px`;
  windowDiv.style.height = `${defaultHeight}px`;

  windowDiv.innerHTML = `
    <div class="window-header">
      <span>${title}</span>
      <button class="close-btn">X</button>
    </div>
    <div class="window-content">
      <iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>
    </div>
    <div class="resize-handle"></div>
  `;
  document.getElementById('windows-container').appendChild(windowDiv);

  // Center the new window
  centerWindow(windowDiv);

  // Add event listeners for the new window
  addWindowEvents(windowDiv);
}

// Function to add event listeners for a window, supporting both mouse and touch events
function addWindowEvents(win) {
  const header = win.querySelector('.window-header');
  const resizeHandle = win.querySelector('.resize-handle');
  const iframe = win.querySelector('iframe');

  // Bring window to front when clicked
  win.addEventListener('mousedown', () => bringWindowToFront(win));
  win.addEventListener('touchstart', () => bringWindowToFront(win));

  // Handle drag (mouse + touch)
  if (header) {
    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDrag, { passive: false });
  }

  function startDrag(e) {
    e.preventDefault();
    const rect = win.getBoundingClientRect();
    const offsetX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const offsetY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    // Disable pointer events for iframe while dragging
    if (iframe) {
      iframe.style.pointerEvents = 'none';
    }

    const moveFn = throttle((e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      win.style.left = clientX - offsetX + 'px';
      win.style.top = clientY - offsetY + 'px';
    }, 10);

    function onMouseUp() {
      document.removeEventListener('mousemove', moveFn);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', moveFn);
      document.removeEventListener('touchend', onMouseUp);

      // Re-enable pointer events for iframe after dragging
      if (iframe) {
        iframe.style.pointerEvents = 'auto';
      }
    }

    document.addEventListener('mousemove', moveFn);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', moveFn);
    document.addEventListener('touchend', onMouseUp);
  }

  // Handle resize (mouse + touch)
  if (resizeHandle) {
    resizeHandle.addEventListener('mousedown', startResize);
    resizeHandle.addEventListener('touchstart', startResize, { passive: false });
  }

  function startResize(e) {
    e.preventDefault();
    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    const startY = e.touches ? e.touches[0].clientY : e.clientY;
    const startWidth = win.offsetWidth;
    const startHeight = win.offsetHeight;

    // Disable pointer events for iframe while resizing
    if (iframe) {
      iframe.style.pointerEvents = 'none';
    }

    const resizeFn = throttle((e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      let newWidth = startWidth + (clientX - startX);
      let newHeight = startHeight + (clientY - startY);

      newWidth = Math.max(newWidth, MIN_WIDTH);
      newHeight = Math.max(newHeight, MIN_HEIGHT);

      win.style.width = `${newWidth}px`;
      win.style.height = `${newHeight}px`;
    }, 10);

    function onMouseUp() {
      document.removeEventListener('mousemove', resizeFn);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', resizeFn);
      document.removeEventListener('touchend', onMouseUp);

      // Re-enable pointer events for iframe after resizing
      if (iframe) {
        iframe.style.pointerEvents = 'auto';
      }
    }

    document.addEventListener('mousemove', resizeFn);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', resizeFn);
    document.addEventListener('touchend', onMouseUp);
  }

  // Close button functionality
  const closeButton = win.querySelector('.close-btn');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      win.remove();
    });
  }
}

// Ensure script runs after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize desktop icons
  document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', function() {
      const url = this.getAttribute('data-url');
      const isNewTab = this.getAttribute('target') === '_blank';

      if (isNewTab) {
        window.open(url, '_blank');
      } else {
        const windowTitle = this.querySelector('p').textContent; // Get the icon's text
        const windowId = `window-${windowTitle.toLowerCase().replace(/\s+/g, '-')}`; // Create a unique id for each window

        createWindow(windowId, windowTitle, url);
      }
    });
  });

  const musicButton = document.querySelector('.taskbar-icons .fa-music');
  if (musicButton) {
    musicButton.addEventListener('click', function(event) {
      event.preventDefault(); 
      const windowId = 'window-music'; 
      const windowTitle = 'Music'; 
      const windowUrl = 'music.html'; 

      createWindow(windowId, windowTitle, windowUrl);
    });
  }

  // Update time
  function updateTime() {
    const timeElement = document.getElementById('time');
    if (timeElement) { // Check if the element exists
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      
      timeElement.textContent = `${formattedHours}:${formattedMinutes} ${period}`;
    }
  }

  setInterval(updateTime, 1000); // Update every second
  updateTime(); // Call immediately to set initial time
});
