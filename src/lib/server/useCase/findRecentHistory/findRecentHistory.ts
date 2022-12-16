import { type Either, right, left } from '$lib/server/core/either';
import type { UseCase } from '$lib/server/core/useCase';
import { type UseCaseError, UnexpectedError } from '$lib/server/core/useCaseError';
import type { HistoryItemDto } from '$lib/server/model/historyItem';
import type { HistoryItemRepo } from '$lib/server/repo/historyItemRepo';

export type FindRecentHistoryResponse = Either<UseCaseError, HistoryItemDto[]>;

export class FindRecentHistory implements UseCase<void, FindRecentHistoryResponse> {
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
