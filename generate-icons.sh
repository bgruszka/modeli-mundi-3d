#!/bin/bash

# Script to generate Android icons from SVG
# Requires ImageMagick (convert) or rsvg-convert

echo "Generating Android app icons..."

# Check if rsvg-convert is available (preferred for SVG)
if command -v rsvg-convert &> /dev/null; then
    CONVERTER="rsvg-convert"
    echo "Using rsvg-convert for SVG conversion"
elif command -v convert &> /dev/null; then
    CONVERTER="convert"
    echo "Using ImageMagick convert for SVG conversion"
else
    echo "Error: Neither rsvg-convert nor ImageMagick convert found."
    echo "Please install one of them:"
    echo "  Ubuntu/Debian: sudo apt-get install librsvg2-bin"
    echo "  macOS: brew install librsvg"
    echo "  Or for ImageMagick: sudo apt-get install imagemagick"
    exit 1
fi

# Define the icon sizes for Android
declare -A SIZES=(
    ["mipmap-mdpi"]=48
    ["mipmap-hdpi"]=72
    ["mipmap-xhdpi"]=96
    ["mipmap-xxhdpi"]=144
    ["mipmap-xxxhdpi"]=192
)

# Generate icons
for dir in "${!SIZES[@]}"; do
    size=${SIZES[$dir]}
    output_dir="android/app/src/main/res/$dir"
    
    echo "Generating ${size}x${size} icon for $dir..."
    
    if [ "$CONVERTER" = "rsvg-convert" ]; then
        rsvg-convert -w $size -h $size app-icon.svg -o "$output_dir/ic_launcher.png"
        rsvg-convert -w $size -h $size app-icon.svg -o "$output_dir/ic_launcher_round.png"
    else
        convert app-icon.svg -resize ${size}x${size} "$output_dir/ic_launcher.png"
        convert app-icon.svg -resize ${size}x${size} "$output_dir/ic_launcher_round.png"
    fi
done

# Generate Play Store icon (512x512)
echo "Generating Play Store icon (512x512)..."
mkdir -p play-store-assets
if [ "$CONVERTER" = "rsvg-convert" ]; then
    rsvg-convert -w 512 -h 512 app-icon.svg -o "play-store-assets/play-store-icon.png"
else
    convert app-icon.svg -resize 512x512 "play-store-assets/play-store-icon.png"
fi

# Generate feature graphic for Play Store (1024x500)
echo "Generating Play Store feature graphic..."
if [ "$CONVERTER" = "rsvg-convert" ]; then
    rsvg-convert -w 1024 -h 500 app-icon.svg -o "play-store-assets/feature-graphic.png"
else
    convert app-icon.svg -resize 1024x500 -gravity center -extent 1024x500 -background "#0f0f23" "play-store-assets/feature-graphic.png"
fi

echo "Icon generation complete!"
echo "Icons generated in android/app/src/main/res/mipmap-*/"
echo "Play Store assets generated in play-store-assets/"