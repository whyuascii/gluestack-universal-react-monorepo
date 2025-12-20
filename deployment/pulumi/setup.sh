#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Infrastructure Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

command -v pulumi >/dev/null 2>&1 || {
  echo -e "${RED}Error: Pulumi is not installed. Install from: https://www.pulumi.com/docs/get-started/install/${NC}"
  exit 1
}

command -v aws >/dev/null 2>&1 || {
  echo -e "${RED}Error: AWS CLI is not installed.${NC}"
  exit 1
}

command -v pnpm >/dev/null 2>&1 || {
  echo -e "${RED}Error: pnpm is not installed.${NC}"
  exit 1
}

command -v docker >/dev/null 2>&1 || {
  echo -e "${RED}Error: Docker is not installed.${NC}"
  exit 1
}

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
aws sts get-caller-identity >/dev/null 2>&1 || {
  echo -e "${RED}Error: AWS credentials not configured. Run 'aws configure'${NC}"
  exit 1
}

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS Account: $AWS_ACCOUNT_ID${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Pulumi login
echo -e "${YELLOW}Pulumi login${NC}"
echo "Choose your backend:"
echo "1) Pulumi Cloud (recommended)"
echo "2) Local filesystem"
echo "3) AWS S3"
read -p "Enter choice [1-3]: " backend_choice

case $backend_choice in
  1)
    pulumi login
    ;;
  2)
    pulumi login --local
    ;;
  3)
    read -p "Enter S3 bucket URL (s3://bucket-name): " s3_bucket
    pulumi login "$s3_bucket"
    ;;
  *)
    echo -e "${RED}Invalid choice${NC}"
    exit 1
    ;;
esac

echo -e "${GREEN}✓ Logged in to Pulumi${NC}"
echo ""

# Create or select stack
echo -e "${YELLOW}Stack configuration${NC}"
read -p "Enter stack name (e.g., dev, staging, prod): " stack_name

if pulumi stack select "$stack_name" 2>/dev/null; then
  echo -e "${GREEN}✓ Selected existing stack: $stack_name${NC}"
else
  pulumi stack init "$stack_name"
  echo -e "${GREEN}✓ Created new stack: $stack_name${NC}"
fi
echo ""

# Configure stack
echo -e "${YELLOW}Configuring stack...${NC}"

# AWS Region
read -p "Enter AWS region (default: us-east-1): " aws_region
aws_region=${aws_region:-us-east-1}
pulumi config set aws:region "$aws_region"
echo -e "${GREEN}✓ Set AWS region: $aws_region${NC}"

# Supabase configuration
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Supabase Configuration${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "Create a Supabase project at https://supabase.com/dashboard if you haven't already."
echo "You'll need: Project URL, Database Connection String, Anon Key, and Service Role Key"
echo ""
read -p "Press Enter when ready to continue..."
echo ""

read -p "Enter Supabase Project URL (e.g., https://xxxxx.supabase.co): " supabase_url
pulumi config set supabaseUrl "$supabase_url"
echo -e "${GREEN}✓ Set Supabase URL${NC}"

echo ""
echo "Go to Project Settings → Database → Connection String"
echo "Use 'Connection Pooling' mode for production (port 6543)"
read -p "Enter Database Connection String: " database_url
pulumi config set --secret databaseUrl "$database_url"
echo -e "${GREEN}✓ Set Database URL${NC}"

echo ""
echo "Go to Project Settings → API"
read -p "Enter Supabase Anon Key (anon public): " supabase_anon_key
pulumi config set --secret supabaseAnonKey "$supabase_anon_key"
echo -e "${GREEN}✓ Set Supabase Anon Key${NC}"

read -p "Enter Supabase Service Role Key (service_role secret): " supabase_service_key
pulumi config set --secret supabaseServiceRoleKey "$supabase_service_key"
echo -e "${GREEN}✓ Set Supabase Service Role Key${NC}"

# Better Auth secret
echo ""
echo -e "${YELLOW}Generate Better Auth secret? (recommended)${NC}"
read -p "Press Enter to generate or type your own secret: " auth_secret
if [ -z "$auth_secret" ]; then
  auth_secret=$(openssl rand -base64 32)
  echo -e "${GREEN}✓ Generated strong secret${NC}"
fi
pulumi config set --secret betterAuthSecret "$auth_secret"

# GitHub configuration
echo ""
echo -e "${YELLOW}GitHub configuration${NC}"
read -p "Enter your GitHub username: " github_owner
pulumi config set githubOwner "$github_owner"

read -p "Enter repository name (default: your-repo-name): " github_repo
github_repo=${github_repo:-your-repo-name}
pulumi config set githubRepo "$github_repo"

read -p "Enter branch name (default: main): " github_branch
github_branch=${github_branch:-main}
pulumi config set githubBranch "$github_branch"

# GitHub token (optional)
echo ""
read -p "Enter GitHub personal access token (leave empty if public repo): " github_token
if [ -n "$github_token" ]; then
  pulumi config set --secret githubToken "$github_token"
  echo -e "${GREEN}✓ Set GitHub token${NC}"
fi

# Custom domain (optional)
echo ""
read -p "Enter custom domain (leave empty to skip): " domain
if [ -n "$domain" ]; then
  pulumi config set domain "$domain"
  echo -e "${GREEN}✓ Set custom domain: $domain${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Configuration complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Preview infrastructure changes:"
echo -e "   ${GREEN}pulumi preview${NC}"
echo ""
echo "2. Deploy infrastructure:"
echo -e "   ${GREEN}pulumi up${NC}"
echo ""
echo "3. After deployment, build and push API Docker image:"
echo -e "   ${GREEN}cd ../..${NC}"
echo -e "   ${GREEN}ECR_REPO=\$(cd deployment/pulumi && pulumi stack output apiRepositoryUrl)${NC}"
echo -e "   ${GREEN}aws ecr get-login-password --region $aws_region | docker login --username AWS --password-stdin \$ECR_REPO${NC}"
echo -e "   ${GREEN}docker build -f apps/api/Dockerfile -t \$ECR_REPO:latest .${NC}"
echo -e "   ${GREEN}docker push \$ECR_REPO:latest${NC}"
echo ""
echo "4. Run database migrations:"
echo -e "   ${GREEN}export DATABASE_URL=\$(pulumi config get --show-secrets databaseUrl)${NC}"
echo -e "   ${GREEN}cd ../..${NC}"
echo -e "   ${GREEN}pnpm --filter database db:migrate${NC}"
echo ""
echo "5. Push to GitHub to trigger web deployment:"
echo -e "   ${GREEN}git push origin $github_branch${NC}"
echo ""
echo -e "${YELLOW}Supabase Dashboard:${NC}"
echo -e "   ${GREEN}$supabase_url/dashboard${NC}"
echo ""
echo -e "${YELLOW}For detailed instructions, see:${NC}"
echo -e "   ${GREEN}deployment/pulumi/README.md${NC}"
echo ""
