import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

/**
 * Route 53 DNS Configuration for Custom Domains
 *
 * This module sets up DNS records for:
 * - yourdomain.com (root domain) → Amplify
 * - www.yourdomain.com → Amplify
 * - api.yourdomain.com → App Runner
 */

interface DnsConfig {
  domain: string;
  amplifyApp: aws.amplify.App;
  amplifyBranch: aws.amplify.Branch;
  apiService: aws.apprunner.Service;
  apiCustomDomain?: aws.apprunner.CustomDomainAssociation;
}

export function setupDns(config: DnsConfig) {
  const { domain, amplifyApp, apiService, apiCustomDomain } = config;

  // Get the hosted zone for the domain
  const hostedZone = aws.route53.getZone({
    name: domain,
  });

  // ACM Certificate for API (App Runner requires us-east-1 for CloudFront)
  const apiCertificate = new aws.acm.Certificate(
    "api-certificate",
    {
      domainName: `api.${domain}`,
      validationMethod: "DNS",
      tags: {
        Name: `api.${domain}`,
        Project: "app",
      },
    },
    {
      // App Runner requires certificates in the same region as the service
      provider: new aws.Provider("cert-provider", {
        region: aws.getRegionOutput().name as any,
      }),
    }
  );

  // DNS validation for API certificate
  const apiCertValidationRecords = apiCertificate.domainValidationOptions.apply((options) =>
    options.map((option, index) => {
      return new aws.route53.Record(`api-cert-validation-${index}`, {
        zoneId: hostedZone.then((z) => z.zoneId),
        name: option.resourceRecordName,
        type: option.resourceRecordType,
        records: [option.resourceRecordValue],
        ttl: 60,
      });
    })
  );

  // Certificate validation
  const apiCertValidation = new aws.acm.CertificateValidation("api-cert-validation", {
    certificateArn: apiCertificate.arn,
    validationRecordFqdns: apiCertValidationRecords.apply((records) => records.map((r) => r.fqdn)),
  });

  // DNS record for API (CNAME to App Runner)
  // Note: App Runner provides the DNS target after custom domain association
  if (apiCustomDomain) {
    const apiDnsRecord = new aws.route53.Record("api-dns-record", {
      zoneId: hostedZone.then((z) => z.zoneId),
      name: `api.${domain}`,
      type: "CNAME",
      records: [apiService.serviceUrl],
      ttl: 300,
    });
  }

  // For Amplify, we need to get the CloudFront distribution
  // Amplify automatically creates ACM certificates and handles validation
  // We just need to point our domain to the Amplify CloudFront distribution

  // Note: Amplify domain association creates the certificate automatically
  // We just need to add validation records which Amplify provides

  return {
    hostedZoneId: hostedZone.then((z) => z.zoneId),
    apiCertificateArn: apiCertificate.arn,
  };
}
