const cdk = require('@aws-cdk/core')
const waf2 = require('@aws-cdk/aws-wafv2')

/**
 * CDK construct that configures the AWS Web Application Firewall (WAF) service to protect this app's APIs against
 * common web exploits that may affect availability, compromise security, or consume excessive resources.
 */
class WafConfig extends cdk.Construct {

  /**
   * Create instance of this Construct.
   */
  constructor(scope, id, { api }) {
    super(scope, id)

    // Define the IP addresses that should be blocked from accessing this app
    const blockedIPSet = new waf2.CfnIPSet(this, 'MyIP', {
      addresses: ['146.198.93.180/32'], // Add public IP addresses to be blocked.
      ipAddressVersion: 'IPV4',
      scope: 'REGIONAL',
      name: 'MyIPSet-AppSyncWorkshop',
    })

    // Create WAF ACL comprising required rules
    const acl = new waf2.CfnWebACL(this, `ACL`, {
      defaultAction: { allow: {} },
      scope: 'REGIONAL',
      name: `WorkshopAPI-ACL`,
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: 'WorkshopAPI',
      },
      rules: [
        // Rule - Rate-limit requests from each individual IP address to 1000 per 5 minutes.
        {
          name: 'FloodProtection',
          action: { block: {} },
          priority: 1,
          statement: {
            rateBasedStatement: { aggregateKeyType: 'IP', limit: 1000 },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: `WorkshopAPI-FloodProtection`,
          },
        },
        // Rule - Block all requests made with the API Key and originating from all but the specified IP address.
        {
          name: 'RestrictAPIKey',
          action: { block: {} },
          priority: 2,
          statement: {
            andStatement: {
              statements: [
                {
                  byteMatchStatement: {
                    fieldToMatch: { singleHeader: { Name: 'x-api-key' } },
                    positionalConstraint: 'EXACTLY',
                    searchString: api.apiKey,
                    textTransformations: [{ priority: 1, type: 'LOWERCASE' }],
                  },
                },
                {
                  notStatement: {
                    statement: {
                      ipSetReferenceStatement: { arn: blockedIPSet.attrArn },
                    },
                  },
                },
              ],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: `WorkshopAPI-RestrictAPIKey`,
          },
        },
      ],
    })

    const association = new waf2.CfnWebACLAssociation(this, 'APIAssoc', {
      resourceArn: api.arn,
      webAclArn: acl.attrArn,
    })

    this.acl = acl
    this.association = association
  }
}

module.exports = { WafConfig }
