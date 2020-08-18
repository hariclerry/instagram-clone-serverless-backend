import "source-map-support/register";

import * as middy from "middy";
import { cors } from "middy/middlewares";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { generateSignedUrl } from "../../s3/generateSignedUrl";
import { createLogger } from "../../utils/logger";

const logger = createLogger("Image upload");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event ${event}`);

    const { ImageKey } = event.pathParameters;
    const signedUrl = generateSignedUrl(ImageKey);

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: signedUrl,
      }),
    };
  }
).use(cors());
