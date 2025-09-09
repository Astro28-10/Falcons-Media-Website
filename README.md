# Falcons Media Website 📸

A modern, responsive website for **Falcons of BMSCE** - the official photography club of BMS College of Engineering. This website serves as a digital gallery, team showcase, and event management platform.

## 🌟 Features

### 🖼️ Gallery & Media Management
- **Interactive Photo Gallery**: Browse through captured moments from various events
- **Google Drive Integration**: Seamless file upload and management
- **Event-wise Organization**: Photos organized by events and categories
- **Responsive Image Display**: Optimized viewing across all devices

### 👥 Team Archive System
- **Dynamic Team Display**: Switch between current and past event teams
- **Event-based Team History**: Preserve core team memories for each event
- **Role-based Organization**: Leadership, Junior Coordinators, and Photography Team sections
- **Social Media Integration**: Direct links to team members' profiles

### 🎯 Events & Activities
- **Event Showcase**: Dedicated pages for major events like UTSAV and PHASE SHIFT
- **Interactive Event Cards**: Engaging display of event information
- **Photo Collections**: Event-specific photo galleries

### 🔧 Technical Features
- **Modern UI/UX**: Clean, professional design with smooth transitions
- **Mobile-First Design**: Fully responsive across all screen sizes
- **Google Drive API**: Automated file management and organization
- **Express.js Backend**: Robust server-side functionality
- **File Upload System**: Secure and efficient file handling

## 🚀 Live Demo

Visit the live website: [Falcons Media Website](https://your-domain.com)

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript**: Interactive functionality and DOM manipulation
- **Google Fonts**: Typography (Inter & Playfair Display)
- **Font Awesome**: Icon library

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **Google APIs**: Drive API integration
- **Multer**: File upload middleware
- **CORS**: Cross-origin resource sharing

### Dependencies
```json
{
  "express": "^4.18.2",
  "googleapis": "^133.0.0",
  "multer": "^1.4.5-lts.1",
  "cors": "^2.8.5",
  "archiver": "^5.3.2",
  "dotenv": "^16.3.1"
}
```

## 📁 Project Structure

```
Falcons-Media-Website/
├── public/                     # Frontend assets
│   ├── index.html             # Main landing page
│   ├── index1.html            # Gallery page
│   ├── aboutus.html           # Team showcase page
│   ├── event.html             # Events page
│   ├── css/                   # Stylesheets
│   │   ├── style.css          # Main styles
│   │   ├── index-style.css    # Landing page styles
│   │   ├── about.css          # About page styles
│   │   └── event-style.css    # Event page styles
│   ├── js/                    # JavaScript files
│   │   ├── event.js           # Event functionality
│   │   ├── event_fixed.js     # Enhanced event features
│   │   └── event_simple.js    # Simplified event handling
│   └── img/                   # Images and assets
│       ├── falconswhite.png   # Logo (white)
│       ├── falconsblack.png   # Logo (black)
│       └── people/            # Team member photos
├── server/                    # Backend code
│   ├── index.js              # Main server file
│   └── auth/                 # Authentication
│       └── credentials.json  # Google API credentials
├── uploads/                  # Temporary upload directory
├── package.json             # Project dependencies
└── README.md               # Project documentation
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account
- Google Drive API credentials

### 1. Clone the Repository
```bash
git clone https://github.com/SujayAgarwal28/Falcons-Media-Website.git
cd Falcons-Media-Website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
GOOGLE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
PORT=3000
```

### 4. Google Drive API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API
4. Create service account credentials
5. Download credentials JSON file
6. Place it in `server/auth/credentials.json`

### 5. Run the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The website will be available at `http://localhost:3000`

## 🎨 Team Archive System

The website features an innovative team archive system that allows visitors to view different event teams:

### Current Implementation
- **PHASE SHIFT 2025**: Current active team
- **UTSAV 2025**: Previous event team (archived)

### Adding New Event Teams

1. **Update HTML Structure** (`aboutus.html`):
```html
<!-- Add new option to dropdown -->
<option value="new-event-2026">NEW EVENT 2026</option>

<!-- Create new team sections -->
<div id="new-event-2026-leadership" class="team-archive" style="display: none;">
  <!-- Team members here -->
</div>
```

2. **Update JavaScript** (`aboutus.html`):
```javascript
else if (selectedEvent === 'new-event-2026') {
  document.getElementById('new-event-2026-leadership').style.display = 'block';
  document.getElementById('new-event-2026-juniors').style.display = 'block';
  document.getElementById('new-event-2026-photographers').style.display = 'block';
}
```

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: Full-featured experience with hover effects
- **Tablet**: Adapted layouts for medium screens
- **Mobile**: Touch-friendly interface with optimized navigation

## 🚀 Deployment

### Railway Deployment
The project is configured for easy deployment on Railway:

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the project: `npm run build` (if applicable)
2. Upload files to your hosting provider
3. Configure environment variables
4. Start the server: `npm start`

## 🤝 Contributing

We welcome contributions to improve the Falcons Media Website! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style Guidelines
- Use consistent indentation (2 spaces)
- Follow semantic HTML practices
- Use meaningful variable and function names
- Comment complex functionality
- Test across different browsers and devices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

### Falcons of BMSCE
- **Instagram**: [@falcons.of.bmsce](https://www.instagram.com/falcons.of.bmsce/)
- **LinkedIn**: [Falcons of BMSCE](https://www.linkedin.com/company/falcons-of-bmsce/)

### Development Team
- **Sujay Agarwal**: [@sujay-agarwal28](https://www.linkedin.com/in/sujay-agarwal28/)
- **Nithin K Patil**: [@nithin_ox](https://instagram.com/nithin_ox)

## 🙏 Acknowledgments

- **BMS College of Engineering** for supporting the photography club
- **Google Drive API** for seamless file management
- **Font Awesome** for beautiful icons
- **Google Fonts** for elegant typography
- All **Falcons team members** for their dedication and creativity

## 📈 Future Enhancements

- [ ] User authentication system
- [ ] Advanced photo filtering and search
- [ ] Real-time notifications for new uploads
- [ ] Integration with social media platforms
- [ ] Mobile app development
- [ ] Enhanced admin panel
- [ ] Automated event creation workflow

---

**Made with ❤️ by the Falcons of BMSCE team**

*Capturing moments, one frame at a time.*
