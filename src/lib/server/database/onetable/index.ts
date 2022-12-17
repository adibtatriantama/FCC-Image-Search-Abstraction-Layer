import { APP_REGION, TABLE_NAME } from '$env/static/private';
import Dynamo from 'dynamodb-onetable/Dynamo';
import { Table, type Entity } from 'dynamodb-onetable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ONETABLE_SCHEMA } from './schema';

const ddbclient = new DynamoDBClient({
	region: APP_REGION
});

const client = new Dynamo({
	client: ddbclient
});

export const onetable = new Table({
	name: TABLE_NAME,
	schema: ONETABLE_SCHEMA,
	partial: false,
	client
});

export type SearchHistoryType = Entity<typeof ONETABLE_SCHEMA.models.SearchHistory>;
export type ImageType = Entity<typeof ONETABLE_SCHEMA.models.Image>;
