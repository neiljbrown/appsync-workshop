// 1. Import dependencies - required CDK constructs
const cdk = require('@aws-cdk/core');
const appsync = require('@aws-cdk/aws-appsync')
const db = require('@aws-cdk/aws-dynamodb')

// 2. Declare a static expiration date for the API KEY
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const WORKSHOP_DATE = new Date() // date of this workshop
WORKSHOP_DATE.setHours(0)
WORKSHOP_DATE.setMinutes(0)
WORKSHOP_DATE.setSeconds(0)
WORKSHOP_DATE.setMilliseconds(0)
const KEY_EXPIRATION_DATE = new Date(WORKSHOP_DATE.getTime() + SEVEN_DAYS)

class AppsyncWorkshopStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // 3. Provision the AppSync API
    const api = new appsync.GraphqlApi(this, 'WorkshopAPI', {
      name: 'WorkshopAPI',
      // 3.1 Create schema from schema definition file
      schema: appsync.Schema.fromAsset('../appsync/schema.graphql'),
      // 3.2 Authorization mode - Default to use of API key (for dev/test) and set key expiration date/time
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: 'API_KEY',
          apiKeyConfig: {
            name: 'default',
            description: 'default auth mode',
            expires: cdk.Expiration.atDate(KEY_EXPIRATION_DATE),
          },
        },
      },
    })

    // 4. Provision a DynamoDB table for storing data-points, with partition key and sort key. (Using default
    // provisioned capacity mode).
    const table = new db.Table(this, 'DataPointTable', {
      partitionKey: { name: 'name', type: db.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: db.AttributeType.STRING },
    })

    // 5. Update AppSync API to use table as a data-source. This also creates a Service-Linked IAM role that allows
    // AppSync to access the table.
    const dataSource = api.addDynamoDbDataSource('dataPointSource', table)

    // 6. Define resolvers for operations on Data Points

    // 6.1)  Mutations
    dataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'createDataPoint',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        '../appsync/resolvers/Mutation.createDataPoint.req.vtl'
      ),
      // Provide a request mapping template definition that just returns the result of the DynamoDB operation
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    })

    dataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateDataPoint',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        '../appsync/resolvers/Mutation.updateDataPoint.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    })

    dataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteDataPoint',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        '../appsync/resolvers/Mutation.deleteDataPoint.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    })

    // 6.2)  Queries
    dataSource.createResolver({
      typeName: 'Query',
      fieldName: 'getDataPoint',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        '../appsync/resolvers/Query.getDataPoint.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    })

    dataSource.createResolver({
      typeName: 'Query',
      fieldName: 'listDataPoints',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        '../appsync/resolvers/Query.listDataPoints.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    })

    dataSource.createResolver({
      typeName: 'Query',
      fieldName: 'queryDataPointsByNameAndDateTime',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        '../appsync/resolvers/Query.queryDataPointsByNameAndDateTime.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    })

    // 7. Stack Outputs - Create outputs for details of provisioned resources required to access the GraphQL API endpoint
    new cdk.CfnOutput(this, 'GRAPHQL_API_ID', { value: api.apiId })
    new cdk.CfnOutput(this, 'GRAPHQL_API_URL', { value: api.graphqlUrl })
    new cdk.CfnOutput(this, 'GRAPHQL_API_KEY', { value: api.apiKey })
    new cdk.CfnOutput(this, 'STACK_REGION', { value: this.region })
  }
}

module.exports = { AppsyncWorkshopStack }