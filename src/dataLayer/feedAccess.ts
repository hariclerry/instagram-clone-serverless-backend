import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { FeedItem } from "../models/FeedItem";

const AWSXRay = require("aws-xray-sdk");
const XAWS = AWSXRay.captureAWS(AWS);

export class FeedAccess {
  constructor(
    private docClient: DocumentClient = createDynamoDBClient(),
    private feedsTable = process.env.FEEDS_TABLE
  ) {}

  async getFeeds(userId: string): Promise<FeedItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.feedsTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();

    return result.Items as FeedItem[];
  }

  async createFeed(feed: FeedItem): Promise<FeedItem> {
    await this.docClient
      .put({
        TableName: this.feedsTable,
        Item: feed,
      })
      .promise();

    return feed as FeedItem;
  }

  async updateFeed(
    feedId: string,
    likes: boolean,
    imageCaption: string,
    userId: string
  ) {
    await this.docClient
      .update({
        TableName: this.feedsTable,
        Key: { feedId, userId },
        UpdateExpression: "SET imageCaption = :imageCaption, likes = :likes",
        ConditionExpression: "feedId = :feedId",
        ExpressionAttributeValues: {
          ":imageCaption": imageCaption || null,
          ":likes": likes || null,
        },
      })
      .promise();
  }

  async deleteFeed(feedId: string, userId: string): Promise<string> {
    await this.docClient
      .delete({
        TableName: this.feedsTable,
        Key: { feedId, userId },
      })
      .promise();
    return Promise.resolve(feedId);
  }

  // async uploadFeedAttachment(
  //   feedId: string,
  //   userId: string,
  //   attachmentUrl: string
  // ): Promise<void> {
  //   await this.docClient
  //     .update({
  //       TableName: this.feedsTable,
  //       Key: { feedId, userId },
  //       UpdateExpression: "set attachmentUrl = :attachmentUrl",
  //       ConditionExpression: "feedId = :feedId",
  //       ExpressionAttributeValues: {
  //         ":feedId": feedId,
  //         ":attachmentUrl": attachmentUrl,
  //       },
  //     })
  //     .promise();
  // }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log("Creating a local DynamoDB instance");
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
