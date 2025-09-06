document.addEventListener("DOMContentLoaded", () => {
  // Get folder name from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const folderName = urlParams.get('folder');
  
  const eventNameEl = document.getElementById("event-name");
  const galleryEl = document.getElementById("gallery");
  const loadingEl = document.getElementById("loading");
  const refreshBtn = document.getElementById("refreshBtn");
  
  let galleryInstance = null;

  // Set event name
  if (folderName) {
    eventNameEl.textContent = folderName;
    document.title = `${folderName} - Event Gallery`;
  }

  // Refresh button functionality
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>';
      loadPhotos();
    });
  }

  // Load photos function
  async function loadPhotos() {
    if (!folderName) {
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

      const response = await fetch(`/api/folders/${encodeURIComponent(folderName)}/photos`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const photos = await response.json();
      
      loadingEl.style.display = "none";

      if (!photos || photos.length === 0) {
        showEmptyState();
        return;
      }

      renderPhotos(photos);
      initializeLightGallery();
      
      galleryEl.style.display = "grid";

    } catch (error) {
      console.error("Error loading photos:", error);
      loadingEl.style.display = "none";
      showError("Failed to load photos. Please try again.");
    }
  }

  // Render photos in grid
  function renderPhotos(photos) {
    galleryEl.innerHTML = photos.map(photo => `
      <div class="gallery-item" data-src="/api/imageproxy/${photo.id}?size=w1920" data-thumb="/api/imageproxy/${photo.id}?size=w400">
        <img src="/api/imageproxy/${photo.id}?size=w400" alt="${photo.name}" loading="lazy" onerror="this.parentElement.classList.add('error')">
        <div class="gallery-item-overlay">
          <div class="gallery-item-info">
            <i class="fas fa-expand-alt"></i>
          </div>
        </div>
      </div>
    `).join('');

    // Add animation
    const items = galleryEl.querySelectorAll('.gallery-item');
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, index * 50);
    });
  }

  // Initialize LightGallery
  function initializeLightGallery() {
    if (galleryInstance) {
      galleryInstance.destroy();
    }

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
        selector: '.gallery-item'
      });
    } catch (error) {
      console.error("Error initializing LightGallery:", error);
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

  // Load photos on page load
  loadPhotos();
});
