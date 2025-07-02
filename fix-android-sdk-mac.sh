#!/bin/bash

# Fix Android SDK configuration on macOS
# This script helps locate and configure the Android SDK path

echo "🔧 Android SDK Configuration Helper for macOS"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check current ANDROID_HOME
echo ""
print_status "Checking current ANDROID_HOME..."
if [ -n "$ANDROID_HOME" ]; then
    echo "ANDROID_HOME is set to: $ANDROID_HOME"
    if [ -d "$ANDROID_HOME" ]; then
        print_success "ANDROID_HOME directory exists"
    else
        print_error "ANDROID_HOME directory does not exist"
    fi
else
    print_warning "ANDROID_HOME is not set"
fi

# Common Android SDK locations on macOS
echo ""
print_status "Searching for Android SDK in common locations..."

POSSIBLE_PATHS=(
    "$HOME/Library/Android/sdk"
    "$HOME/Android/Sdk"
    "$HOME/Library/Android/Sdk"
    "/Applications/Android Studio.app/Contents/android-sdk"
    "/usr/local/android-sdk"
)

FOUND_SDK=""
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "✅ Found SDK at: $path"
        if [ -f "$path/platform-tools/adb" ]; then
            print_success "Valid Android SDK found at: $path"
            FOUND_SDK="$path"
            break
        else
            print_warning "Directory exists but may not be a complete SDK: $path"
        fi
    else
        echo "❌ Not found: $path"
    fi
done

if [ -z "$FOUND_SDK" ]; then
    print_error "No valid Android SDK found in common locations"
    echo ""
    echo "Please ensure Android Studio is properly installed with SDK."
    echo "You can check/install SDK in Android Studio:"
    echo "  1. Open Android Studio"
    echo "  2. Go to Preferences > Appearance & Behavior > System Settings > Android SDK"
    echo "  3. Note the SDK Location path"
    echo "  4. Ensure SDK Platform and SDK Build-Tools are installed"
    exit 1
else
    print_success "Android SDK located at: $FOUND_SDK"
fi

# Create local.properties file
echo ""
print_status "Creating local.properties file..."
LOCAL_PROPS_FILE="android/local.properties"

if [ ! -f "$LOCAL_PROPS_FILE" ]; then
    mkdir -p "$(dirname "$LOCAL_PROPS_FILE")"
fi

echo "sdk.dir=$FOUND_SDK" > "$LOCAL_PROPS_FILE"
print_success "Created $LOCAL_PROPS_FILE with SDK path"

# Update shell profile for permanent ANDROID_HOME
echo ""
print_status "Setting up ANDROID_HOME environment variable..."

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    if [ -f "$HOME/.bash_profile" ]; then
        SHELL_PROFILE="$HOME/.bash_profile"
    else
        SHELL_PROFILE="$HOME/.bashrc"
    fi
    SHELL_NAME="bash"
else
    SHELL_PROFILE="$HOME/.profile"
    SHELL_NAME="shell"
fi

echo "Detected $SHELL_NAME shell, using profile: $SHELL_PROFILE"

# Check if ANDROID_HOME is already in profile
if grep -q "ANDROID_HOME" "$SHELL_PROFILE" 2>/dev/null; then
    print_warning "ANDROID_HOME already exists in $SHELL_PROFILE"
    echo "You may need to update it manually or source your profile:"
    echo "  source $SHELL_PROFILE"
else
    echo "" >> "$SHELL_PROFILE"
    echo "# Android SDK" >> "$SHELL_PROFILE"
    echo "export ANDROID_HOME=\"$FOUND_SDK\"" >> "$SHELL_PROFILE"
    echo "export PATH=\"\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/tools:\$ANDROID_HOME/cmdline-tools/latest/bin:\$PATH\"" >> "$SHELL_PROFILE"
    print_success "Added ANDROID_HOME to $SHELL_PROFILE"
fi

# Export for current session
export ANDROID_HOME="$FOUND_SDK"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo ""
print_status "Verifying setup..."

# Verify SDK tools
if [ -f "$ANDROID_HOME/platform-tools/adb" ]; then
    print_success "ADB found: $ANDROID_HOME/platform-tools/adb"
else
    print_warning "ADB not found. You may need to install platform-tools in Android Studio"
fi

if [ -d "$ANDROID_HOME/platforms" ] && [ "$(ls -A $ANDROID_HOME/platforms)" ]; then
    PLATFORM_COUNT=$(ls "$ANDROID_HOME/platforms" | wc -l)
    print_success "Found $PLATFORM_COUNT Android platform(s)"
else
    print_warning "No Android platforms found. Install at least one in Android Studio"
fi

if [ -d "$ANDROID_HOME/build-tools" ] && [ "$(ls -A $ANDROID_HOME/build-tools)" ]; then
    BUILD_TOOLS_COUNT=$(ls "$ANDROID_HOME/build-tools" | wc -l)
    print_success "Found $BUILD_TOOLS_COUNT build-tools version(s)"
else
    print_warning "No build-tools found. Install build-tools in Android Studio"
fi

echo ""
print_success "Setup completed!"
echo ""
echo "📋 Summary:"
echo "  • SDK Location: $FOUND_SDK"
echo "  • local.properties: ✅ Created"
echo "  • ANDROID_HOME: ✅ Set for current session"
echo "  • Shell profile: ✅ Updated ($SHELL_PROFILE)"
echo ""
echo "🔄 Next steps:"
echo "  1. Restart your terminal OR run: source $SHELL_PROFILE"
echo "  2. Verify with: echo \$ANDROID_HOME"
echo "  3. Try building again: ./build-android.sh"
echo ""
echo "🛠️ If you still have issues:"
echo "  • Open Android Studio > SDK Manager"
echo "  • Install missing components (Platform Tools, Build Tools, etc.)"
echo "  • Verify SDK location in Android Studio settings"