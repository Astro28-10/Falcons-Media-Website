# Falcons Media Website 📸

A modern, responsive website for **Falcons of BMSCE** - the official photography club of BMS College of Engineering. This website serves as a digital gallery, team showcase, and event management platform, built with a focus on user experience, scalability, and ease of maintenance.

## 🌟 Features

### 🖼️ Gallery & Media Management
- **Interactive Photo Gallery**: Browse through captured moments from various events with lazy loading for performance.
- **Google Drive Integration**: Seamless file upload and management via Google Drive API, supporting batch uploads and automatic organization.
- **Event-wise Organization**: Photos organized by events and categories, with metadata tagging for easy search.
- **Responsive Image Display**: Optimized viewing across all devices, including WebP support for faster loading.

### 👥 Team Archive System
- **Dynamic Team Display**: Switch between current and past event teams using a dropdown selector.
- **Event-based Team History**: Preserve core team memories for each event, with expandable sections for roles.
- **Role-based Organization**: Separate sections for Leadership (Senior Coordinators), Junior Coordinators (Technical specialists), and Photography Team (Extended members).
- **Social Media Integration**: Direct links to team members' profiles (Instagram, LinkedIn) for networking.

### 🎯 Events & Activities
- **Event Showcase**: Dedicated pages for major events like UTSAV and PHASE SHIFT, with dynamic content loading.
- **Interactive Event Cards**: Engaging display of event information, including dates, descriptions, and photo previews.
- **Photo Collections**: Event-specific photo galleries with filtering options (e.g., by date or category).

### 🔧 Technical Features
- **Modern UI/UX**: Clean, professional design with smooth CSS transitions and animations.
- **Mobile-First Design**: Fully responsive across all screen sizes, using media queries and flexible layouts.
- **Google Drive API**: Automated file management and organization, with error handling for API limits.
- **Express.js Backend**: Robust server-side functionality with middleware for security and performance.
- **File Upload System**: Secure and efficient file handling using Multer, with validation for file types and sizes.

## 🚀 Live Demo

Visit the live website: [Falcons Media Website](https://your-domain.com) (Replace with your actual URL).

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup and structure for accessibility (e.g., ARIA labels for screen readers).
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties (CSS variables) for theming.
- **JavaScript (ES6+)**: Interactive functionality, DOM manipulation, and event handling (no frameworks for lightweight performance).
- **Google Fonts**: Typography (Inter for body text, Playfair Display for headings) – loaded asynchronously to avoid render-blocking.
- **Font Awesome**: Icon library (v6.x) for consistent UI elements.

### Backend
- **Node.js**: Runtime environment (v14+ recommended for stability).
- **Express.js**: Web application framework with routing, middleware, and error handling.
- **Google APIs**: Drive API integration for file operations (authentication via service account).
- **Multer**: File upload middleware with disk storage and memory limits.
- **CORS**: Cross-origin resource sharing for API security.
- **Archiver**: For creating ZIP archives of photo collections.
- **Dotenv**: Environment variable management for sensitive data.

### Dependencies (from package.json)
```json
{
  "name": "falcons-media-website",
  "version": "1.0.0",
  "description": "Official website for Falcons of BMSCE photography club",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "googleapis": "^133.0.0",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "archiver": "^5.3.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": ["photography", "gallery", "events", "BMSCE", "Falcons"],
  "author": "Sujay Agarwal & Nithin K Patil",
  "license": "MIT"
}
```

## 📁 Project Structure (Detailed)

```
Falcons-Media-Website/
├── public/                     # Static frontend assets (served by Express)
│   ├── index.html             # Main landing page (hero section, navigation)
│   ├── index1.html            # Gallery page (photo grid, filters)
│   ├── aboutus.html           # Team showcase page (with archive system)
│   ├── event.html             # Events page (event cards, details)
│   ├── css/                   # Stylesheets (modular for maintainability)
│   │   ├── style.css          # Global styles (reset, variables, utilities)
│   │   ├── index-style.css    # Landing page-specific styles
│   │   ├── about.css          # About page styles (team cards, dropdown)
│   │   └── event-style.css    # Event page styles (cards, animations)
│   ├── js/                    # Client-side JavaScript (vanilla JS)
│   │   ├── event.js           # Event page functionality (card interactions)
│   │   ├── event_fixed.js     # Enhanced event features (e.g., lazy loading)
│   │   └── event_simple.js    # Simplified event handling (fallback)
│   └── img/                   # Images and assets
│       ├── falconswhite.png   # Logo (white variant for light backgrounds)
│       ├── falconsblack.png   # Logo (black variant for dark backgrounds)
│       └── people/            # Team member photos (optimized for web)
├── server/                    # Backend code (Node.js/Express)
│   ├── index.js              # Main server file (routes, middleware, API endpoints)
│   └── auth/                 # Authentication for Google APIs
│       └── credentials.json  # Google service account credentials (DO NOT COMMIT)
├── uploads/                  # Temporary directory for file uploads (auto-cleaned)
├── .env                      # Environment variables (ignored in Git)
├── package.json             # Project metadata and dependencies
├── package-lock.json        # Dependency lock file
└── README.md               # This file
```

### Key Files Explained
- **public/index.html**: Entry point with navigation and hero. Adjust for branding (e.g., update logo paths).
- **server/index.js**: Handles API routes (e.g., `/upload` for file uploads). Modify for new endpoints.
- **css/style.css**: Global styles. Use for theme changes (e.g., color variables).
- **js/event.js**: Client-side logic. Update for new interactions.

## 🔧 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher) – Download from [nodejs.org](https://nodejs.org/).
- **npm** or **yarn** (comes with Node.js).
- **Google Cloud Platform** account for API access.
- **Git** for version control.

### 1. Clone the Repository
```bash
git clone https://github.com/SujayAgarwal28/Falcons-Media-Website.git
cd Falcons-Media-Website
```

### 2. Install Dependencies
```bash
npm install
```
This installs all packages from `package.json`. For development, also install dev dependencies like Nodemon.

### 3. Environment Configuration
Create a `.env` file in the root directory (copy from `.env.example` if available):
```env
GOOGLE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key":"..."}
PORT=3000
NODE_ENV=development
```
- `GOOGLE_SERVICE_ACCOUNT`: JSON string from your Google credentials.
- `PORT`: Server port (default 3000).
- `NODE_ENV`: Set to "production" for live deployment.

### 4. Google Drive API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create/select a project.
3. Enable **Google Drive API** in the API Library.
4. Create a **Service Account** under IAM & Admin > Service Accounts.
5. Generate/download a JSON key file.
6. Place it as `server/auth/credentials.json`.
7. Share your Google Drive folder with the service account email (from JSON) and grant editor access.

### 5. Run the Application

#### Development Mode (with auto-restart)
```bash
npm run dev
```
Uses Nodemon for hot reloading.

#### Production Mode
```bash
npm start
```
The website will be available at `http://localhost:3000`.

### Troubleshooting Setup
- **Port already in use?** Change `PORT` in `.env` or kill the process: `npx kill-port 3000`.
- **Google API errors?** Verify credentials JSON and Drive permissions.
- **Dependencies fail?** Clear npm cache: `npm cache clean --force` and reinstall.

## 🎨 Team Archive System

This system allows dynamic switching between event teams, preserving history.

### Current Implementation
- **PHASE SHIFT 2025**: Active team (default view).
- **UTSAV 2025**: Archived team.

### How to Adjust/Add New Event Teams
1. **Update HTML** (`public/aboutus.html`):
   - Add to dropdown: `<option value="new-event-2026">NEW EVENT 2026</option>`.
   - Create sections: Duplicate existing team divs (e.g., `#phase-shift-2025-leadership`) and rename IDs (e.g., `#new-event-2026-leadership`). Update member details manually.

2. **Update JavaScript** (in `public/aboutus.html` or a separate JS file):
   ```javascript
   // In the switch function, add:
   else if (selectedEvent === 'new-event-2026') {
     document.getElementById('new-event-2026-leadership').style.display = 'block';
     // Hide others...
   }
   ```

3. **Update CSS** (`public/css/about.css`):
   - Add styles for new sections: `.team-archive { transition: opacity 0.3s; }`.
   - Adjust for responsiveness: Use media queries for mobile team cards.

4. **Testing**: Switch teams in browser and verify display. Update member photos in `public/img/people/`.

## 🛠️ Detailed Adjustment Guides

### How to Modify the Hero Section
1. Open `public/index.html`.
2. Locate the hero section (usually `<section class="hero">`).
3. To change the title: Edit the `<h1>` tag.
4. To change the subtitle: Edit the `<p>` tag.
5. To change the background: Edit `public/css/index-style.css`, update the `background-image` property in `.hero` class.

### How to Update Team Member Information
1. Open `public/aboutus.html`.
2. Find the team member div (e.g., `<div class="team-member">`).
3. Update name in `<h3>`, designation in `<p>`, photo in `<img src>`, links in `<a>`.

### How to Add a New Event
1. Open `public/event.html`.
2. Duplicate an existing event card div.
3. Update title, date, description, image.
4. If needed, add new CSS in `public/css/event-style.css`.

### How to Modify the Gallery Page
1. Open `public/index1.html`.
2. To add photos: Add new `<img>` tags in the gallery container.
3. For dynamic loading: Edit `public/js/event.js` to fetch from API.

### How to Change Colors/Themes
1. Open `public/css/style.css`.
2. Locate CSS variables at the top (e.g., `--primary-color: #yourcolor;`).
3. Change the hex values.

### How to Add New Dependencies
1. Run `npm install new-package`.
2. Update `server/index.js` to require it.
3. For frontend, add `<script>` or `<link>` in HTML.

### API Endpoints (from server/index.js)
- `GET /` : Serves `index.html`
- `POST /upload` : Handles file uploads to Google Drive
- `GET /gallery` : Returns list of photos
- `GET /events` : Returns event data
- (Add more as needed by editing `server/index.js`)

### How to Debug JavaScript Errors
- Open browser dev tools (F12).
- Check console for errors.
- Use `debugger;` in JS files for breakpoints.

### How to Optimize Images
- Use tools like TinyPNG or ImageOptim.
- Save in WebP format for better compression.
- Update `<img>` tags with new paths in `public/img/`.