import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getFeeds } from '../../businessLogic/feeds'
import { createLogger } from '../../utils/logger'

const logger = createLogger('get')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event ${event}`)

    const authHeader = event.headers.Authorization
    const feeds = await getFeeds(authHeader)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: feeds
      })
    }
  }
).use(cors())