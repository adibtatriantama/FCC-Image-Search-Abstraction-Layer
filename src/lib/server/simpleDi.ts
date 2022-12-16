import { DynamoDbHistoryItemRepo } from './repo/impl/dynamoDbHistoryItemRepo';
import { DynamoDbImageSearchResultRepo } from './repo/impl/dynamoDbImageSearchResultRepo';
import { GoogleImageSearchService } from './service/impl/googleImageSearch.service';
import { FindRecentHistory } from './useCase/findRecentHistory/findRecentHistory';
import { SearchForImage } from './useCase/searchForImage/searchForImage';

const dynamoDbHistoryItemRepo = new DynamoDbHistoryItemRepo();

export const searchForImage = new SearchForImage(
	dynamoDbHistoryItemRepo,
	new DynamoDbImageSearchResultRepo(),
	new GoogleImageSearchService()
);

export const findRecentHistory = new FindRecentHistory(dynamoDbHistoryItemRepo);
