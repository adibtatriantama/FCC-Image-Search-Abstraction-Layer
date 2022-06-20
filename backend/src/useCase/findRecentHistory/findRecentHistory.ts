import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { HistoryItemDto } from 'src/model/historyItem';
import { HistoryItemRepo } from 'src/repo/historyItemRepo';

export type FindRecentHistoryResponse = Either<UseCaseError, HistoryItemDto[]>;

export class FindRecentHistory
  implements UseCase<void, FindRecentHistoryResponse>
{
  constructor(private readonly historyItemRepo: HistoryItemRepo) {}

  async execute(): Promise<FindRecentHistoryResponse> {
    const result = await this.historyItemRepo.findRecentHistoryItems();

    if (result.isSuccess) {
      const items = result.getValue();
      return right(items.map((item) => item.toDto()));
    } else {
      return left(new UnexpectedError());
    }
  }
}
