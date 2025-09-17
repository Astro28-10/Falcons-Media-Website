// Google Analytics Configuration for Falcons Media Website
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual Measurement ID

// Initialize Google Analytics
function initializeGA() {
    // Check if already initialized
    if (window.gtag) return;
    
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href
    });
    
    // Make gtag globally available
    window.gtag = gtag;
    
    // Auto-track media interactions
    setupMediaTracking();
}

// Media-specific tracking functions
function setupMediaTracking() {
    // Track video interactions
    document.addEventListener('play', function(e) {
        if (e.target.tagName === 'VIDEO') {
            trackCustomEvent('video_play', {
                video_title: e.target.title || 'Untitled Video',
                video_duration: e.target.duration
            });
        }
    }, true);
    
    // Track image views (for galleries)
    const images = document.querySelectorAll('img[data-track="true"]');
    images.forEach(img => {
        img.addEventListener('click', () => {
            trackCustomEvent('image_view', {
                image_name: img.alt || img.src.split('/').pop()
            });
        });
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
            maxScroll = scrollPercent;
            trackCustomEvent('scroll_depth', {
                scroll_percentage: scrollPercent,
                page_title: document.title
            });
        }
    });
}

// Custom event tracking functions
function trackPageView(page_title, page_location) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: page_title || document.title,
            page_location: page_location || window.location.href
        });
    }
}

function trackCustomEvent(event_name, parameters = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', event_name, parameters);
    }
}

// Track form submissions
function trackFormSubmission(formName) {
    trackCustomEvent('form_submission', {
        form_name: formName,
        page_location: window.location.href
    });
}

// Track downloads (for media files)
function trackDownload(fileName, fileType) {
    trackCustomEvent('file_download', {
        file_name: fileName,
        file_type: fileType,
        page_location: window.location.href
    });
}

// Track external link clicks
function setupExternalLinkTracking() {
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.hostname !== window.location.hostname) {
            trackCustomEvent('external_link_click', {
                link_url: e.target.href,
                link_text: e.target.textContent.trim()
            });
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeGA();
    setupExternalLinkTracking();
});

// Export functions for manual tracking
window.falconsAnalytics = {
    trackCustomEvent,
    trackFormSubmission,
    trackDownload,
    trackPageView
};