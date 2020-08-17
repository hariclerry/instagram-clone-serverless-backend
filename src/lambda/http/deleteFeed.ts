import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { deleteFeed } from '../../businessLogic/feeds'
import { createLogger } from '../../utils/logger'

const logger = createLogger('delete')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event ${event}`)

    const { feedId } = event.pathParameters
    const authHeader = event.headers.Authorization
    deleteFeed(feedId, authHeader);

    return {
      statusCode: 200,
      body: ''
    }
  }
).use(cors())