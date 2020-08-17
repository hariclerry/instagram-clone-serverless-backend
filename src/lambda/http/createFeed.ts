import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateFeedRequest } from '../../requests/CreateFeedRequest'
import { createFeed } from '../../businessLogic/feeds'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createFeed')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event ${event}`)

    const newFeed: CreateFeedRequest = JSON.parse(event.body)
    const authHeader = event.headers.Authorization

    const newFeedItem = await createFeed(newFeed, authHeader);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newFeedItem,
      }),
    };
  }
).use(cors())

