import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

// Get configuration
const config = new pulumi.Config();
const projectName = config.get("projectName") || "app";
const environment = pulumi.getStack();

// Configuration values with defaults
const betterAuthSecret = config.requireSecret("betterAuthSecret");
const githubToken = config.getSecret("githubToken"); // Optional for Amplify
const githubOwner = config.get("githubOwner") || "YOUR_GITHUB_USERNAME";
const githubRepo = config.get("githubRepo") || "your-repo-name";
const githubBranch = config.get("githubBranch") || "main";
const domain = config.get("domain"); // Optional custom domain

// Supabase configuration
const supabaseUrl = config.require("supabaseUrl"); // e.g., https://xxxxx.supabase.co
const supabaseAnonKey = config.requireSecret("supabaseAnonKey");
const supabaseServiceRoleKey = config.requireSecret("supabaseServiceRoleKey");
const databaseUrl = config.requireSecret("databaseUrl"); // Supabase connection string

// OAuth configuration (optional)
const googleClientId = config.getSecret("googleClientId");
const googleClientSecret = config.getSecret("googleClientSecret");
const githubClientId = config.getSecret("githubClientId");
const githubClientSecret = config.getSecret("githubClientSecret");

// PostHog configuration (optional)
const posthogKey = config.getSecret("posthogKey");
const posthogHost = config.get("posthogHost") || "https://us.i.posthog.com";

// Tags for all resources
const tags = {
  Project: projectName,
  Environment: environment,
  ManagedBy: "Pulumi",
};

// =============================================================================
// Database: Supabase (Managed PostgreSQL)
// =============================================================================
// Note: Supabase is configured externally at https://supabase.com
// This infrastructure code uses the Supabase connection details from config

// =============================================================================
// Secrets Manager
// =============================================================================

// Supabase credentials secret
const supabaseSecret = new aws.secretsmanager.Secret(`${projectName}-supabase-credentials`, {
  name: `${projectName}/${environment}/supabase/credentials`,
  description: "Supabase connection credentials",
  tags,
});

const supabaseSecretVersion = new aws.secretsmanager.SecretVersion(
  `${projectName}-supabase-credentials-version`,
  {
    secretId: supabaseSecret.id,
    secretString: pulumi
      .all([supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey, databaseUrl])
      .apply(([url, anonKey, serviceKey, dbUrl]) =>
        JSON.stringify({
          supabaseUrl: url,
          supabaseAnonKey: anonKey,
          supabaseServiceRoleKey: serviceKey,
          databaseUrl: dbUrl,
        })
      ),
  }
);

// Better Auth secret
const authSecret = new aws.secretsmanager.Secret(`${projectName}-auth-secret`, {
  name: `${projectName}/${environment}/auth/secret`,
  description: "Better Auth secret",
  tags,
});

const authSecretVersion = new aws.secretsmanager.SecretVersion(
  `${projectName}-auth-secret-version`,
  {
    secretId: authSecret.id,
    secretString: betterAuthSecret,
  }
);

// =============================================================================
// ECR Repository for API
// =============================================================================

const apiRepository = new aws.ecr.Repository(`${projectName}-api`, {
  name: `${projectName}-api`,
  imageTagMutability: "MUTABLE",
  imageScanningConfiguration: {
    scanOnPush: true,
  },
  encryptionConfigurations: [
    {
      encryptionType: "AES256",
    },
  ],
  tags,
});

// Lifecycle policy to clean up old images
const apiRepositoryLifecycle = new aws.ecr.LifecyclePolicy(`${projectName}-api-lifecycle`, {
  repository: apiRepository.name,
  policy: JSON.stringify({
    rules: [
      {
        rulePriority: 1,
        description: "Keep last 10 images",
        selection: {
          tagStatus: "any",
          countType: "imageCountMoreThan",
          countNumber: 10,
        },
        action: {
          type: "expire",
        },
      },
    ],
  }),
});

// =============================================================================
// IAM Roles for App Runner
// =============================================================================

// Instance role (for the running application)
const appRunnerInstanceRole = new aws.iam.Role(`${projectName}-apprunner-instance-role`, {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Service: "tasks.apprunner.amazonaws.com",
        },
        Action: "sts:AssumeRole",
      },
    ],
  }),
  tags,
});

// Policy to access Secrets Manager
const secretsPolicy = new aws.iam.RolePolicy(`${projectName}-apprunner-secrets-policy`, {
  role: appRunnerInstanceRole.id,
  policy: pulumi.all([supabaseSecret.arn, authSecret.arn]).apply(([supabaseArn, authArn]) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
          Resource: [supabaseArn, authArn],
        },
      ],
    })
  ),
});

// Access role (for App Runner to access ECR)
const appRunnerAccessRole = new aws.iam.Role(`${projectName}-apprunner-access-role`, {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Service: "build.apprunner.amazonaws.com",
        },
        Action: "sts:AssumeRole",
      },
    ],
  }),
  managedPolicyArns: ["arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"],
  tags,
});

// =============================================================================
// App Runner Service (API)
// =============================================================================

const apiService = new aws.apprunner.Service(
  `${projectName}-api`,
  {
    serviceName: `${projectName}-api-${environment}`,

    sourceConfiguration: {
      authenticationConfiguration: {
        accessRoleArn: appRunnerAccessRole.arn,
      },
      imageRepository: {
        imageIdentifier: pulumi.interpolate`${apiRepository.repositoryUrl}:latest`,
        imageRepositoryType: "ECR",
        imageConfiguration: {
          port: "3030",
          runtimeEnvironmentVariables: {
            NODE_ENV: "production",
            PORT: "3030",
            BETTER_AUTH_URL: domain ? `https://api.${domain}` : config.require("apiUrl"), // Set via config for first deployment
            POSTHOG_HOST: posthogHost,
          },
          runtimeEnvironmentSecrets: pulumi
            .all([
              supabaseSecret.arn,
              authSecret.arn,
              googleClientId,
              googleClientSecret,
              githubClientId,
              githubClientSecret,
              posthogKey,
            ])
            .apply(
              ([
                supabaseArn,
                authArn,
                gClientId,
                gClientSecret,
                ghClientId,
                ghClientSecret,
                phKey,
              ]) => {
                const secrets: Record<string, string> = {
                  DATABASE_URL: `${supabaseArn}:databaseUrl::`,
                  BETTER_AUTH_SECRET: authArn,
                };
                // Add OAuth secrets if provided
                if (gClientId) secrets.GOOGLE_CLIENT_ID = gClientId;
                if (gClientSecret) secrets.GOOGLE_CLIENT_SECRET = gClientSecret;
                if (ghClientId) secrets.GITHUB_CLIENT_ID = ghClientId;
                if (ghClientSecret) secrets.GITHUB_CLIENT_SECRET = ghClientSecret;
                // Add PostHog key if provided
                if (phKey) secrets.POSTHOG_KEY = phKey;
                return secrets;
              }
            ),
        },
      },
      autoDeploymentsEnabled: true,
    },

    instanceConfiguration: {
      cpu: "1 vCPU",
      memory: "2 GB",
      instanceRoleArn: appRunnerInstanceRole.arn,
    },

    healthCheckConfiguration: {
      protocol: "HTTP",
      path: "/health",
      interval: 10,
      timeout: 5,
      healthyThreshold: 1,
      unhealthyThreshold: 5,
    },

    networkConfiguration: {
      ingressConfiguration: {
        isPubliclyAccessible: true,
      },
      ipAddressType: "DUAL_STACK", // Enable both IPv4 and IPv6 (Aug 2025+)
      egressConfiguration: {
        egressType: "DEFAULT", // Public internet access (for Supabase)
      },
    },

    tags,
  },
  {
    dependsOn: [supabaseSecretVersion, authSecretVersion],
  }
);

// Custom domain for API (optional)
let apiCustomDomain: aws.apprunner.CustomDomainAssociation | undefined;
if (domain) {
  apiCustomDomain = new aws.apprunner.CustomDomainAssociation(`${projectName}-api-domain`, {
    serviceArn: apiService.arn,
    domainName: `api.${domain}`,
    enableWwwSubdomain: false,
  });
}

// =============================================================================
// AWS Amplify (Web)
// =============================================================================

// Amplify App

const amplifyApp = new aws.amplify.App(`${projectName}-web`, {
  name: `${projectName}-web-${environment}`,
  repository: `https://github.com/${githubOwner}/${githubRepo}`,
  accessToken: githubToken,
  platform: "WEB_COMPUTE", // Required for Next.js SSR (App Router)

  // Build settings
  buildSpec: `version: 1
applications:
  - appRoot: apps/web
    frontend:
      phases:
        preBuild:
          commands:
            - npm install -g pnpm@latest
            - cd ../..
            - pnpm install --frozen-lockfile
        build:
          commands:
            - pnpm --filter @app/web build
      artifacts:
        baseDirectory: apps/web/.next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - apps/web/.next/cache/**/*
          - .pnpm-store/**/*`,

  environmentVariables: {
    NODE_VERSION: "20",
    NEXT_PUBLIC_API_URL: pulumi.interpolate`https://${apiService.serviceUrl}`,
    AMPLIFY_MONOREPO_APP_ROOT: "apps/web",
    AMPLIFY_DIFF_DEPLOY: "false",
  },

  // Custom rules for SPA routing
  customRules: [
    {
      source: "/<*>",
      status: "404-200",
      target: "/index.html",
    },
  ],

  // Enable auto branch creation
  enableBranchAutoBuild: true,
  enableBranchAutoDeletion: true,

  tags,
});

// Main branch
const amplifyBranch = new aws.amplify.Branch(`${projectName}-web-main`, {
  appId: amplifyApp.id,
  branchName: githubBranch,
  enableAutoBuild: true,
  enablePullRequestPreview: true,
  framework: "Next.js - SSR",
  stage: environment === "prod" ? "PRODUCTION" : "DEVELOPMENT",
  environmentVariables: domain
    ? {
        BETTER_AUTH_SECRET: betterAuthSecret,
        BETTER_AUTH_URL: `https://${domain}`,
      }
    : pulumi.all([amplifyApp.defaultDomain, betterAuthSecret]).apply(([defaultDomain, secret]) => ({
        BETTER_AUTH_SECRET: secret,
        BETTER_AUTH_URL: `https://${githubBranch}.${defaultDomain}`,
      })),
  tags,
});

// Custom domain for Amplify (optional)
let amplifyDomain: aws.amplify.DomainAssociation | undefined;
if (domain) {
  amplifyDomain = new aws.amplify.DomainAssociation(`${projectName}-web-domain`, {
    appId: amplifyApp.id,
    domainName: domain,
    subDomains: [
      {
        branchName: amplifyBranch.branchName,
        prefix: "",
      },
      {
        branchName: amplifyBranch.branchName,
        prefix: "www",
      },
    ],
    waitForVerification: false,
  });
}

// =============================================================================
// WAF Configuration
// =============================================================================

// WAF Web ACL for CloudFront (Amplify)
const webAcl = new aws.wafv2.WebAcl(`${projectName}-waf`, {
  name: `${projectName}-waf-${environment}`,
  scope: "CLOUDFRONT",
  description: "WAF protects against common attacks",

  defaultAction: {
    allow: {},
  },

  rules: [
    // AWS Managed Rules - Core Rule Set
    {
      name: "AWSManagedRulesCommonRuleSet",
      priority: 1,
      statement: {
        managedRuleGroupStatement: {
          vendorName: "AWS",
          name: "AWSManagedRulesCommonRuleSet",
        },
      },
      overrideAction: {
        none: {},
      },
      visibilityConfig: {
        cloudwatchMetricsEnabled: true,
        metricName: "AWSManagedRulesCommonRuleSetMetric",
        sampledRequestsEnabled: true,
      },
    },

    // AWS Managed Rules - Known Bad Inputs
    {
      name: "AWSManagedRulesKnownBadInputsRuleSet",
      priority: 2,
      statement: {
        managedRuleGroupStatement: {
          vendorName: "AWS",
          name: "AWSManagedRulesKnownBadInputsRuleSet",
        },
      },
      overrideAction: {
        none: {},
      },
      visibilityConfig: {
        cloudwatchMetricsEnabled: true,
        metricName: "AWSManagedRulesKnownBadInputsRuleSetMetric",
        sampledRequestsEnabled: true,
      },
    },

    // AWS Managed Rules - SQL Injection
    {
      name: "AWSManagedRulesSQLiRuleSet",
      priority: 3,
      statement: {
        managedRuleGroupStatement: {
          vendorName: "AWS",
          name: "AWSManagedRulesSQLiRuleSet",
        },
      },
      overrideAction: {
        none: {},
      },
      visibilityConfig: {
        cloudwatchMetricsEnabled: true,
        metricName: "AWSManagedRulesSQLiRuleSetMetric",
        sampledRequestsEnabled: true,
      },
    },

    // Rate limiting - 2000 requests per 5 minutes per IP
    {
      name: "RateLimitRule",
      priority: 4,
      statement: {
        rateBasedStatement: {
          limit: 2000,
          aggregateKeyType: "IP",
        },
      },
      action: {
        block: {},
      },
      visibilityConfig: {
        cloudwatchMetricsEnabled: true,
        metricName: "RateLimitRuleMetric",
        sampledRequestsEnabled: true,
      },
    },
  ],

  visibilityConfig: {
    cloudwatchMetricsEnabled: true,
    metricName: `${projectName}-waf-metric`,
    sampledRequestsEnabled: true,
  },

  tags,
});

// Note: WAF association with CloudFront distribution happens automatically via Amplify
// If you need manual association, you'll need to get the CloudFront distribution ARN first

// =============================================================================
// CloudWatch Log Groups
// =============================================================================

const apiLogGroup = new aws.cloudwatch.LogGroup(`${projectName}-api-logs`, {
  name: `/aws/apprunner/${projectName}-api-${environment}`,
  retentionInDays: 30,
  tags,
});

// =============================================================================
// CloudWatch Alarms
// =============================================================================

// High API error rate alarm
const apiErrorAlarm = new aws.cloudwatch.MetricAlarm(`${projectName}-api-error-alarm`, {
  name: `${projectName}-api-high-error-rate-${environment}`,
  comparisonOperator: "GreaterThanThreshold",
  evaluationPeriods: 2,
  metricName: "4xxStatusResponses",
  namespace: "AWS/AppRunner",
  period: 300,
  statistic: "Sum",
  threshold: 100,
  alarmDescription: "Alert when API returns more than 100 4xx errors in 5 minutes",
  dimensions: {
    ServiceName: apiService.serviceName,
  },
  tags,
});

// =============================================================================
// Outputs
// =============================================================================

export const supabaseUrlOutput = supabaseUrl;
export const supabaseSecretArn = supabaseSecret.arn;

export const apiRepositoryUrl = apiRepository.repositoryUrl;
export const apiServiceUrl = pulumi.interpolate`https://${apiService.serviceUrl}`;
export const apiServiceArn = apiService.arn;
export const apiCustomDomainUrl = apiCustomDomain?.domainName.apply((d) => `https://${d}`);

export const amplifyAppId = amplifyApp.id;
export const amplifyDefaultDomain = amplifyApp.defaultDomain;
export const amplifyBranchUrl = pulumi.interpolate`https://${amplifyBranch.branchName}.${amplifyApp.defaultDomain}`;
export const amplifyCustomDomain = amplifyDomain?.domainName;

export const webAclId = webAcl.id;
export const webAclArn = webAcl.arn;

export const authSecretArn = authSecret.arn;

// Deployment instructions
export const deploymentInstructions = pulumi.interpolate`
=============================================================================
Deployment Complete! 🚀
=============================================================================

API Service:
  URL: https://${apiService.serviceUrl}
  ${apiCustomDomain ? pulumi.interpolate`Custom Domain: https://${apiCustomDomain.domainName}` : ""}
  Network: Dual-stack (IPv4 + IPv6)

Web Application:
  URL: https://${amplifyBranch.branchName}.${amplifyApp.defaultDomain}
  ${amplifyDomain ? pulumi.interpolate`Custom Domain: https://${amplifyDomain.domainName}` : ""}
  Platform: WEB_COMPUTE (Next.js SSR)

Database:
  Provider: Supabase (Managed PostgreSQL)
  Dashboard: https://supabase.com/dashboard

Required Configuration:
  Set these secrets before deployment:

  Required (Supabase):
    pulumi config set supabaseUrl https://xxxxx.supabase.co
    pulumi config set --secret databaseUrl postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
    pulumi config set --secret supabaseAnonKey eyJxxx...
    pulumi config set --secret supabaseServiceRoleKey eyJxxx...

  Required (Auth):
    pulumi config set --secret betterAuthSecret <your-auth-secret>
    pulumi config set apiUrl https://${apiService.serviceUrl}  # After first deploy, use actual URL

  Optional (OAuth):
    pulumi config set --secret googleClientId <your-google-client-id>
    pulumi config set --secret googleClientSecret <your-google-client-secret>
    pulumi config set --secret githubClientId <your-github-client-id>
    pulumi config set --secret githubClientSecret <your-github-client-secret>

  Optional (Analytics):
    pulumi config set --secret posthogKey <your-posthog-key>
    pulumi config set posthogHost https://us.i.posthog.com

  Optional (GitHub/Amplify):
    pulumi config set --secret githubToken <your-github-token>
    pulumi config set githubOwner <your-github-username>
    pulumi config set githubRepo your-repo-name
    pulumi config set githubBranch main

  Optional (Custom Domain):
    pulumi config set domain yourdomain.com

Next Steps:
  1. Create Supabase project:
     - Visit https://supabase.com/dashboard
     - Create new project
     - Copy connection details and keys to Pulumi config

  2. Build and push your API Docker image:
     aws ecr get-login-password --region ${aws.getRegionOutput().name} | docker login --username AWS --password-stdin ${apiRepository.repositoryUrl}
     docker build --no-cache -f apps/api/Dockerfile -t ${apiRepository.repositoryUrl}:latest .
     docker push ${apiRepository.repositoryUrl}:latest

  3. Run database migrations:
     export DATABASE_URL=$(aws secretsmanager get-secret-value --secret-id ${supabaseSecret.name} --query SecretString --output text | jq -r .databaseUrl)
     pnpm --filter database db:migrate

  4. Trigger Amplify build (automatic on git push to ${githubBranch})

  5. ${amplifyDomain ? "Configure your DNS:" : "Set up custom domain (optional):"}
     ${
       amplifyDomain
         ? pulumi.interpolate`Add the following CNAME records to your DNS:
     - ${amplifyDomain.domainName} -> ${amplifyDomain.certificateVerificationDnsRecord}`
         : ""
     }

Security:
  - WAF enabled with AWS Managed Rules
  - Supabase manages database encryption and backups
  - Secrets stored in AWS Secrets Manager
  - CloudWatch monitoring and alarms configured
  - Row Level Security available in Supabase

=============================================================================
`;
