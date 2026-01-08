# HO-MFA Icon Generation Guide

## Design Overview

The new HO-MFA icons feature a professional healthcare theme with:

- **Shield Shape**: Represents security and protection
- **Teal Gradient** (#20c997 → #0ea5a5): Healthcare trust and credibility
- **Fingerprint Rings**: Biometric authentication theme
- **Medical Cross**: Healthcare/medical system identifier
- **Lock Accent**: Security emphasis

## SVG Files Created

- `icon.svg` - Main icon (256x256, scalable)
- `icon-light-32x32.svg` - Light mode variant (32x32)
- `icon-dark-32x32.svg` - Dark mode variant with dark background
- `apple-icon.svg` - Apple icon with rounded square format

## Converting SVG to PNG

### Option 1: Using Online Tools (Easiest)
1. Visit https://cloudconvert.com/svg-to-png or https://convertio.co/svg-png/
2. Upload each SVG file
3. Set dimensions:
   - `icon.svg` → 256x256 PNG
   - `icon-light-32x32.svg` → 32x32 PNG (rename to `icon-light-32x32.png`)
   - `icon-dark-32x32.svg` → 32x32 PNG (rename to `icon-dark-32x32.png`)
   - `apple-icon.svg` → 180x180 PNG (rename to `apple-icon.png`)

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick
# On macOS: brew install imagemagick
# On Windows: choco install imagemagick
# On Linux: sudo apt-get install imagemagick

# Convert files
convert -density 150 public/icon.svg -resize 256x256 public/icon.png
convert -density 150 public/icon-light-32x32.svg -resize 32x32 public/icon-light-32x32.png
convert -density 150 public/icon-dark-32x32.svg -resize 32x32 public/icon-dark-32x32.png
convert -density 150 public/apple-icon.svg -resize 180x180 public/apple-icon.png
```

### Option 3: Using Node.js (sharp)
```bash
npm install sharp

# Create convert-icons.js
const sharp = require('sharp');

sharp('public/icon.svg')
  .png()
  .resize(256, 256)
  .toFile('public/icon.png');

sharp('public/icon-light-32x32.svg')
  .png()
  .resize(32, 32)
  .toFile('public/icon-light-32x32.png');

sharp('public/icon-dark-32x32.svg')
  .png()
  .resize(32, 32)
  .toFile('public/icon-dark-32x32.png');

sharp('public/apple-icon.svg')
  .png()
  .resize(180, 180)
  .toFile('public/apple-icon.png');

# Run it
node convert-icons.js
```

### Option 4: Using Inkscape (Professional)
```bash
# On macOS: brew install inkscape
# On Windows: Download from https://inkscape.org

inkscape public/icon.svg --export-filename=public/icon.png --export-width=256 --export-height=256
inkscape public/icon-light-32x32.svg --export-filename=public/icon-light-32x32.png --export-width=32 --export-height=32
inkscape public/icon-dark-32x32.svg --export-filename=public/icon-dark-32x32.png --export-width=32 --export-height=32
inkscape public/apple-icon.svg --export-filename=public/apple-icon.png --export-width=180 --export-height=180
```

## Icon Usage

### In Next.js Metadata
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    apple: "/apple-icon.png",
  },
};
```

## Design System

### Colors
- **Primary Teal**: `#20c997` (light) → `#0ea5a5` (dark)
- **White**: `#ffffff` for contrast
- **Dark Background**: `#0d1117` (for dark mode)

### Design Elements
1. **Security Shield**: Main container
2. **Biometric Rings**: Authentication theme
3. **Medical Cross**: Healthcare identifier
4. **Lock Element**: Security emphasis

## Recommended Final Step

After generating PNGs, verify they display correctly:
1. Test in light mode: `icon-light-32x32.png`
2. Test in dark mode: `icon-dark-32x32.png`
3. Test Apple devices: `apple-icon.png`
4. Test browser tab: `icon.png`

All files maintain the HO-MFA branding and healthcare security theme.
