#!/bin/bash

# Automated build script for Historical Universe Models Android app
# This script handles the complete build process from web assets to Android APK

set -e  # Exit on any error

echo "🚀 Building Historical Universe Models for Android..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm."
    exit 1
fi

if ! command -v npx &> /dev/null; then
    print_error "npx is not available. Please update your npm installation."
    exit 1
fi

print_success "Prerequisites check passed"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing npm dependencies..."
    npm install
    print_success "Dependencies installed"
fi

# Build web assets
print_status "Building web assets..."
npm run build
print_success "Web assets built"

# Sync with Android
print_status "Syncing with Android platform..."
npx cap sync android
print_success "Android sync completed"

# Check if Android development environment is available
if command -v gradle &> /dev/null || [ -f "android/gradlew" ]; then
    print_status "Android development environment detected"
    
    # Ask user what type of build they want
    echo ""
    echo "Choose build type:"
    echo "1) Debug APK (for testing)"
    echo "2) Release APK (requires signing setup)"
    echo "3) Android App Bundle (for Play Store)"
    echo "4) Open in Android Studio"
    echo "5) Run on device/emulator"
    echo "6) Skip Android build"
    
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            print_status "Building debug APK..."
            cd android
            ./gradlew assembleDebug
            print_success "Debug APK built: android/app/build/outputs/apk/debug/app-debug.apk"
            ;;
        2)
            if [ ! -f "android/keystore.properties" ]; then
                print_warning "Signing configuration not found. Debug APK will be built instead."
                print_warning "To create release APK, see ANDROID_DEPLOYMENT.md for signing setup."
                cd android
                ./gradlew assembleDebug
                print_success "Debug APK built: android/app/build/outputs/apk/debug/app-debug.apk"
            else
                print_status "Building release APK..."
                cd android
                ./gradlew assembleRelease
                print_success "Release APK built: android/app/build/outputs/apk/release/app-release.apk"
            fi
            ;;
        3)
            if [ ! -f "android/keystore.properties" ]; then
                print_error "Signing configuration required for App Bundle. See ANDROID_DEPLOYMENT.md"
                exit 1
            else
                print_status "Building Android App Bundle..."
                cd android
                ./gradlew bundleRelease
                print_success "App Bundle built: android/app/build/outputs/bundle/release/app-release.aab"
            fi
            ;;
        4)
            print_status "Opening Android Studio..."
            npx cap open android
            ;;
        5)
            print_status "Running on device/emulator..."
            npx cap run android
            ;;
        6)
            print_status "Skipping Android build"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
else
    print_warning "Android development environment not detected"
    print_warning "Please install Android Studio and SDK to build APK files"
    print_status "You can still open the project in Android Studio:"
    echo "    npx cap open android"
fi

echo ""
print_success "Build process completed!"
echo ""
print_status "Next steps:"
echo "• For testing: Install the APK on an Android device"
echo "• For Play Store: Follow the deployment guide in ANDROID_DEPLOYMENT.md"
echo "• For development: Use 'npm run android:open' to open in Android Studio"
echo ""
print_status "Generated files:"
echo "• App icons: android/app/src/main/res/mipmap-*/"
echo "• Play Store assets: play-store-assets/"
echo "• Build outputs: android/app/build/outputs/"
echo ""
print_success "Happy coding! 🌌"