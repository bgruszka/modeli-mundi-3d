# Android Deployment Guide

This guide explains how to compile your Historical Universe Models web app to Android APK and deploy it to Google Play Store.

## Overview

Your HTML/JS web application has been configured with **Capacitor** to enable native Android compilation. The setup includes:

- ✅ Android platform configuration
- ✅ App icons for all required resolutions
- ✅ Proper Android manifest configuration
- ✅ Build scripts for development and production
- ✅ Google Play Store optimization

## Prerequisites

### System Requirements
- **Node.js** 16+ and npm
- **Android Studio** (latest version)
- **Java Development Kit (JDK)** 11 or higher
- **Android SDK** with API level 33+

### Installation Steps

1. **Install Android Studio**:
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK and build tools
   - Set up Android Virtual Device (AVD) for testing

2. **Configure Environment Variables**:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

## Development Workflow

### 1. Building the Web Assets
```bash
# Copy web assets to dist folder
npm run build
```

### 2. Sync with Android
```bash
# Copy assets and sync plugins
npm run android:build
```

### 3. Open in Android Studio
```bash
# Open the android project in Android Studio
npm run android:open
```

### 4. Run on Device/Emulator
```bash
# Build and run on connected device/emulator
npm run android:run
```

## Production Build Process

### 1. Create Keystore (One-time setup)

For Google Play Store deployment, you need to sign your APK with a private key:

```bash
cd android/app
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Important**: Keep your keystore file and passwords secure. You'll need them for all future updates.

### 2. Configure Signing

Create `android/keystore.properties`:
```properties
storePassword=yourStorePassword
keyPassword=yourKeyPassword
keyAlias=my-key-alias
storeFile=my-release-key.keystore
```

Update `android/app/build.gradle` signing configuration:
```gradle
signingConfigs {
    release {
        def keystorePropertiesFile = rootProject.file("keystore.properties")
        def keystoreProperties = new Properties()
        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
        
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
```

### 3. Build Release APK

```bash
cd android
./gradlew assembleRelease
```

The signed APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

### 4. Build Android App Bundle (Recommended)

For Google Play Store, use Android App Bundle format:

```bash
cd android
./gradlew bundleRelease
```

The AAB file will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

## Google Play Store Deployment

### 1. Prepare Store Assets

The following assets have been generated in `play-store-assets/`:

- **App Icon**: `play-store-icon.png` (512×512)
- **Feature Graphic**: `feature-graphic.png` (1024×500)

You'll also need to create:
- Screenshots (phone, tablet, wear, TV as applicable)
- Privacy Policy URL
- App description and metadata

### 2. Play Console Setup

1. **Create Developer Account**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Pay the $25 one-time registration fee
   - Complete account verification

2. **Create New App**:
   - Click "Create app"
   - Choose app name: "Historical Universe Models"
   - Select "App" as default language
   - Choose "Free" or "Paid" (recommend Free)
   - Confirm declarations

### 3. App Information

Fill out the required information:

- **App name**: Historical Universe Models
- **Short description**: Interactive 3D exploration of historical astronomical models
- **Full description**:
```
Explore the evolution of humanity's understanding of the cosmos through interactive 3D visualizations of historical astronomical models.

Features:
• Five major historical models: Aristotle, Ptolemaic, Copernican, Galilean, and Kepler
• Real-time 3D animations of planetary motions
• Educational information about each model
• Interactive controls for lighting and viewing
• Realistic planet textures and atmospheric effects
• Mobile-optimized touch controls

Perfect for students, educators, and astronomy enthusiasts who want to understand how our view of the universe evolved from ancient times to the early modern period.
```

- **App category**: Education
- **Content rating**: Everyone
- **Target audience**: 13+ (educational content)

### 4. Store Listing Assets

Upload the generated assets:
- App icon (512×512): `play-store-assets/play-store-icon.png`
- Feature graphic (1024×500): `play-store-assets/feature-graphic.png`
- Screenshots: Capture from running app on different devices

### 5. Content Rating

Complete the content rating questionnaire:
- Select "Education" category
- Answer questions about educational content
- Content should receive "Everyone" rating

### 6. App Signing

- Enable "Google Play App Signing" (recommended)
- Upload your app bundle (.aab file)
- Google will manage your app signing key

### 7. Release Management

1. **Internal Testing** (optional but recommended):
   - Upload your AAB file
   - Add internal testers
   - Test the app thoroughly

2. **Production Release**:
   - Upload the final AAB file
   - Complete all required information
   - Submit for review

## App Updates

For future updates:

1. Update `versionCode` and `versionName` in `android/app/build.gradle`
2. Make your changes to the web app
3. Run the build process
4. Upload new AAB to Play Console
5. Submit for review

## Troubleshooting

### Common Issues

1. **Build Errors**:
   ```bash
   # Clean and rebuild
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

2. **WebGL Issues**:
   - Ensure `android:hardwareAccelerated="true"` in manifest
   - Test on real devices, not just emulators

3. **Performance Issues**:
   - Enable ProGuard/R8 optimization in release builds
   - Test on lower-end devices

4. **File Access Issues**:
   - Ensure all assets are in the correct directories
   - Check CORS configuration if needed

### Testing Checklist

- [ ] App launches correctly
- [ ] 3D graphics render properly
- [ ] Touch controls work smoothly
- [ ] All model switching functions work
- [ ] Lighting controls are responsive
- [ ] App handles rotation correctly
- [ ] Performance is acceptable on target devices

## Security Notes

- **Never commit keystore files** to version control
- Store keystore and passwords securely
- Use different keystores for debug and release
- Enable ProGuard for release builds
- Review all permissions in AndroidManifest.xml

## Support

For technical issues:
- Check Capacitor documentation: [capacitorjs.com](https://capacitorjs.com)
- Android developer documentation: [developer.android.com](https://developer.android.com)
- Play Console help: [support.google.com/googleplay](https://support.google.com/googleplay/android-developer)

## File Structure

```
├── android/                           # Native Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml   # App manifest
│   │   │   └── res/mipmap-*/         # App icons
│   │   └── build.gradle              # Build configuration
│   └── keystore.properties          # Signing configuration (create this)
├── capacitor.config.ts               # Capacitor configuration
├── dist/                            # Built web assets
├── play-store-assets/               # Generated store assets
├── app-icon.svg                     # Source icon
├── generate-icons.sh               # Icon generation script
└── package.json                    # Build scripts
```

---

Your Historical Universe Models app is now ready for Android deployment! 🚀🌌