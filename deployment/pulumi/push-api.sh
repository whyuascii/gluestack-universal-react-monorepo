#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Push API Docker Image to ECR${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Change to deployment/pulumi directory
cd "$(dirname "$0")"

# Get stack name
STACK=$(pulumi stack --show-name 2>/dev/null || echo "")
if [ -z "$STACK" ]; then
  echo -e "${RED}Error: Not in a Pulumi stack directory${NC}"
  exit 1
fi

echo -e "${YELLOW}Stack: $STACK${NC}"
echo ""

# Try to get ECR repo URL from Pulumi output
echo "Checking Pulumi outputs..."
ECR_REPO=$(pulumi stack output apiRepositoryUrl 2>/dev/null || echo "")

if [ -z "$ECR_REPO" ]; then
  echo -e "${YELLOW}⚠ apiRepositoryUrl not in Pulumi outputs${NC}"
  echo "Available outputs:"
  pulumi stack output 2>/dev/null || echo "No outputs available"
  echo ""

  # Try to find ECR repo directly from AWS
  echo "Searching for ECR repository in AWS..."
  AWS_REGION=$(pulumi config get aws:region 2>/dev/null || echo "us-east-1")

  ECR_REPO=$(aws ecr describe-repositories \
    --region $AWS_REGION \
    --query "repositories[?contains(repositoryName, 'api')].repositoryUri" \
    --output text 2>/dev/null || echo "")

  if [ -z "$ECR_REPO" ]; then
    echo -e "${RED}Error: Could not find ECR repository${NC}"
    echo ""
    echo "This usually means the infrastructure hasn't been deployed yet."
    echo "Run this first:"
    echo "  pulumi up"
    echo ""
    exit 1
  fi

  echo -e "${GREEN}✓ Found ECR repository: $ECR_REPO${NC}"
else
  echo -e "${GREEN}✓ ECR Repository URL: $ECR_REPO${NC}"
fi

# Get AWS region
AWS_REGION=$(echo $ECR_REPO | cut -d'.' -f4)
echo -e "${YELLOW}Region: $AWS_REGION${NC}"
echo ""

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${YELLOW}AWS Account: $AWS_ACCOUNT_ID${NC}"
echo ""

# Login to ECR
echo -e "${YELLOW}Logging in to ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REPO

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to login to ECR${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Logged in to ECR${NC}"
echo ""

# Build Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
cd ../.. # Go to project root

docker build -f apps/api/Dockerfile -t $ECR_REPO:latest .

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to build Docker image${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Docker image built${NC}"
echo ""

# Push to ECR
echo -e "${YELLOW}Pushing to ECR...${NC}"
docker push $ECR_REPO:latest

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to push Docker image${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Docker image pushed!${NC}"
echo ""

# Tag with git commit if available
if git rev-parse --short HEAD >/dev/null 2>&1; then
  GIT_SHA=$(git rev-parse --short HEAD)
  echo -e "${YELLOW}Tagging with git commit: $GIT_SHA${NC}"

  docker tag $ECR_REPO:latest $ECR_REPO:$GIT_SHA
  docker push $ECR_REPO:$GIT_SHA

  echo -e "${GREEN}✓ Tagged and pushed: $GIT_SHA${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Success!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Image pushed to: $ECR_REPO:latest"
echo ""
echo "App Runner will automatically deploy the new image within 1-2 minutes."
echo ""
echo "Check deployment status:"
echo "  aws apprunner list-operations --service-arn \$(cd deployment/pulumi && pulumi stack output apiServiceArn)"
echo ""
