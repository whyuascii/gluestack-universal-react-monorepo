# App Store Screenshot Automation

Automate capturing screenshots from iOS Simulator for App Store and Play Store submissions.

## Overview

The `take-screenshots.sh` script uses `xcrun simctl` to:

1. Open deep links in the iOS Simulator
2. Wait for the screen to load
3. Capture a screenshot
4. Save to an output directory

This automates the tedious process of manually capturing screenshots for app store submissions.

## Quick Start

```bash
# 1. Copy the example config
cp scripts/screenshots.config.example.sh scripts/screenshots.config.sh

# 2. Edit with your app's routes
nano scripts/screenshots.config.sh

# 3. Start iOS Simulator with your app
cd apps/mobile && pnpm ios

# 4. Run the script
./scripts/take-screenshots.sh
```

## Prerequisites

- **macOS** with Xcode installed
- **Xcode Command Line Tools**: `xcode-select --install`
- **iOS Simulator** running with your app open
- **Deep linking** configured in your Expo app

## Configuration

Create `scripts/screenshots.config.sh` with your app's settings:

```bash
# Your app's URL scheme (from app.config.js)
APP_SCHEME="myapp"

# Screenshots to capture (format: "filename|route")
SCREENSHOTS=(
  "01_home|(tabs)/home"
  "02_dashboard|(app)/dashboard"
  "03_settings|(app)/settings"
  "04_modal|MANUAL"  # Pauses for manual setup
)
```

### Route Format

Routes should match your Expo Router file structure:

| File Path                 | Route             |
| ------------------------- | ----------------- |
| `app/(tabs)/home.tsx`     | `(tabs)/home`     |
| `app/(app)/dashboard.tsx` | `(app)/dashboard` |
| `app/(auth)/login.tsx`    | `(auth)/login`    |

### Manual Screenshots

Some screens can't be captured via deep links:

- Modal dialogs (controlled by React state)
- Alert popups
- Screens requiring specific app state

Use `MANUAL` to pause the script:

```bash
SCREENSHOTS=(
  "05_add_modal|MANUAL"  # Script pauses, you trigger the modal, press Enter
)
```

## Usage

### Basic Usage

```bash
./scripts/take-screenshots.sh
```

### Options

| Option                   | Description               | Default                         |
| ------------------------ | ------------------------- | ------------------------------- |
| `-c, --config <file>`    | Config file path          | `scripts/screenshots.config.sh` |
| `-o, --output <dir>`     | Output directory          | `screenshots`                   |
| `-d, --delay <seconds>`  | Delay between screenshots | `3`                             |
| `-s, --simulator <name>` | Simulator name            | `booted`                        |
| `-h, --help`             | Show help                 | -                               |

### Examples

```bash
# Custom output directory
./scripts/take-screenshots.sh -o screenshots/v2.0

# Longer delay for slow screens
./scripts/take-screenshots.sh -d 5

# Different config file
./scripts/take-screenshots.sh -c scripts/screenshots.ipad.config.sh

# Combine options
./scripts/take-screenshots.sh -c scripts/iphone.config.sh -o screenshots/iphone -d 4
```

## App Store Requirements

### iOS App Store

Apple requires screenshots for specific device sizes:

| Device                   | Size (pixels) | Required           |
| ------------------------ | ------------- | ------------------ |
| iPhone 6.7" (15 Pro Max) | 1290 x 2796   | Yes                |
| iPhone 6.5" (11 Pro Max) | 1242 x 2688   | Yes                |
| iPhone 5.5" (8 Plus)     | 1242 x 2208   | Optional           |
| iPad Pro 12.9" (6th gen) | 2048 x 2732   | If supporting iPad |
| iPad Pro 12.9" (2nd gen) | 2048 x 2732   | If supporting iPad |

**Tips:**

- Capture at highest resolution, scale down as needed
- Use consistent styling across all screenshots
- Add device frames and marketing text in post-processing

### Google Play Store

| Type       | Size              | Required              |
| ---------- | ----------------- | --------------------- |
| Phone      | 1080 x 1920 (min) | Yes                   |
| 7" Tablet  | 1080 x 1920       | If supporting tablets |
| 10" Tablet | 1080 x 1920       | If supporting tablets |

## Workflow for Multiple Devices

Create device-specific configs:

```bash
# scripts/screenshots.iphone15.config.sh
APP_SCHEME="myapp"
SCREENSHOTS=(...)

# scripts/screenshots.ipad.config.sh
APP_SCHEME="myapp"
SCREENSHOTS=(...)
```

Run for each device:

```bash
# Boot iPhone 15 Pro Max simulator
xcrun simctl boot "iPhone 15 Pro Max"

# Capture iPhone screenshots
./scripts/take-screenshots.sh \
  -c scripts/screenshots.iphone15.config.sh \
  -o screenshots/iphone15

# Boot iPad simulator
xcrun simctl boot "iPad Pro (12.9-inch) (6th generation)"

# Capture iPad screenshots
./scripts/take-screenshots.sh \
  -c scripts/screenshots.ipad.config.sh \
  -o screenshots/ipad
```

## Troubleshooting

### "No iOS Simulator is running"

Start a simulator:

```bash
# Open Simulator app
open -a Simulator

# Or boot a specific device
xcrun simctl boot "iPhone 15 Pro"
```

### "Failed to open deep link"

1. Verify your URL scheme in `app.config.js`:

   ```javascript
   export default {
     expo: {
       scheme: "myapp",
     },
   };
   ```

2. Rebuild the app after changing the scheme:

   ```bash
   cd apps/mobile
   pnpm ios
   ```

3. Test the deep link manually:
   ```bash
   xcrun simctl openurl booted "myapp://(app)/dashboard"
   ```

### Screenshots are blank or wrong screen

Increase the delay:

```bash
./scripts/take-screenshots.sh -d 5
```

### Capturing specific simulator

List available simulators:

```bash
xcrun simctl list devices available
```

Use device UUID:

```bash
./scripts/take-screenshots.sh -s "DEVICE-UUID-HERE"
```

## Post-Processing

After capturing raw screenshots, you may want to:

1. **Add device frames** - Tools like [Fastlane Frameit](https://docs.fastlane.tools/actions/frameit/)
2. **Add marketing text** - Figma, Sketch, or [AppMockUp](https://app-mockup.com/)
3. **Resize for stores** - ImageMagick or Preview.app
4. **Optimize file size** - [TinyPNG](https://tinypng.com/)

## Automation with Fastlane

For more advanced automation, consider [Fastlane Snapshot](https://docs.fastlane.tools/actions/snapshot/):

```ruby
# fastlane/Snapfile
devices([
  "iPhone 15 Pro Max",
  "iPhone 14 Plus",
  "iPad Pro (12.9-inch)"
])

languages(["en-US", "es-ES"])

scheme("YourApp")
output_directory("./screenshots")
```

## Related Files

- `scripts/take-screenshots.sh` - Main script
- `scripts/screenshots.config.example.sh` - Example configuration
- `scripts/screenshots.config.sh` - Your configuration (git-ignored)
