import * as uuid from 'uuid'

import { FeedItem } from '../models/FeedItem'
import { FeedAccess } from '../dataLayer/feedAccess'
import { CreateFeedRequest } from '../requests/CreateFeedRequest'
import { UpdateFeedRequest } from '../requests/UpdateFeedRequest'
import { getUserId } from '../auth/utils'

const feedAccess = new FeedAccess()
const bucketName = process.env.IMAGES_BUCKET;

export async function getFeeds(authHeader: string) {
         const userId = getUserId(authHeader);
         const feeds = await feedAccess.getFeeds(userId);
         return feeds;
       }

export async function createFeed(
  createNewFeed: CreateFeedRequest,
  authHeader: string
) {
  const userId = getUserId(authHeader)

  const feedId = uuid.v4()
  const likes = false
  const createdAt = new Date().toISOString()

  const newFeed = {
    feedId,
    userId,
    createdAt,
    likes,
    ...createNewFeed,
  } as FeedItem;

    if (createNewFeed.imageUrl && createNewFeed.imageUrl.length > 0) {
      newFeed.imageUrl = `https://${bucketName}.s3.amazonaws.com/${createNewFeed.imageUrl}`;
    }

  await feedAccess.createFeed(newFeed);

  return newFeed;
}

export async function updateFeed(
         feedId: string,
         updatedFeed: UpdateFeedRequest,
         authHeader: string
       ) {
         const { likes, imageCaption } = updatedFeed;
         const userId = getUserId(authHeader);

         await feedAccess.updateFeed(feedId, likes, imageCaption, userId);
         return updatedFeed;
       }

export async function deleteFeed(feedId: string, authHeader: string) {
  const userId = getUserId(authHeader)
  return await feedAccess.deleteFeed(feedId, userId);
}

export async function uploadFeedAttachment(
  feedId: string,
  authHeader: string,
  attachmentUrl: string
) {
  const userId = getUserId(authHeader)
  await feedAccess.uploadFeedAttachment(feedId, userId, attachmentUrl);
}
