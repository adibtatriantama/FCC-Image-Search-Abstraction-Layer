import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import {
  QueryForImagesInput,
  QueryForImagesInputSize,
  formatImageSize,
} from 'src/model/queryForImagesInput';
import { DynamoDbHistoryItemRepo } from 'src/repo/impl/dynamoDbHistoryItemRepo';
import { DynamoDbImageSearchResultRepo } from 'src/repo/impl/dynamoDbImageSearchResultRepo';
import { GoogleImageSearchService } from 'src/service/impl/googleImageSearch.service';
import { SearchForImage } from './searchForImage';

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  let response;

  const { search, limit, size, start } = event.queryStringParameters;

  if (!search) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "'search' query param shouldn't be emptty",
      }),
    };
  }

  const useCase = new SearchForImage(
    new DynamoDbHistoryItemRepo(),
    new DynamoDbImageSearchResultRepo(),
    new GoogleImageSearchService(),
  );

  const parsedLimit = limit ? parseInt(limit) : null;
  const parsedStart = start ? parseInt(start) : null;

  const request = QueryForImagesInput.create({
    size: formatImageSize(size),
    limit: parsedLimit,
    start: parsedStart,
    search,
  });

  const useCaseResponse = await useCase.execute(request);

  if (useCaseResponse.isRight()) {
    response = {
      statusCode: 200,
      body: JSON.stringify(useCaseResponse.value),
    };
  } else {
    response = {
      statusCode: 500,
      body: JSON.stringify({
        error: 'unexpected error',
      }),
    };
  }

  return response;
};
