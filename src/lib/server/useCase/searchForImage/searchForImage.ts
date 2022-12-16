import { NOT_FOUND, TOO_MANY_REQUEST } from '$lib/server/constant';
import { type Either, left, right } from '$lib/server/core/either';
import type { UseCase } from '$lib/server/core/useCase';
import { UseCaseError, UnexpectedError } from '$lib/server/core/useCaseError';
import { HistoryItem } from '$lib/server/model/historyItem';
import type { Query } from '$lib/server/model/query';
import type { SearchDto, Search } from '$lib/server/model/search';
import type { HistoryItemRepo } from '$lib/server/repo/historyItemRepo';
import type { SearchRepo } from '$lib/server/repo/searchRepo';
import type { ImageSearchService } from '$lib/server/service/imageSearch.service';

export class TooManyRequestError extends UseCaseError {
	constructor() {
		super('Too many request, please try again later');
	}
}

export class ImageNotFoundError extends UseCaseError {
	constructor() {
		super('No image found, please try another keyword');
	}
}

export type SearchForImageResponse = Either<UseCaseError, SearchDto>;

export class SearchForImage implements UseCase<Query, SearchForImageResponse> {
	constructor(
		private readonly historyItemRepo: HistoryItemRepo,
		private readonly imageSearchResultRepo: SearchRepo,
		private readonly imageSearchService: ImageSearchService
	) {}

	async execute(request: Query): Promise<SearchForImageResponse> {
		let response: Search;
		const promises = [];

		const cacheResult = await this.imageSearchResultRepo.findSearchCache(request);

		if (cacheResult.isFailure) {
			const imageSearchServiceResult = await this.imageSearchService.searchImage(request);

			if (imageSearchServiceResult.isFailure) {
				const error = imageSearchServiceResult.getErrorValue();
				console.error(error);

				switch (error) {
					case NOT_FOUND:
						return left(new ImageNotFoundError());
					case TOO_MANY_REQUEST:
						return left(new TooManyRequestError());
					default:
						return left(new UnexpectedError());
				}
			}

			response = imageSearchServiceResult.getValue();

			promises.push(this.imageSearchResultRepo.saveSearchCache(request, response));
		} else {
			response = cacheResult.getValue();
		}

		promises.push(this.saveSearchHistory(request));

		await Promise.all(promises);

		return right(response.toDto());
	}

	private async saveSearchHistory(request: Query) {
		const historyItem = HistoryItem.create({
			title: request.search,
			url: request.toUrl(),
			date: new Date()
		});

		await this.historyItemRepo.saveHistoryItem(historyItem);
	}
}
