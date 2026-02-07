#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}DNS Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get domain from Pulumi config
DOMAIN=$(pulumi config get domain 2>/dev/null || echo "")

if [ -z "$DOMAIN" ]; then
  echo -e "${RED}Error: Domain not configured in Pulumi${NC}"
  echo "Run: pulumi config set domain yourdomain.com"
  exit 1
fi

echo -e "${YELLOW}Domain: $DOMAIN${NC}"
echo ""

# Get hosted zone ID
echo "Looking up Route 53 hosted zone..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='${DOMAIN}.'].Id" \
  --output text 2>/dev/null | cut -d'/' -f3)

if [ -z "$HOSTED_ZONE_ID" ]; then
  echo -e "${RED}Error: Hosted zone not found for $DOMAIN${NC}"
  echo "Make sure the domain is in Route 53"
  exit 1
fi

echo -e "${GREEN}✓ Found hosted zone: $HOSTED_ZONE_ID${NC}"
echo ""

# Get Amplify app ID
echo "Getting Amplify configuration..."
AMPLIFY_APP_ID=$(pulumi stack output amplifyAppId 2>/dev/null || echo "")

if [ -z "$AMPLIFY_APP_ID" ]; then
  echo -e "${RED}Error: Amplify app not deployed yet${NC}"
  echo "Run: pulumi up"
  exit 1
fi

echo -e "${GREEN}✓ Amplify App ID: $AMPLIFY_APP_ID${NC}"

# Get App Runner service ARN
echo "Getting App Runner configuration..."
API_SERVICE_ARN=$(pulumi stack output apiServiceArn 2>/dev/null || echo "")

if [ -z "$API_SERVICE_ARN" ]; then
  echo -e "${YELLOW}⚠ App Runner service not found (might not be deployed yet)${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}DNS Configuration Steps${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Step 1: Get Amplify domain association
echo -e "${YELLOW}Step 1: Amplify Certificate Validation${NC}"
echo ""

AMPLIFY_DOMAIN_INFO=$(aws amplify get-domain-association \
  --app-id $AMPLIFY_APP_ID \
  --domain-name $DOMAIN \
  2>&1) || {
  echo -e "${YELLOW}⚠ Domain association not found. Creating...${NC}"
  echo "This should have been created by Pulumi."
  echo "If not, run: pulumi up"
  echo ""
}

echo "$AMPLIFY_DOMAIN_INFO" | jq -r '.domainAssociation.certificateVerificationDNSRecord' 2>/dev/null || {
  echo -e "${YELLOW}Domain association status:${NC}"
  echo "$AMPLIFY_DOMAIN_INFO" | jq -r '.domainAssociation.domainStatus' 2>/dev/null || echo "Not found"
}

echo ""
echo -e "${YELLOW}Certificate validation CNAME records:${NC}"
echo "$AMPLIFY_DOMAIN_INFO" | jq -r '.domainAssociation.certificateVerificationDNSRecord // "Validation complete or not yet initiated"' 2>/dev/null

echo ""
echo -e "${YELLOW}Step 2: App Runner Certificate Validation${NC}"
echo ""

if [ -n "$API_SERVICE_ARN" ]; then
  API_DOMAIN_INFO=$(aws apprunner describe-custom-domains \
    --service-arn $API_SERVICE_ARN \
    2>&1) || {
    echo -e "${YELLOW}⚠ Custom domain not associated yet${NC}"
  }

  echo -e "${YELLOW}Validation records:${NC}"
  echo "$API_DOMAIN_INFO" | jq -r '.CustomDomains[0].CertificateValidationRecords[]? // "Not yet available"' 2>/dev/null || echo "Not available"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Next Steps${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo "1. Add the certificate validation CNAME records shown above to Route 53"
echo ""
echo "2. Wait for certificate validation (5-10 minutes)"
echo "   Check with: aws acm list-certificates --region us-east-1"
echo ""
echo "3. After validation, add these DNS records:"
echo ""

# Get the Amplify CloudFront domain
AMPLIFY_BRANCH_URL=$(pulumi stack output amplifyBranchUrl 2>/dev/null | sed 's|https://||' || echo "")
if [ -n "$AMPLIFY_BRANCH_URL" ]; then
  echo "   # Root domain (A record - ALIAS)"
  echo "   Name: $DOMAIN"
  echo "   Type: A (Alias)"
  echo "   Target: $AMPLIFY_BRANCH_URL"
  echo ""
  echo "   # WWW subdomain (CNAME)"
  echo "   Name: www.$DOMAIN"
  echo "   Type: CNAME"
  echo "   Value: $AMPLIFY_BRANCH_URL"
  echo ""
fi

# Get API service URL
API_SERVICE_URL=$(pulumi stack output apiServiceUrl 2>/dev/null | sed 's|https://||' || echo "")
if [ -n "$API_SERVICE_URL" ]; then
  echo "   # API subdomain (CNAME)"
  echo "   Name: api.$DOMAIN"
  echo "   Type: CNAME"
  echo "   Value: $API_SERVICE_URL"
  echo ""
fi

echo ""
echo "4. Test your domains:"
echo "   dig $DOMAIN +short"
echo "   dig www.$DOMAIN +short"
echo "   dig api.$DOMAIN +short"
echo ""
echo "   curl https://$DOMAIN"
echo "   curl https://api.$DOMAIN/health"
echo ""

echo -e "${GREEN}For detailed instructions, see: deployment/pulumi/CUSTOM-DOMAINS.md${NC}"
echo ""
