import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulid';
import { Result } from 'src/core/result';
import { HistoryItem } from 'src/model/historyItem';
import { HistoryItemRepo } from '../historyItemRepo';

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

const ddbclient = new DynamoDBClient({
  region: process.env.APP_REGION,
});
const ddbDoc = DynamoDBDocument.from(ddbclient);

export class DynamoDbHistoryItemRepo implements HistoryItemRepo {
  async findRecentHistoryItems(): Promise<Result<HistoryItem[]>> {
    try {
      const queryResult = await ddbDoc.query({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': 'HISTORY',
        },
        ScanIndexForward: false,
        Limit: 10,
      });

      const items = queryResult.Items;

      if (!items) {
        throw new Error('items is undefined');
      }

      const historyItems: HistoryItem[] = items.map((item): HistoryItem => {
        return HistoryItem.create({
          title: item.title,
          url: item.url,
          date: new Date(item.date),
        });
      });

      return Result.ok(historyItems);
    } catch (error) {
      console.log(error);
      return Result.fail('Error happen');
    }
  }

  async saveHistoryItem(historyItem: HistoryItem): Promise<Result<void>> {
    try {
      await ddbDoc.put({
        TableName: process.env.TABLE_NAME,
        Item: {
          PK: 'HISTORY',
          SK: ulid(),
          title: historyItem.title,
          url: historyItem.url,
          date: historyItem.date.toISOString(),
          expireAt: Math.floor(Date.now() / 1000 + ONE_DAY_IN_SECONDS),
        },
      });

      return Result.ok();
    } catch (error) {
      console.log(error);
      return Result.fail('Error happen');
    }
  }
}
