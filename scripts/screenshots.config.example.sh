# =============================================================================
# Screenshot Configuration Example
# =============================================================================
# Copy this file to screenshots.config.sh and customize for your app.
#
# Usage:
#   cp scripts/screenshots.config.example.sh scripts/screenshots.config.sh
#   # Edit screenshots.config.sh with your app's routes
#   ./scripts/take-screenshots.sh
# =============================================================================

# -----------------------------------------------------------------------------
# App URL Scheme
# -----------------------------------------------------------------------------
# This is your app's deep link scheme, configured in:
#   - apps/mobile/app.config.js (expo.scheme)
#   - apps/mobile/app.json (expo.scheme)
#
# Example: If your scheme is "myapp", deep links look like: myapp://path
APP_SCHEME="myapp"

# -----------------------------------------------------------------------------
# Screenshots to Capture
# -----------------------------------------------------------------------------
# Format: "filename|route" or "filename|MANUAL"
#
# - filename: Output filename (without .png extension)
# - route: Deep link path (without scheme://)
# - MANUAL: Pauses for manual screen setup before capture
#
# Tips:
#   - Number prefixes (01_, 02_) keep files sorted
#   - Use MANUAL for modals, alerts, or screens that can't be deep linked
#   - Routes should match your Expo Router file structure
#
SCREENSHOTS=(
  # Auth screens
  "01_login|(auth)/login"
  "02_signup|(auth)/signup"

  # Main app screens
  "03_dashboard|(app)/dashboard"
  "04_settings|(app)/settings"

  # Feature screens (customize for your app)
  # "05_feature|(app)/feature"
  # "06_profile|(app)/profile"

  # Manual captures for modals/alerts
  # "07_modal|MANUAL"
)

# -----------------------------------------------------------------------------
# Optional: Device-specific configs
# -----------------------------------------------------------------------------
# You can create multiple config files for different device sizes:
#
#   scripts/screenshots.iphone.config.sh   (iPhone 6.7")
#   scripts/screenshots.ipad.config.sh     (iPad 12.9")
#
# Then run:
#   ./scripts/take-screenshots.sh -c scripts/screenshots.iphone.config.sh -o screenshots/iphone
#   ./scripts/take-screenshots.sh -c scripts/screenshots.ipad.config.sh -o screenshots/ipad
