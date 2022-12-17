import type { ImageRepo } from '$lib/server/repo/imageRepo';
import type { ImageSearchService } from '$lib/server/service/imageSearch.service';
import type { QueryDto } from '$lib/dto/query.dto';
import type { ImageDto } from '$lib/dto/image.dto';
import type { UseCase } from '$lib/server/core/useCase';
import { UseCaseError } from '$lib/server/core/useCaseError';
import { ERROR_NOT_FOUND, ERROR_TOO_MANY_REQUEST } from '$lib/server/constant';
import type { SearchHistoryRepo } from '$lib/server/repo/searchHistoryRepo';
import { left, right, type Either } from '$lib/server/core/either';

export type SearchForImageResponse = Either<UseCaseError, ImageDto[]>;

export class SearchForImageError extends UseCaseError {
	constructor(error: any) {
		switch (error?.message) {
			case ERROR_NOT_FOUND:
				super('No image found, please try another keyword');
				break;
			case ERROR_TOO_MANY_REQUEST:
				super('Too many request, please try again later');
				break;
			default:
				console.error(error);
				super('Unknown Error');
		}
	}
}

export class SearchForImage implements UseCase<QueryDto, SearchForImageResponse> {
	constructor(
		private readonly imageSearchService: ImageSearchService,
		private readonly imageRepo: ImageRepo,
		private readonly searchHistoryRepo: SearchHistoryRepo
	) {}

	async execute(request: QueryDto): Promise<SearchForImageResponse> {
		const promises = [];

		let images = await this.tryToSearchImagesInCache(request);

		if (!images) {
			try {
				images = await this.imageSearchService.searchImage(request);
			} catch (error) {
				return left(new SearchForImageError(error));
			}

			promises.push(this.tryToCacheImages(request, images));
		}

		if (this.isQueryForFirstPage(request)) {
			promises.push(this.tryToSaveSearchHistory(request));
		}

		await Promise.all(promises);

		return right(images);
	}

	private async tryToSearchImagesInCache(query: QueryDto): Promise<ImageDto[] | null> {
		try {
			return await this.imageRepo.findImages(query);
		} catch (error) {
			return null;
		}
	}

	private async tryToCacheImages(query: QueryDto, images: ImageDto[]): Promise<void> {
		try {
			return await this.imageRepo.saveImages(query, images);
		} catch (error) {
			console.error(new Error('Unable to cache images', { cause: error }));
		}
	}

	private isQueryForFirstPage(query: QueryDto): boolean {
		return query.start === 1;
	}

	private async tryToSaveSearchHistory(query: QueryDto): Promise<void> {
		try {
			return await this.searchHistoryRepo.saveSearchHistory('all', {
				term: query.term,
				created: new Date()
			});
		} catch (error) {
			console.error(new Error('Unable to save search history', { cause: error }));
		}
	}
}
