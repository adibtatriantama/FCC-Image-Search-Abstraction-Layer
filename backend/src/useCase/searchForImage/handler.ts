import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { Query, formatImageSize } from 'src/model/query';
import { DynamoDbHistoryItemRepo } from 'src/repo/impl/dynamoDbHistoryItemRepo';
import { DynamoDbImageSearchResultRepo } from 'src/repo/impl/dynamoDbImageSearchResultRepo';
import { GoogleImageSearchService } from 'src/service/impl/googleImageSearch.service';
import {
  ImageNotFoundError,
  SearchForImage,
  TooManyRequestError,
} from './searchForImage';

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  process.env.BASE_URL = `https://${event.requestContext.domainName}`;

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

  const query = Query.create({
    size: formatImageSize(size),
    limit: parsedLimit,
    start: parsedStart,
    search,
  });

  const useCaseResponse = await useCase.execute(query);

  if (useCaseResponse.isRight()) {
    response = {
      statusCode: 200,
      body: JSON.stringify(useCaseResponse.value),
    };
  } else {
    switch (useCaseResponse.value.constructor) {
      case TooManyRequestError:
        response = {
          statusCode: 429,
          body: JSON.stringify({
            error: useCaseResponse.value.message,
          }),
        };
        break;
      case ImageNotFoundError:
        response = {
          statusCode: 404,
          body: JSON.stringify({
            error: useCaseResponse.value.message,
          }),
        };
        break;
      default:
        response = {
          statusCode: 500,
          body: JSON.stringify({
            error: useCaseResponse.value.message,
          }),
        };
        break;
    }
  }

  return response;
};
