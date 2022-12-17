import type { UseCase } from '$lib/server/core/useCase';
import type { SearchHistoryDto } from '$lib/dto/searchHistory.dto';
import type { SearchHistoryRepo } from '$lib/server/repo/searchHistoryRepo';
import { left, right, type Either } from '$lib/server/core/either';
import { UseCaseError } from '$lib/server/core/useCaseError';

export type FindRecentHistoryResponse = Either<UseCaseError, SearchHistoryDto[]>;

export class FindRecentHistoryError extends UseCaseError {
	constructor(error: any) {
		switch (error?.message) {
			default:
				console.error(error);
				super('Unknown Error');
		}
	}
}

export class FindRecentHistory implements UseCase<void, FindRecentHistoryResponse> {
	constructor(private readonly searchHistoryRepo: SearchHistoryRepo) {}

	async execute(): Promise<FindRecentHistoryResponse> {
		try {
			const histories = await this.searchHistoryRepo.findRecentSearchHistories('all');

			return right(histories);
		} catch (error) {
			return left(new FindRecentHistoryError(error));
		}
	}
}
