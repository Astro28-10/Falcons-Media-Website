# Splash Screen Images

This folder contains the images that will be displayed in the background carousel during the website's splash screen animation.

## How to Update Images

1. **Add New Images**: Place your desired images in this folder
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
   - Recommended size: 1920x1080 or similar aspect ratio for best results
   - File names can be anything (e.g., `event1.jpg`, `team-photo.png`, etc.)

2. **Update the Code**: Edit `/public/index.html` and find the `splashImages` array around line 106
   - Add your new image paths to the array
   - Example: `'/img/splash/your-new-image.jpg'`

3. **Remove Images**: 
   - Delete the image file from this folder
   - Remove the corresponding entry from the `splashImages` array in `index.html`

## Current Images
- `splash1.jpg` - Sample image 1
- `splash2.jpg` - Sample image 2  
- `splash3.jpg` - Sample image 3
- `splash4.jpg` - Sample image 4
- `splash5.jpg` - Sample image 5

## Customization Options

### **Speed & Timing Settings**
To modify animation speeds, edit `/public/index.html` and look for these values:

- **Image cycling speed**: Line ~290 - Change `600` (milliseconds)
  ```javascript
  }, 600); // Make smaller for faster, larger for slower
  ```

- **Total splash duration**: Line ~297 - Change `3000` (3 seconds)
  ```javascript
  }, 3000); // Time before redirecting to main site
  ```

- **Fade out duration**: Line ~299 - Change `500` (0.5 seconds)
  ```javascript
  setTimeout(() => window.location.href = '/index1.html', 500);
  ```

### **Visual Settings**
- **Background opacity**: Line ~48 - Change `0.4` (40% transparency)
  ```css
  .background-image.active {
    opacity: 0.4; /* 0.0 = invisible, 1.0 = fully visible */
  }
  ```

- **Logo size**: Line ~81 - Change `120px`
  ```css
  .main-logo {
    height: 120px; /* Adjust logo size */
  }
  ```

### **Animation Timing**
Logo and text reveal delays can be adjusted in the CSS animations:
- Logo appears at: `0.3s` (line ~86)
- Main text at: `0.8s` (line ~94) 
- Subtitle at: `1s` (line ~103)
- Loading dots at: `1.2s` (line ~117)

## Tips
- Images cycle every 600ms (0.6 seconds) by default
- Background images appear at 40% opacity to not interfere with the logo
- You can have as many or as few images as you want
- For best performance, optimize images before adding them (compress them to reduce file size)
- Test different speeds to find what feels right for your content
