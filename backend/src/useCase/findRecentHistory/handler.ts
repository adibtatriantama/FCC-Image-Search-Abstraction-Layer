import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDbHistoryItemRepo } from 'src/repo/impl/dynamoDbHistoryItemRepo';
import { FindRecentHistory } from './findRecentHistory';

export const main: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
) => {
  const useCase = new FindRecentHistory(new DynamoDbHistoryItemRepo());

  const useCaseResponse = await useCase.execute();

  if (useCaseResponse.isRight()) {
    return {
      statusCode: 200,
      body: JSON.stringify(useCaseResponse.value),
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'unexpected error',
      }),
    };
  }
};
