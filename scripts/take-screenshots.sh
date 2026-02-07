#!/bin/bash

# =============================================================================
# App Store Screenshot Automation Script
# =============================================================================
# Captures screenshots from iOS Simulator for App Store / Play Store previews.
#
# Usage:
#   ./scripts/take-screenshots.sh [options]
#
# Options:
#   -c, --config <file>    Path to screenshots config file (default: scripts/screenshots.config.sh)
#   -o, --output <dir>     Output directory (default: screenshots)
#   -d, --delay <seconds>  Delay between screenshots (default: 3)
#   -s, --simulator <name> Simulator name (default: booted)
#   -h, --help             Show this help message
#
# Prerequisites:
#   - iOS Simulator must be running with the app open
#   - Xcode Command Line Tools installed (xcrun simctl)
#
# See: scripts/SCREENSHOTS.md for full documentation
# =============================================================================

set -e

# Default values
CONFIG_FILE="scripts/screenshots.config.sh"
OUTPUT_DIR="screenshots"
DELAY=3
SIMULATOR="booted"
APP_SCHEME=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------

print_help() {
  head -30 "$0" | grep -E "^#" | sed 's/^# //' | sed 's/^#//'
}

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# -----------------------------------------------------------------------------
# Parse Arguments
# -----------------------------------------------------------------------------

while [[ $# -gt 0 ]]; do
  case $1 in
    -c|--config)
      CONFIG_FILE="$2"
      shift 2
      ;;
    -o|--output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    -d|--delay)
      DELAY="$2"
      shift 2
      ;;
    -s|--simulator)
      SIMULATOR="$2"
      shift 2
      ;;
    -h|--help)
      print_help
      exit 0
      ;;
    *)
      log_error "Unknown option: $1"
      print_help
      exit 1
      ;;
  esac
done

# -----------------------------------------------------------------------------
# Validation
# -----------------------------------------------------------------------------

# Check if xcrun is available
if ! command -v xcrun &> /dev/null; then
  log_error "xcrun not found. Please install Xcode Command Line Tools:"
  echo "  xcode-select --install"
  exit 1
fi

# Check if simulator is running
if ! xcrun simctl list devices | grep -q "(Booted)"; then
  log_error "No iOS Simulator is running."
  echo ""
  echo "Start a simulator with:"
  echo "  open -a Simulator"
  echo ""
  echo "Or list available simulators:"
  echo "  xcrun simctl list devices available"
  exit 1
fi

# Load config file if it exists
if [[ -f "$CONFIG_FILE" ]]; then
  log_info "Loading config from $CONFIG_FILE"
  source "$CONFIG_FILE"
else
  log_warn "Config file not found: $CONFIG_FILE"
  echo ""
  echo "Create a config file with your app's routes. Example:"
  echo ""
  echo "  # scripts/screenshots.config.sh"
  echo '  APP_SCHEME="myapp"'
  echo '  SCREENSHOTS=('
  echo '    "01_home|/(tabs)/home"'
  echo '    "02_dashboard|/(app)/dashboard"'
  echo '    "03_settings|/(app)/settings"'
  echo '  )'
  echo ""
  exit 1
fi

# Validate config
if [[ -z "$APP_SCHEME" ]]; then
  log_error "APP_SCHEME not set in config file"
  exit 1
fi

if [[ ${#SCREENSHOTS[@]} -eq 0 ]]; then
  log_error "SCREENSHOTS array is empty in config file"
  exit 1
fi

# -----------------------------------------------------------------------------
# Screenshot Functions
# -----------------------------------------------------------------------------

take_screenshot() {
  local name=$1
  local route=$2
  local full_path="$OUTPUT_DIR/$name.png"

  # Open deep link
  xcrun simctl openurl "$SIMULATOR" "$APP_SCHEME://$route" 2>/dev/null || {
    log_warn "Failed to open: $APP_SCHEME://$route"
    return 1
  }

  # Wait for screen to load
  sleep "$DELAY"

  # Capture screenshot
  xcrun simctl io "$SIMULATOR" screenshot "$full_path" 2>/dev/null || {
    log_warn "Failed to capture: $name"
    return 1
  }

  log_success "$name -> $full_path"
}

take_manual_screenshot() {
  local name=$1
  local full_path="$OUTPUT_DIR/$name.png"

  echo -e "${YELLOW}[MANUAL]${NC} Press Enter when ready to capture: $name"
  read -r

  xcrun simctl io "$SIMULATOR" screenshot "$full_path" 2>/dev/null || {
    log_warn "Failed to capture: $name"
    return 1
  }

  log_success "$name -> $full_path"
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

echo ""
echo "========================================"
echo "  App Store Screenshot Automation"
echo "========================================"
echo ""
log_info "App scheme: $APP_SCHEME"
log_info "Output directory: $OUTPUT_DIR"
log_info "Delay between screenshots: ${DELAY}s"
log_info "Simulator: $SIMULATOR"
log_info "Screenshots to capture: ${#SCREENSHOTS[@]}"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Capture each screenshot
for entry in "${SCREENSHOTS[@]}"; do
  # Parse entry (format: "name|route" or "name|MANUAL")
  name="${entry%%|*}"
  route="${entry#*|}"

  if [[ "$route" == "MANUAL" ]]; then
    take_manual_screenshot "$name"
  else
    take_screenshot "$name" "$route"
  fi
done

# Summary
echo ""
echo "========================================"
echo "  Complete!"
echo "========================================"
echo ""
log_info "Screenshots saved to: $OUTPUT_DIR"
echo ""

# List captured files
if command -v ls &> /dev/null; then
  ls -la "$OUTPUT_DIR"/*.png 2>/dev/null || log_warn "No screenshots found"
fi

echo ""
echo "Next steps:"
echo "  1. Review screenshots in $OUTPUT_DIR"
echo "  2. Resize/crop as needed for App Store requirements"
echo "  3. See scripts/SCREENSHOTS.md for App Store size requirements"
echo ""
