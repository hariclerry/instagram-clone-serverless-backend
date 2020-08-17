import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk-core')

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = 300


export function generateSignedUrl(feedId: string) {
  return s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: feedId,
    Expires: urlExpiration,
  });
}
