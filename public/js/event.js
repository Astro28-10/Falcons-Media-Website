document.addEventListener("DOMContentLoaded", () => {
  // Get folder name and ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const folderName = urlParams.get('folder');
  const folderId = urlParams.get('folderId'); // Direct folder ID for subfolders
  
  const eventNameEl = document.getElementById("event-name");
  const galleryEl = document.getElementById("gallery");
  const loadingEl = document.getElementById("loading");
  const refreshBtn = document.getElementById("refreshBtn");
  
  let galleryInstance = null;
  let currentFolderId = null;
  let selectMode = false;
  let selectedItems = new Set();

  // Set event name
  const displayName = folderName || 'Gallery';
  if (eventNameEl) {
    eventNameEl.textContent = displayName;
    document.title = `${displayName} - Event Gallery`;
  }

  // Refresh button functionality
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>';
      loadEventGallery();
    });
  }

  // Find folder ID by name from events list
  async function findFolderId(folderName) {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const events = await response.json();
      const event = events.find(e => e.name === folderName);
      return event ? event.id : null;
    } catch (error) {
      console.error('Error finding folder ID:', error);
      return null;
    }
  }

  // Load event gallery
  async function loadEventGallery() {
    if (!folderName && !folderId) {
      showError("No folder specified");
      return;
    }

    try {
      loadingEl.style.display = "block";
      galleryEl.style.display = "none";
      galleryEl.innerHTML = "";

      // Reset refresh button
      if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span>Refresh</span>';
      }

      // Determine folder ID to use
      if (folderId) {
        // Direct folder ID provided (for subfolders)
        currentFolderId = folderId;
      } else {
        // Find the folder ID by name (for main events)
        currentFolderId = await findFolderId(folderName);
        if (!currentFolderId) {
          throw new Error('Event folder not found');
        }
      }

      // Load folder contents
      const response = await fetch(`/api/folders/${currentFolderId}/contents`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const items = await response.json();
      
      loadingEl.style.display = "none";

      if (!items || items.length === 0) {
        showEmptyState();
        return;
      }

      // Separate folders and images
      const folders = items.filter(item => item.type === 'folder');
      const photos = items.filter(item => item.type === 'image');
      
      if (folders.length === 0 && photos.length === 0) {
        showEmptyState();
        return;
      }

      renderGallery(folders, photos);
      initializeLightGallery();
      addSelectionControls();
      
      galleryEl.style.display = "grid";

    } catch (error) {
      console.error("Error loading photos:", error);
      loadingEl.style.display = "none";
      showError("Failed to load photos. Please try again.");
    }
  }

  // Render gallery with both folders and photos
  function renderGallery(folders, photos) {
    let galleryHTML = '';
    
    // Render folders first
    folders.forEach(folder => {
      galleryHTML += `
        <div class="gallery-item folder-item" data-folder-id="${folder.id}" data-folder-name="${folder.name}">
          <div class="folder-cover">
            ${folder.coverId 
              ? `<img src="/api/imageproxy/${folder.coverId}?size=w400" alt="${folder.name}" loading="lazy">` 
              : `<div class="folder-placeholder"><i class="fas fa-folder"></i></div>`
            }
          </div>
          <div class="gallery-item-overlay folder-overlay">
            <div class="gallery-item-info">
              <i class="fas fa-folder-open"></i>
              <span class="folder-name">${folder.name}</span>
            </div>
          </div>
        </div>
      `;
    });
    
    // Render photos
    photos.forEach(photo => {
      galleryHTML += `
        <div class="gallery-item photo-item" data-src="/api/imageproxy/${photo.id}?size=w1200" data-thumb="/api/imageproxy/${photo.id}?size=w400" data-id="${photo.id}">
          <img src="/api/imageproxy/${photo.id}?size=w400" alt="${photo.name}" loading="lazy" onerror="this.parentElement.classList.add('error')">
          <div class="gallery-item-overlay">
            <div class="gallery-item-info">
              <i class="fas fa-expand-alt"></i>
            </div>
          </div>
          <div class="selection-checkbox" style="display: none;">
            <input type="checkbox" data-id="${photo.id}">
          </div>
        </div>
      `;
    });
    
    galleryEl.innerHTML = galleryHTML;

    // Add click handlers
    const items = galleryEl.querySelectorAll('.gallery-item');
    items.forEach((item, index) => {
      // Add animation
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, index * 50);

      // Handle folder clicks
      if (item.classList.contains('folder-item')) {
        item.addEventListener('click', () => {
          const folderName = item.dataset.folderName;
          const folderId = item.dataset.folderId;
          // Navigate to subfolder by updating URL with both name and ID
          window.location.href = `/event.html?folder=${encodeURIComponent(folderName)}&folderId=${encodeURIComponent(folderId)}`;
        });
      } 
      // Handle photo clicks for selection mode
      else if (item.classList.contains('photo-item')) {
        const handleClick = (e) => {
          if (selectMode) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Don't toggle if the click was directly on the checkbox input
            if (e.target.type === 'checkbox') {
              return;
            }
            
            const checkbox = item.querySelector('.selection-checkbox input');
            if (checkbox) {
              checkbox.checked = !checkbox.checked;
              updateDownloadButton();
            }
            return false;
          }
        };

        // Add single click handler with capture phase
        item.addEventListener('click', handleClick, true);
      }
    });
  }

  // Legacy function for backward compatibility - now calls renderGallery
  function renderPhotos(photos) {
    renderGallery([], photos);
  }

  // Add selection controls
  function addSelectionControls() {
    // Remove existing controls to avoid duplicates
    const existingControls = document.getElementById('selectionControls');
    if (existingControls) {
      existingControls.remove();
    }

    // Create selection controls
    const selectionControls = document.createElement('div');
    selectionControls.id = 'selectionControls';
    selectionControls.innerHTML = `
      <button id="toggleSelectMode" class="control-btn">
        <i class="fas fa-check-square"></i>
        <span>Select Photos</span>
      </button>
      <button id="downloadSelected" class="control-btn primary" style="display: none;" disabled>
        <i class="fas fa-download"></i>
        <span>Download Selected</span>
      </button>
      <button id="selectAll" class="control-btn" style="display: none;">
        <i class="fas fa-check-double"></i>
        <span>Select All</span>
      </button>
    `;
    selectionControls.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      background: white;
      padding: 12px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      border: 1px solid #e5e7eb;
      z-index: 1000;
    `;
    document.body.appendChild(selectionControls);

    // Add event listeners after creating elements
    setTimeout(() => {
      const toggleBtn = document.getElementById('toggleSelectMode');
      const downloadBtn = document.getElementById('downloadSelected');
      const selectAllBtn = document.getElementById('selectAll');

      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          selectMode = !selectMode;
          toggleSelectionMode();
        });
      }

      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          downloadSelectedPhotos();
        });
      }

      if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
          selectAllPhotos();
        });
      }
    }, 100);
  }

  // Toggle selection mode
  function toggleSelectionMode() {
    const checkboxes = document.querySelectorAll('.selection-checkbox');
    const toggleBtn = document.getElementById('toggleSelectMode');
    const downloadBtn = document.getElementById('downloadSelected');
    const selectAllBtn = document.getElementById('selectAll');

    if (selectMode) {
      // Show checkboxes and controls
      checkboxes.forEach(cb => cb.style.display = 'block');
      toggleBtn.innerHTML = '<i class="fas fa-times"></i><span>Cancel</span>';
      downloadBtn.style.display = 'flex';
      selectAllBtn.style.display = 'flex';
      
      // Add selection mode class to disable LightGallery clicks
      galleryEl.classList.add('selection-mode');
      
      // Add checkbox listeners
      checkboxes.forEach(cb => {
        const checkbox = cb.querySelector('input');
        // Remove existing listeners to avoid duplicates
        checkbox.removeEventListener('change', updateDownloadButton);
        checkbox.addEventListener('change', updateDownloadButton);
      });
    } else {
      // Hide checkboxes and controls
      checkboxes.forEach(cb => {
        cb.style.display = 'none';
        const checkbox = cb.querySelector('input');
        checkbox.checked = false;
        checkbox.removeEventListener('change', updateDownloadButton);
      });
      toggleBtn.innerHTML = '<i class="fas fa-check-square"></i><span>Select Photos</span>';
      downloadBtn.style.display = 'none';
      selectAllBtn.style.display = 'none';
      selectedItems.clear();
      
      // Remove selection mode class to re-enable LightGallery clicks
      galleryEl.classList.remove('selection-mode');
    }
    
    // Reinitialize LightGallery based on current mode
    initializeLightGallery();
  }

  // Select all photos
  function selectAllPhotos() {
    const checkboxes = document.querySelectorAll('.selection-checkbox input');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
      cb.checked = !allChecked;
    });
    updateDownloadButton();
  }

  // Update download button state
  function updateDownloadButton() {
    console.log('updateDownloadButton called'); // Debug log
    const checkedBoxes = document.querySelectorAll('.selection-checkbox input:checked');
    const downloadBtn = document.getElementById('downloadSelected');
    const selectAllBtn = document.getElementById('selectAll');
    
    console.log('Checked boxes count:', checkedBoxes.length); // Debug log
    
    selectedItems.clear();
    checkedBoxes.forEach(cb => {
      selectedItems.add(cb.getAttribute('data-id'));
    });
    
    console.log('Selected items:', Array.from(selectedItems)); // Debug log
    
    if (selectedItems.size > 0) {
      downloadBtn.innerHTML = `<i class="fas fa-download"></i><span>Download ${selectedItems.size} Photo${selectedItems.size > 1 ? 's' : ''}</span>`;
      downloadBtn.disabled = false;
      downloadBtn.style.opacity = '1';
    } else {
      downloadBtn.innerHTML = '<i class="fas fa-download"></i><span>Download Selected</span>';
      downloadBtn.disabled = true;
      downloadBtn.style.opacity = '0.6';
    }
    
    // Update select all button text
    const totalBoxes = document.querySelectorAll('.selection-checkbox input').length;
    const allSelected = selectedItems.size === totalBoxes && totalBoxes > 0;
    selectAllBtn.innerHTML = allSelected ? 
      '<i class="fas fa-square"></i><span>Deselect All</span>' : 
      '<i class="fas fa-check-double"></i><span>Select All</span>';
  }

  // Download selected photos
  function downloadSelectedPhotos() {
    if (selectedItems.size === 0) return;
    
    const ids = Array.from(selectedItems);
    const downloadUrl = `/api/events/${currentFolderId}/download?ids=${ids.join(',')}`;
    
    // Create temporary link for download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${folderName}_photos.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show feedback
    showDownloadFeedback();
  }

  // Show download feedback
  function showDownloadFeedback() {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    feedback.innerHTML = '<i class="fas fa-check-circle"></i><span>Download started...</span>';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.remove();
    }, 3000);
  }

  // Initialize LightGallery
  function initializeLightGallery() {
    if (galleryInstance) {
      galleryInstance.destroy();
      galleryInstance = null;
    }

    // Only initialize LightGallery when not in selection mode
    if (!selectMode) {
      try {
        galleryInstance = lightGallery(galleryEl, {
          plugins: [lgZoom, lgThumbnail],
          speed: 400,
          download: true,
          counter: true,
          getCaptionFromTitleOrAlt: false,
          thumbnail: true,
          animateThumb: true,
          zoomFromOrigin: false,
          allowMediaOverlap: true,
          toggleThumb: true,
          selector: '.gallery-item.photo-item' // Only target photo items, not folders
        });
      } catch (error) {
        console.error("Error initializing LightGallery:", error);
      }
    }
  }

  // Show empty state
  function showEmptyState() {
    galleryEl.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
        <div class="empty-icon" style="font-size: 4rem; color: #9ca3af; margin-bottom: 1.5rem;">
          <i class="fas fa-images"></i>
        </div>
        <h3 style="margin-bottom: 0.5rem; color: #374151;">No photos found</h3>
        <p style="color: #6b7280;">This gallery doesn't contain any photos yet</p>
      </div>
    `;
    galleryEl.style.display = "grid";
  }

  // Show error state
  function showError(message) {
    galleryEl.innerHTML = `
      <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
        <div class="error-icon" style="font-size: 4rem; color: #ef4444; margin-bottom: 1.5rem;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 style="margin-bottom: 0.5rem; color: #374151;">Error Loading Gallery</h3>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">${message}</p>
        <button onclick="location.reload()" style="padding: 0.75rem 1.5rem; background: #000; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
          <i class="fas fa-redo"></i> Try Again
        </button>
      </div>
    `;
    galleryEl.style.display = "grid";
  }

  // Add CSS for selection checkboxes
  const style = document.createElement('style');
  style.textContent = `
    .gallery-item {
      position: relative;
    }
    .selection-checkbox {
      position: absolute;
      top: 8px;
      right: 8px;
      background: white;
      border-radius: 6px;
      padding: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 10;
      border: 1px solid #e5e7eb;
    }
    .selection-checkbox input {
      width: 18px;
      height: 18px;
      cursor: pointer;
      margin: 0;
    }
    .control-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #374151;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .control-btn:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }
    .control-btn.primary {
      background: #000 !important;
      color: white !important;
      border-color: #000 !important;
    }
    .control-btn.primary:hover {
      background: #1f2937 !important;
    }
    .control-btn.primary:disabled {
      background: #9ca3af !important;
      border-color: #9ca3af !important;
      cursor: not-allowed;
      opacity: 0.6;
    }
    .gallery-item.error img {
      opacity: 0.3;
    }
    .gallery-item.error::after {
      content: "⚠️ Failed to load";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ef4444;
      font-size: 12px;
      text-align: center;
    }
  `;
  document.head.appendChild(style);

  // Load photos on page load
  loadEventGallery();
});
