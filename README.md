# Historical Models of the Universe - 3D Explorer

An interactive web application that visualizes different historical models of the cosmos using Three.js. Explore how humanity's understanding of the universe evolved from ancient times to the early modern period.

**NEW: Now available as an Android app!** 📱

## 🌐 Live Demo

**View the application live:** [https://bgruszka.github.io/modeli-mundi-3d](https://bgruszka.github.io/modeli-mundi-3d)

## Features

### 🌌 Historical Models Included
- **Aristotle's Model (384-322 BC)**: Geocentric model with crystalline spheres
- **Ptolemaic Model (150 AD)**: Geocentric model with epicycles to explain retrograde motion
- **Copernican Model (1543)**: Revolutionary heliocentric model with circular orbits
- **Galilean Model (1610)**: Heliocentric model featuring Jupiter's four largest moons
- **Kepler's Model (1609)**: Refined heliocentric model with elliptical orbits

### 🎮 Interactive Features
- **3D Navigation**: Rotate, zoom, and pan around each cosmic model
- **Real-time Animations**: Watch planets and celestial bodies move according to each model
- **Animation Controls**: Pause/play animations with dedicated controls
- **Educational Information**: Detailed descriptions of each historical model
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 🎨 Enhanced Visual Features
- **Realistic Planet Textures**: High-quality NASA imagery for all planets and moons
- **Procedural Fallbacks**: Beautiful procedural textures when images can't load
- **Saturn's Rings**: Detailed ring system with multiple layers and realistic tilt
- **Enhanced Star Field**: Multi-colored stars with varying sizes and realistic distribution
- **Advanced Lighting**: Atmospheric rim lighting and realistic shadows
- **Planetary Rotation**: Each celestial body rotates at its own realistic speed
- **Modern UI**: Glassmorphic design with texture loading progress indicators

### 🎛️ Lighting & Animation Controls
- **Dynamic Lighting**: Real-time adjustment of ambient, sun, and rim lighting
- **Brightness Presets**: One-click lighting scenarios (Bright, Dark, Realistic, Dramatic)
- **Animation Toggle**: Pause/play planetary motions with a single button
- **Interactive Sliders**: Fine-tune each light source independently
- **Visual Feedback**: Live percentage displays for all lighting values
- **Orbit Toggle**: Hide/show orbital paths, rings, and epicycles for cleaner viewing
- **Geometry Toggle**: Hide/show wireframe spheres and construction elements (excludes orbits)

## Technology Stack

- **HTML5** - Structure and layout
- **CSS3** - Styling and responsive design
- **JavaScript (ES6+)** - Application logic and interactivity
- **Three.js** - 3D graphics and animations
- **WebGL** - Hardware-accelerated rendering
- **Capacitor** - Native mobile app compilation

## Getting Started

### Prerequisites
- A modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)
- Internet connection (for CDN resources)

### Installation
1. Clone or download this repository
2. Run the application using one of these methods:

**Method 1: Using Python (Recommended)**
```bash
python3 start_server.py
```
The application will automatically open in your browser.

**Method 2: Using any HTTP server**
```bash
# Using Python's built-in server
python3 -m http.server 8000

# Using Node.js http-server (if installed)
npx http-server

# Using PHP (if installed)
php -S localhost:8000
```
Then open http://localhost:8000 in your browser.

**Method 3: Direct file access**
Simply open `index.html` in your web browser (may have limitations with some browsers due to CORS policies).

## 📱 Android App Compilation

### Quick Start
To compile this web app to an Android APK:

```bash
# Install dependencies
npm install

# Build for Android
./build-android.sh
```

### Development Workflow
```bash
# Build web assets
npm run build

# Sync with Android
npm run android:build

# Open in Android Studio
npm run android:open

# Run on device/emulator
npm run android:run
```

### Google Play Store Deployment
For complete instructions on building release APKs and deploying to Google Play Store, see **[ANDROID_DEPLOYMENT.md](ANDROID_DEPLOYMENT.md)**.

The setup includes:
- ✅ Capacitor configuration for Android
- ✅ App icons for all Android densities
- ✅ Optimized Android manifest
- ✅ Production build configuration
- ✅ Google Play Store assets
- ✅ Comprehensive deployment guide

### File Structure
```
/
├── index.html          # Main application file
├── demo.html           # Demo/landing page
├── start_server.py     # Python server script
├── js/
│   └── app.js         # Main JavaScript application
├── android/           # Native Android project (auto-generated)
├── capacitor.config.ts # Capacitor configuration
├── build-android.sh   # Automated build script
├── generate-icons.sh  # Icon generation script
├── app-icon.svg       # Source app icon
├── play-store-assets/ # Google Play Store graphics
├── ANDROID_DEPLOYMENT.md # Complete deployment guide
└── README.md          # Documentation
```

## Usage

### Controls
- **Mouse**: Rotate the view around the cosmic model
- **Mouse Wheel**: Zoom in and out
- **Right-click + Drag**: Pan the view
- **Touch Devices**: Pinch to zoom, swipe to rotate

### Lighting Controls
- **Scene Controls Panel**: Located in the top-right corner
- **Ambient Light Slider**: Adjust overall scene brightness (0-100%)
- **Sun Intensity Slider**: Control the main light source power (0-300%)
- **Rim Light Slider**: Fine-tune edge lighting for planet definition (0-100%)
- **Pause/Play Button**: Stop or resume all animations
- **Reset Button**: Return lighting to default values
- **Preset Buttons**: Quick lighting scenarios for different viewing preferences
- **Orbits Button**: Toggle visibility of orbital paths, rings, and epicycles
- **Geometry Button**: Toggle visibility of wireframe spheres and construction elements (independent of orbits)

### Switching Models
Click any of the model buttons in the left panel to switch between different historical representations of the universe.

## Educational Content

### Aristotle's Geocentric Model
The earliest systematic model placing Earth at the center, surrounded by concentric crystalline spheres carrying celestial bodies. This model dominated Western thought for nearly 2,000 years.

### Ptolemaic Model with Epicycles
A sophisticated geocentric system using epicycles (small circles) to explain the complex motions of planets, particularly retrograde motion. This model successfully predicted planetary positions and was used for over 1,000 years.

### Copernican Heliocentric Model
A revolutionary shift placing the Sun at the center with planets orbiting in circular paths. This model challenged the Earth-centered worldview and laid the foundation for modern astronomy.

### Galilean Model with Moons
Enhanced the Copernican model by incorporating Galileo's telescopic discoveries, including Jupiter's four largest moons (Io, Europa, Ganymede, Callisto), which provided strong evidence against geocentric models.

### Kepler's Elliptical Orbits
The most accurate historical model, using elliptical rather than circular orbits based on careful observations of Mars. This model could accurately predict planetary positions and formed the basis for Newton's laws.

## Technical Details

### Architecture
The application follows a modular, object-oriented design:
- `UniverseExplorer` class manages the entire application
- Separate methods for each historical model
- Modular animation system
- Clean resource management

### Performance Optimizations
- Efficient geometry reuse
- Optimized rendering pipeline
- Responsive animations
- Memory management for scene switching

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### Android Compatibility
- Android 5.0+ (API level 21)
- OpenGL ES 2.0 support
- WebGL-enabled WebView

## Development

### Adding New Models
To add a new historical model:

1. Add model info to the `modelInfo` object
2. Create a new button in the HTML
3. Add a case to the `loadModel()` switch statement
4. Implement the `createNewModel()` method
5. Update animations in `updateAnimations()`

### Customization
The application is highly customizable:
- Modify colors, sizes, and speeds in each model method
- Adjust camera settings in `setupScene()`
- Change lighting in `setupLights()`
- Customize UI styling in the CSS

## 🚀 Deployment

This project is automatically deployed to GitHub Pages via GitHub Actions. Any push to the `main` branch will trigger a new deployment.

### Manual Deployment

```bash
# Build and deploy
npm run deploy
```

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Ancient and medieval astronomers for their groundbreaking work
- The Three.js community for excellent documentation
- Historical astronomy resources for accurate model representations
- Capacitor team for enabling easy web-to-mobile conversion

## Future Enhancements

Potential improvements could include:
- Additional historical models (Chinese, Islamic astronomy)
- ~~More detailed planetary textures~~ ✅ **COMPLETED**
- ~~Android/iOS mobile app~~ ✅ **ANDROID COMPLETED**
- Sound effects and background music
- Advanced physics simulations
- Normal/bump mapping for surface details
- Animated atmospheric effects for gas giants
- VR/AR support
- Multi-language support
- iOS app compilation

---

*Explore the cosmos through the eyes of history!* 🌟📱
