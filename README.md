# Expense Tracker PWA

A modern, responsive Progressive Web App for tracking expenses, setting budgets, and managing finances.

## Features

- **Budget Management**: Set and track your monthly budget
- **Expense Tracking**: Add expenses with custom categories and descriptions
- **Real-time Calculations**: Automatic updates of spent amount and remaining balance
- **Progress Visualization**: Visual progress bar showing budget usage
- **Currency Support**: Multiple currency options with automatic formatting
- **Offline Support**: Works without internet connection
- **Installable**: Can be installed on mobile devices and desktop
- **Responsive Design**: Optimized for mobile and desktop use

## PWA Features

- ✅ **Service Worker**: Caches app for offline use
- ✅ **Web App Manifest**: Defines app properties and icons
- ✅ **Install Prompt**: Automatic installation suggestion
- ✅ **Update Notifications**: Notifies users of app updates
- ✅ **Offline Functionality**: Works without internet connection
- ✅ **App-like Experience**: Full-screen standalone mode

## Setup Instructions

### 1. Generate Icons

1. Open `generate-icons.html` in your browser
2. Click the download buttons for each icon size
3. Create an `icons` folder in your project directory
4. Save all downloaded icons in the `icons` folder

### 2. Serve the App

You need to serve the app over HTTPS (or localhost) for PWA features to work:

#### Option A: Using Python (Simple)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option B: Using Node.js
```bash
# Install serve globally
npm install -g serve

# Serve the app
serve -s . -l 8000
```

#### Option C: Using Live Server (VS Code Extension)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### 3. Test PWA Features

1. Open the app in Chrome/Edge
2. Open Developer Tools (F12)
3. Go to Application tab
4. Check:
   - Manifest (should show app details)
   - Service Workers (should show registered worker)
   - Storage (should show cached files)

### 4. Install on Mobile

1. Open the app on your mobile device
2. Look for the "Add to Home Screen" prompt
3. Or manually:
   - **iOS Safari**: Tap the share button → "Add to Home Screen"
   - **Android Chrome**: Tap the menu → "Add to Home Screen"

## File Structure

```
expense-tracker/
├── index.html              # Main HTML file
├── style.css               # Styles and PWA notification styles
├── script.js               # Main JavaScript with PWA features
├── manifest.json           # PWA manifest file
├── sw.js                   # Service Worker
├── generate-icons.html     # Icon generator tool
├── README.md              # This file
└── icons/                 # PWA icons (create this folder)
    ├── icon-16x16.png
    ├── icon-32x32.png
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-180x180.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## PWA Requirements Checklist

- ✅ **HTTPS or localhost**: Required for service workers
- ✅ **Web App Manifest**: Defines app properties
- ✅ **Service Worker**: Enables offline functionality
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **App-like Experience**: Standalone display mode
- ✅ **Installable**: Can be added to home screen
- ✅ **Offline Capable**: Works without internet
- ✅ **Fast Loading**: Optimized performance

## Browser Support

- **Chrome**: Full PWA support
- **Edge**: Full PWA support
- **Firefox**: Full PWA support
- **Safari**: Limited PWA support (iOS 11.3+)
- **Mobile Browsers**: Varies by platform

## Customization

### Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --primary: #6366f1;      /* Main brand color */
    --bg: #0f172a;          /* Background color */
    --card: #111827;        /* Card background */
    /* ... other colors */
}
```

### App Details
Edit `manifest.json` to change:
- App name and description
- Theme colors
- Display mode
- Icons

### Service Worker
Edit `sw.js` to:
- Change caching strategy
- Add background sync
- Handle push notifications

## Troubleshooting

### PWA Not Installing
- Ensure you're serving over HTTPS or localhost
- Check that manifest.json is accessible
- Verify all icon files exist in the icons folder
- Check browser console for errors

### Service Worker Not Registering
- Check browser console for registration errors
- Ensure sw.js is in the root directory
- Verify HTTPS/localhost requirement

### Icons Not Loading
- Check that icons folder exists
- Verify icon file names match manifest.json
- Ensure icons are valid PNG files

## License

This project is open source and available under the MIT License.
