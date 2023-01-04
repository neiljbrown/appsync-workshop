/**
 * Automated tests for the app's AWS stack deployed by the AWS CDK app (bin/appsync-workshop.js), as implemented in
 * lib/appsync-workshop-stack.js.
 *
 * To run these tests cd to the root folder of this repo and execute the command $ npm run test.
 */
const { Template } = require('@aws-cdk/assertions');
const cdk = require('@aws-cdk/core');
const AppsyncWorkshop = require('../lib/appsync-workshop-stack');

/**
 * Test that the AWS CDK client deems the stack generally valid, and the stack includes the provisioning of the
  * app's AppSync GraphQL API.
 */
test('AppSync WorkshopAPI Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new AppsyncWorkshop.AppsyncWorkshopStack(app, 'MyTestStack');
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::AppSync::GraphQLApi', {
    Name: 'WorkshopAPI'
  });
});

