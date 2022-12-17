import { DynamoDbImageRepo } from './repo/impl/dynamoDbImageRepo';
import { DynamoDbSearchHistoryRepo } from './repo/impl/dynamoDbSearchHistoryRepo';
import { GoogleImageSearchService } from './service/impl/googleImageSearch.service';
import { FindRecentHistory } from './useCase/findRecentHistory/findRecentHistory';
import { SearchForImage } from './useCase/searchForImage/searchForImage';

const dynamoDbHistoryItemRepo = new DynamoDbSearchHistoryRepo();

export const searchForImage = new SearchForImage(
	new GoogleImageSearchService(),
	new DynamoDbImageRepo(),
	dynamoDbHistoryItemRepo
);

export const findRecentHistory = new FindRecentHistory(dynamoDbHistoryItemRepo);
