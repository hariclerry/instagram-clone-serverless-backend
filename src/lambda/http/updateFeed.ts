import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateFeedRequest } from '../../requests/UpdateFeedRequest'
import { updateFeed } from '../../businessLogic/feeds'
import { createLogger } from '../../utils/logger'

const logger = createLogger('update')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event ${event}`)

    const { feedId } = event.pathParameters
    const updatedFeed: UpdateFeedRequest = JSON.parse(event.body)
    const authHeader = event.headers.Authorization

    await updateFeed(feedId, updatedFeed, authHeader);

    return {
      statusCode: 200,
      body: JSON.stringify(updatedFeed),
    };
  }
).use(cors())
