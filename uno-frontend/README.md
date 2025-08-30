# UNO Game - Frontend

A modern, responsive web frontend for the real-time multiplayer UNO card game. Built with HTML5, CSS3, and vanilla JavaScript, this frontend provides an intuitive user interface that connects to the UNO backend server via Socket.IO for real-time gameplay, user authentication, and room management.

## Why This New Structure?

The frontend has been reorganized from a flat file structure into a modern, professional layout that follows industry best practices:

- **Separation of Concerns**: Source code (`src/`) is clearly separated from static assets (`public/`)
- **Maintainability**: Easier to locate and modify specific files (styles, scripts, images)
- **Scalability**: Structure supports future growth and additional features
- **Developer Experience**: Clear organization makes onboarding new developers faster
- **Build Process Ready**: Structure is compatible with modern build tools and deployment pipelines

## Directory Layout

```
uno-frontend/
├── index.html         # Main HTML file (The entry point)
├── package.json       # Project dependencies & scripts
├── README.md          # This documentation
├── src/               # All source code lives here
│   ├── css/
│   │   └── style.css  # All application styles
│   └── js/
│       └── app.js     # All JavaScript logic
└── public/            # All static files (images, fonts, etc.)
    └── assets/
        └── images/
            ├── unobg.jpg      # Background image
            ├── add-user.png   # UI icons
            ├── avatar/        # Player avatar images
            │   ├── a1.jpg
            │   ├── a2.jpg
            │   ├── ...
            │   └── a6.jpg
            └── cards/         # UNO card images
                ├── +4.jpg     # Wild Draw 4
                ├── wild.jpg   # Wild card
                ├── r0.jpg     # Red 0
                ├── r1.jpg     # Red 1
                ├── ...
                └── yskip.jpg  # Yellow Skip
```

## How to Run the Frontend

Follow these steps to get the frontend running on your local machine:

### Step 1: Install Dependencies
Navigate to the `uno-frontend` directory and install the required packages:
```bash
cd uno-frontend
npm install
```
This will install Socket.IO client and other dependencies needed for real-time communication.

### Step 2: Start the Backend Server
**IMPORTANT**: The backend server must be running first! Open a new terminal and start the backend:
```bash
cd ../uno-backend
node server.js
```
You should see a message indicating the server is running on port 3001.

### Step 3: Start the Frontend Server
In the `uno-frontend` directory, start a local web server. Choose one of these options:

**Option A - Using npx (Recommended):**
```bash
npx live-server .
```

**Option B - Using Python:**
```bash
python -m http.server 8000
```

**Option C - Using Node.js http-server:**
```bash
npx http-server . -p 8000
```

The frontend will be available at `http://localhost:8000` (or the port shown in your terminal).

## Understanding File Paths (Crucial for Development)

When working with the new structure, understanding relative file paths is essential:

### From `index.html` (Root Level)
When referencing files from the main HTML file, paths start from the project root:
```html
<!-- CSS files -->
<link rel="stylesheet" href="src/css/style.css">

<!-- JavaScript files -->
<script src="src/js/app.js"></script>

<!-- Images can be referenced directly -->
<img src="public/assets/images/avatar/a1.jpg" alt="Avatar">
```

### From `style.css` (Inside src/css/)
When referencing images from CSS, you need to go up directories to reach `public/`:
```css
/* Background image - go up two levels to reach public/ */
.animated-bg {
    background-image: url('../../public/assets/images/unobg.jpg');
}

/* Avatar images */
.avatar-img {
    content: url('../../public/assets/images/avatar/a1.jpg');
}
```

### From `app.js` (Inside src/js/)
When the browser executes JavaScript, it thinks from the perspective of `index.html`. Therefore, use paths relative to the project root:
```javascript
// Correct way to reference images in JavaScript
const avatarPath = 'public/assets/images/avatar/a1.jpg';
const cardPath = 'public/assets/images/cards/r5.jpg';

// Setting image sources
document.getElementById('avatar').src = avatarPath;
```

## Backend Connection

The frontend is configured to connect to the UNO backend server running at `http://localhost:3001`. This connection handles:

- **REST API calls** for user authentication and room management
- **WebSocket connections** for real-time gameplay via Socket.IO

### Configuration
The backend URL is configured at the top of `src/js/app.js`:
```javascript
const API_BASE_URL = 'http://localhost:3001';
```

To connect to a different backend server (e.g., for production), simply update this constant:
```javascript
const API_BASE_URL = 'https://your-production-server.com';
```

## 🆕 New Features Supported

This frontend supports all the latest backend features:

### Limbo State (Play After Draw)
- **New UI Elements**: "Play Drawn Card" and "Keep Card & Pass" buttons
- **Dynamic Display**: Buttons appear only when player draws a playable card
- **User Guidance**: Clear messages guide players through the limbo state
- **Wild Card Handling**: Automatic color selection prompts for wild cards

### Enhanced Authentication
- **User Registration**: Complete signup flow with avatar selection
- **User Profiles**: Display names and avatars throughout the game
- **Session Management**: Persistent login state

### Real-time Gameplay
- **Live Game Updates**: Instant synchronization of all game state changes
- **Player Status**: Real-time display of active/inactive players
- **Turn Indicators**: Clear visual indicators for whose turn it is

## Game Features

### 🎮 Core Gameplay
- Complete UNO card game with official rules
- Real-time multiplayer (2-10 players)
- Turn-based gameplay with visual turn indicators
- Automatic game state synchronization

### 🎨 User Interface
- Modern, responsive design that works on all devices
- Animated background with floating UNO-colored circles
- Card animations and hover effects
- Mobile-friendly touch controls

### 🏠 Room Management
- Create private game rooms with shareable codes
- Join existing rooms using room codes
- Real-time lobby with player avatars
- Host controls for starting games

### 👤 User System
- User registration and authentication
- Avatar selection from 6 different options
- Player profiles with game statistics
- Persistent user sessions

## Development Tips

### File Organization Best Practices
- **Keep CSS organized**: Use comments to separate different UI sections
- **JavaScript modularity**: Consider breaking `app.js` into smaller modules as it grows
- **Image optimization**: Compress images in `public/assets/images/` for better performance
- **Consistent naming**: Follow the existing naming conventions for new files

### Debugging
- **Browser DevTools**: Use the Console tab to see JavaScript errors and Socket.IO events
- **Network Tab**: Monitor API calls and WebSocket connections
- **Live Reloading**: Use `live-server` for automatic page refresh during development

### Common Development Tasks
- **Adding new avatars**: Place images in `public/assets/images/avatar/` and update the HTML
- **Styling changes**: Edit `src/css/style.css` and refresh the browser
- **JavaScript updates**: Modify `src/js/app.js` and reload the page
- **New card designs**: Replace images in `public/assets/images/cards/`

## Troubleshooting

### Common Issues

**1. Backend connection failed**
- Ensure the backend server is running on port 3001
- Check the `API_BASE_URL` in `src/js/app.js`
- Verify no firewall is blocking the connection

**2. Images not loading**
- Check file paths are correct relative to `index.html`
- Verify image files exist in `public/assets/images/`
- Check browser console for 404 errors

**3. Styles not applying**
- Verify CSS file path in `index.html` is correct
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check for CSS syntax errors in browser DevTools

**4. JavaScript errors**
- Open browser Developer Tools (F12)
- Check Console tab for error messages
- Verify Socket.IO library is loading correctly

## Production Deployment

When deploying to production:

1. **Update API URL**: Change `API_BASE_URL` in `src/js/app.js` to your production backend
2. **Optimize assets**: Minify CSS/JS and compress images
3. **Configure server**: Set up proper MIME types for all file extensions
4. **HTTPS**: Ensure both frontend and backend use HTTPS in production
5. **CORS**: Configure backend CORS settings for your production domain

## Contributing

1. Follow the existing code style and organization
2. Test all changes with the backend server running
3. Ensure responsive design works on mobile devices
4. Add comments for complex JavaScript functions
5. Update this README if you change the project structure

## License

MIT License - see LICENSE file for details.
