#!/bin/bash

# Configure AWS Amplify for Next.js SSR
# This script updates an existing Amplify app to use WEB_COMPUTE platform
# and configures the branch for Next.js SSR framework.

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_error() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Check for required commands
check_requirements() {
    print_section "Checking Requirements"

    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Please install it first."
        echo "macOS: brew install jq"
        echo "Linux: apt-get install jq or yum install jq"
        exit 1
    fi

    print_success "All requirements met"
}

# Get Amplify App ID from Pulumi or environment variable
get_app_id() {
    local app_id=""

    # Try environment variable first
    if [ -n "$AMPLIFY_APP_ID" ]; then
        app_id="$AMPLIFY_APP_ID"
        print_info "Using app ID from AMPLIFY_APP_ID environment variable: $app_id"
    # Try Pulumi output
    elif command -v pulumi &> /dev/null && [ -f "Pulumi.yaml" ]; then
        print_info "Fetching app ID from Pulumi..."
        app_id=$(pulumi stack output amplifyAppId 2>/dev/null || echo "")
        if [ -n "$app_id" ]; then
            print_info "Using app ID from Pulumi output: $app_id"
        fi
    fi

    # If still not found, ask user
    if [ -z "$app_id" ]; then
        print_warning "App ID not found in environment or Pulumi output"
        read -p "Enter Amplify App ID: " app_id
    fi

    if [ -z "$app_id" ]; then
        print_error "App ID is required"
        exit 1
    fi

    echo "$app_id"
}

# Get AWS Region
get_region() {
    local region="${AWS_REGION:-${AWS_DEFAULT_REGION}}"

    # Try Pulumi config
    if [ -z "$region" ] && command -v pulumi &> /dev/null && [ -f "Pulumi.yaml" ]; then
        region=$(pulumi config get aws:region 2>/dev/null || echo "")
    fi

    # Default to us-east-1
    if [ -z "$region" ]; then
        region="us-east-1"
        print_info "No region specified, using default: $region"
    else
        print_info "Using AWS region: $region"
    fi

    echo "$region"
}

# Get branch name
get_branch() {
    local branch="${AMPLIFY_BRANCH:-main}"
    print_info "Using branch: $branch"
    echo "$branch"
}

# Update Amplify app to WEB_COMPUTE platform
update_app_platform() {
    local app_id=$1
    local region=$2

    print_section "Updating Amplify App Platform"

    print_info "Setting platform to WEB_COMPUTE for app: $app_id"

    if aws amplify update-app \
        --app-id "$app_id" \
        --platform WEB_COMPUTE \
        --region "$region" > /dev/null; then
        print_success "App platform updated to WEB_COMPUTE"
    else
        print_error "Failed to update app platform"
        exit 1
    fi
}

# Update branch framework
update_branch_framework() {
    local app_id=$1
    local branch=$2
    local region=$3

    print_section "Updating Branch Framework"

    print_info "Setting framework to 'Next.js - SSR' for branch: $branch"

    if aws amplify update-branch \
        --app-id "$app_id" \
        --branch-name "$branch" \
        --framework "Next.js - SSR" \
        --region "$region" > /dev/null; then
        print_success "Branch framework updated to Next.js - SSR"
    else
        print_error "Failed to update branch framework"
        exit 1
    fi
}

# Verify configuration
verify_config() {
    local app_id=$1
    local branch=$2
    local region=$3

    print_section "Verifying Configuration"

    # Get app details
    print_info "Fetching app configuration..."
    local app_config=$(aws amplify get-app --app-id "$app_id" --region "$region")
    local platform=$(echo "$app_config" | jq -r '.app.platform')

    # Get branch details
    print_info "Fetching branch configuration..."
    local branch_config=$(aws amplify get-branch --app-id "$app_id" --branch-name "$branch" --region "$region")
    local framework=$(echo "$branch_config" | jq -r '.branch.framework')

    echo ""
    print_info "Current Configuration:"
    echo "  App ID:    $app_id"
    echo "  Platform:  $platform"
    echo "  Branch:    $branch"
    echo "  Framework: $framework"
    echo ""

    # Verify settings
    local all_good=true

    if [ "$platform" = "WEB_COMPUTE" ]; then
        print_success "Platform is correctly set to WEB_COMPUTE"
    else
        print_error "Platform is $platform (expected WEB_COMPUTE)"
        all_good=false
    fi

    if [ "$framework" = "Next.js - SSR" ]; then
        print_success "Framework is correctly set to Next.js - SSR"
    else
        print_error "Framework is $framework (expected Next.js - SSR)"
        all_good=false
    fi

    if [ "$all_good" = true ]; then
        echo ""
        print_success "Amplify is correctly configured for Next.js SSR! 🎉"
        return 0
    else
        echo ""
        print_error "Configuration verification failed"
        return 1
    fi
}

# Main function
main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║        AWS Amplify Configuration for Next.js SSR          ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    check_requirements

    local app_id=$(get_app_id)
    local region=$(get_region)
    local branch=$(get_branch)

    echo ""
    print_section "Configuration Summary"
    echo "  App ID:  $app_id"
    echo "  Region:  $region"
    echo "  Branch:  $branch"
    echo ""

    read -p "Continue with this configuration? (y/N) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Configuration cancelled"
        exit 0
    fi

    update_app_platform "$app_id" "$region"
    update_branch_framework "$app_id" "$branch" "$region"
    verify_config "$app_id" "$branch" "$region"

    echo ""
    print_section "Next Steps"
    echo ""
    echo "1. Trigger a new deployment:"
    echo "   git push origin $branch"
    echo ""
    echo "2. Monitor deployment status:"
    echo "   aws amplify list-jobs --app-id $app_id --branch-name $branch --region $region"
    echo ""
    echo "3. View deployment URL:"
    echo "   aws amplify get-branch --app-id $app_id --branch-name $branch --region $region | jq -r '.branch.branchName'"
    echo ""
}

# Run main function
main "$@"
