import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { Result } from 'src/core/result';
import { QueryForImagesInput } from 'src/model/queryForImagesInput';
import { QueryForImagesResult } from 'src/model/queryForImagesResult';
import { ImageSearchResultRepo } from '../imageSearchResultRepo';

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

const ddbclient = new DynamoDBClient({
  region: process.env.APP_REGION,
});
const ddbDoc = DynamoDBDocument.from(ddbclient);

export class DynamoDbImageSearchResultRepo implements ImageSearchResultRepo {
  async findImageSearchResultCache(
    query: QueryForImagesInput,
  ): Promise<Result<QueryForImagesResult>> {
    try {
      const getResult = await ddbDoc.get({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: this.generatePK(query),
          SK: query.start.toString(),
        },
      });

      const item = getResult.Item;

      if (!item) {
        return Result.fail('item is undefined');
      }

      const searchResult = QueryForImagesResult.create(item);

      return Result.ok(searchResult);
    } catch (error) {
      console.log(error);
      return Result.fail('Error happen');
    }
  }

  async saveImageSearchResultCache(
    query: QueryForImagesInput,
    result: QueryForImagesResult,
  ): Promise<Result<void>> {
    try {
      await ddbDoc.put({
        TableName: process.env.TABLE_NAME,
        Item: {
          PK: this.generatePK(query),
          SK: query.start.toString(),
          expireAt: Math.floor(Date.now() / 1000 + ONE_DAY_IN_SECONDS),
          ...result.toDto(),
        },
      });

      return Result.ok();
    } catch (error) {
      console.log(error);
      return Result.fail('Error happen');
    }
  }

  private generatePK(query: QueryForImagesInput): string {
    return `CACHE-q#${query.search}#${query.size}#${query.limit}`;
  }
}
