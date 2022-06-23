import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { Result } from 'src/core/result';
import { Query } from 'src/model/query';
import { Search } from 'src/model/search';
import { SearchRepo } from '../searchRepo';

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

const ddbclient = new DynamoDBClient({
  region: process.env.APP_REGION,
});
const ddbDoc = DynamoDBDocument.from(ddbclient, {
  marshallOptions: { removeUndefinedValues: true },
});

export class DynamoDbImageSearchResultRepo implements SearchRepo {
  async findSearchCache(query: Query): Promise<Result<Search>> {
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

      const searchResult = Search.create(item);

      return Result.ok(searchResult);
    } catch (error) {
      console.log(error);
      return Result.fail('Error happen');
    }
  }

  async saveSearchCache(query: Query, search: Search): Promise<Result<void>> {
    try {
      await ddbDoc.put({
        TableName: process.env.TABLE_NAME,
        Item: {
          PK: this.generatePK(query),
          SK: query.start.toString(),
          expireAt: Math.floor(Date.now() / 1000 + ONE_DAY_IN_SECONDS),
          ...search.toDto(),
        },
      });

      return Result.ok();
    } catch (error) {
      console.log(error);
      return Result.fail('Error happen');
    }
  }

  private generatePK(query: Query): string {
    return `CACHE-q#${query.search}#${query.size}#${query.limit}`;
  }
}
