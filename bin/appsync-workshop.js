#!/usr/bin/env node
/**
 * AWS CDK app for automating the provisioning and deployment of the app's AWS resources. Uses the AWS CDK (for
 * JavaScript) to declare the stack of AWS resources to be deployed and managed by AWS CloudFormation.
 *
 * This file was originally generated by the cdk init command.
 *
 * The cdk.json file in the root directory of this project configures the AWS CDK toolkit / CLI to discover and run
 * this CDK app.
 */
const cdk = require('@aws-cdk/core');
const { AppsyncWorkshopStack } = require('../lib/appsync-workshop-stack');

const app = new cdk.App();
new AppsyncWorkshopStack(app, 'AppsyncWorkshopStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});