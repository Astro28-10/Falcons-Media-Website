// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Find all back buttons
    const backButtons = document.querySelectorAll('.back-button');
    
    // Add click event listener to each back button
    backButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            goBack();
        });
    });
});

function goBack() {
    console.log('Back button clicked'); // Debug log
    
    try {
        // If we have a previous page in history
        if (window.history.length > 1) {
            console.log('History length:', window.history.length); // Debug log
            window.history.back();
        } else {
            // Fallback to index page
            console.log('No history, redirecting to index'); // Debug log
            window.location.href = 'index1.html';
        }
    } catch (error) {
        console.error('Navigation error:', error);
        window.location.href = 'index1.html';
    }
}
