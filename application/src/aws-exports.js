const awsmobile = {
  aws_appsync_graphqlEndpoint: 'https://<your-appsync-api-subdomain>.appsync-api.<your-appsync-aws-region>.amazonaws.com/graphql',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  aws_appsync_region: '<your-appsync-aws-region>',
  aws_cognito_region: '<your-cognito-aws-region>',
  aws_user_pools_id: '<your-cognito-user-pool-id>',
  aws_user_pools_web_client_id: '<your-cognito-user-pool-web-client-id>',
}

export default awsmobile
