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
  let currentPage = 0;
  let totalPages = 0;
  let hasMoreImages = false;
  let totalImages = 0;
  let allFolders = [];
  let currentPageImages = [];

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
      // Reset pagination state
      currentPage = 1;
      hasMoreImages = false;
      totalImages = 0;
      totalPages = 0;
      allFolders = [];
      currentPageImages = [];
      // Hide pagination section
      const paginationSection = document.getElementById('paginationSection');
      if (paginationSection) {
        paginationSection.style.display = 'none';
      }
      document.body.classList.remove('pagination-active');
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

  // Navigate to specific page
  async function goToPage(pageNum) {
    if (!currentFolderId || pageNum < 1 || pageNum === currentPage) return;
    
    try {
      showPaginationLoading(true);
      
      const response = await fetch(`/api/folders/${currentFolderId}/contents?page=${pageNum}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update pagination info
      hasMoreImages = data.pagination.hasMore;
      totalPages = data.pagination.totalPages;
      totalImages = data.pagination.totalImages;
      currentPage = pageNum;
      
      // Get items for this specific page
      const pageFolders = data.items.filter(item => item.type === 'folder');
      currentPageImages = data.items.filter(item => item.type === 'image');
      
      // Only show folders on page 1, other pages show only images
      const foldersToShow = pageNum === 1 ? pageFolders : [];
      
      // Re-render gallery with only current page images
      renderGallery(foldersToShow, currentPageImages);
      initializeLightGallery();
      updatePaginationControls();
      
      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      showPaginationLoading(false);
      
    } catch (error) {
      console.error("Error navigating to page:", error);
      showPaginationLoading(false);
      showErrorMessage("Failed to load page. Please try again.");
    }
  }

  // Show/hide pagination loading
  function showPaginationLoading(show) {
    const loadingEl = document.getElementById('paginationLoading');
    if (loadingEl) {
      loadingEl.style.display = show ? 'flex' : 'none';
    }
  }

  // Show error message
  function showErrorMessage(message) {
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ef4444;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>${message}</span>`;
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
      errorMsg.remove();
    }, 3000);
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

      // Load folder contents with pagination (start with page 1)
      const response = await fetch(`/api/folders/${currentFolderId}/contents?page=1`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      loadingEl.style.display = "none";

      if (!data.items || data.items.length === 0) {
        showEmptyState();
        return;
      }

      // Store pagination info
      hasMoreImages = data.pagination.hasMore;
      totalPages = data.pagination.totalPages;
      totalImages = data.pagination.totalImages;
      currentPage = 1;

      // Separate folders and images from current page
      allFolders = data.items.filter(item => item.type === 'folder');
      currentPageImages = data.items.filter(item => item.type === 'image');
      
      if (allFolders.length === 0 && currentPageImages.length === 0) {
        showEmptyState();
        return;
      }

      renderGallery(allFolders, currentPageImages);
      initializeLightGallery();
      addSelectionControls();
      addPaginationControls();
      
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

  // Add pagination controls
  function addPaginationControls() {
    const paginationSection = document.getElementById('paginationSection');
    if (!paginationSection) return;

    // Clear existing pagination controls
    paginationSection.innerHTML = '';

    // Only show pagination if there are images with multiple pages available
    if (totalImages <= 40) {
      paginationSection.style.display = 'none';
      document.body.classList.remove('pagination-active');
      return;
    }

    paginationSection.style.display = 'block';
    document.body.classList.add('pagination-active');
    const paginationControls = document.createElement('div');
    paginationControls.id = 'paginationControls';
    
    // Generate page numbers (1-based)
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    let pageButtons = '';
    
    // Previous button
    if (currentPage > 1) {
      pageButtons += `<button class="page-btn nav-btn" data-page="${currentPage - 1}">‹</button>`;
    }
    
    // First page if not visible
    if (startPage > 1) {
      pageButtons += `<button class="page-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        pageButtons += `<span class="page-dots">...</span>`;
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage ? 'active' : '';
      pageButtons += `<button class="page-btn ${isActive}" data-page="${i}">${i}</button>`;
    }
    
    // Last page if not visible
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons += `<span class="page-dots">...</span>`;
      }
      pageButtons += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
      pageButtons += `<button class="page-btn nav-btn" data-page="${currentPage + 1}">›</button>`;
    }
    
    paginationControls.innerHTML = `
      <div class="pagination-info">
        <span>Page ${currentPage} of ${totalPages} (${totalImages} photos total)</span>
      </div>
      <div class="pagination-pages">
        ${pageButtons}
        ${hasMoreImages && currentPage < totalPages ? `<button id="loadMoreBtn" class="load-more-btn">Load More</button>` : ''}
      </div>
      <div id="paginationLoading" class="pagination-loading" style="display: none;">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading...</span>
      </div>
    `;
    
    paginationControls.style.cssText = `
      background: white;
      padding: 16px 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      margin: 16px 0 8px 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
    `;
    
    paginationSection.appendChild(paginationControls);

    // Add event listeners
    setTimeout(() => {
      const pageButtons = document.querySelectorAll('.page-btn');
      const loadMoreBtn = document.getElementById('loadMoreBtn');

      pageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const page = parseInt(btn.dataset.page);
          goToPage(page);
        });
      });

      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          goToPage(currentPage + 1);
        });
      }
    }, 100);
  }

  // Update pagination controls
  function updatePaginationControls() {
    addPaginationControls(); // Simply recreate the entire pagination
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
      z-index: 1001;
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
    // Hide pagination section
    const paginationSection = document.getElementById('paginationSection');
    if (paginationSection) {
      paginationSection.style.display = 'none';
    }
    document.body.classList.remove('pagination-active');
    
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
    // Hide pagination section
    const paginationSection = document.getElementById('paginationSection');
    if (paginationSection) {
      paginationSection.style.display = 'none';
    }
    document.body.classList.remove('pagination-active');
    
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
    .pagination-info {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .pagination-pages {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .page-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      height: 40px;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #374151;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .page-btn:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }
    .page-btn.active {
      background: #000 !important;
      color: white !important;
      border-color: #000 !important;
    }
    .page-btn.nav-btn {
      font-size: 18px;
      font-weight: bold;
    }
    .page-dots {
      color: #9ca3af;
      font-weight: bold;
      padding: 0 8px;
    }
    .load-more-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 16px;
      background: #10b981;
      color: white;
      border: 1px solid #10b981;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      margin-left: 16px;
    }
    .load-more-btn:hover {
      background: #059669;
      border-color: #059669;
    }
    .load-more-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }
    .pagination-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #6b7280;
      font-size: 13px;
    }
    .pagination-section {
      margin-top: 24px;
      margin-bottom: 8px;
    }
    /* Reduce photo-gallery bottom padding when pagination is present */
    .photo-gallery:has(.pagination-section[style*="block"]) {
      padding-bottom: 1rem;
    }
    /* Fallback for browsers that don't support :has() */
    .pagination-active .photo-gallery {
      padding-bottom: 1rem;
    }
    @media (max-width: 768px) {
      #paginationControls {
        padding: 14px 16px !important;
        margin: 12px 0 6px 0 !important;
        border-radius: 6px !important;
      }
      .pagination-section {
        margin-top: 20px !important;
        margin-bottom: 6px !important;
      }
      .pagination-pages {
        gap: 8px !important;
        flex-wrap: wrap !important;
        justify-content: center !important;
      }
      .page-btn {
        min-width: 36px !important;
        height: 36px !important;
        font-size: 13px !important;
        padding: 6px 8px !important;
      }
      .load-more-btn {
        font-size: 13px !important;
        padding: 8px 12px !important;
        margin-left: 8px !important;
      }
      .pagination-info {
        font-size: 13px !important;
      }
      /* Adjust selection controls for mobile */
      #selectionControls {
        bottom: 30px !important;
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) !important;
        width: auto !important;
        max-width: calc(100vw - 40px) !important;
      }
    }
  `;
  document.head.appendChild(style);



  // Load photos on page load
  loadEventGallery();
});
