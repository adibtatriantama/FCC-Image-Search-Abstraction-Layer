import { NOT_FOUND, TOO_MANY_REQUEST } from 'src/constant';
import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { HistoryItem } from 'src/model/historyItem';
import { Query } from 'src/model/query';
import { Search, SearchDto } from 'src/model/search';
import { HistoryItemRepo } from 'src/repo/historyItemRepo';
import { SearchRepo } from 'src/repo/searchRepo';
import { ImageSearchService } from 'src/service/imageSearch.service';

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
    private readonly imageSearchService: ImageSearchService,
  ) {}

  async execute(request: Query): Promise<SearchForImageResponse> {
    let response: Search;
    const promises = [];

    const cacheResult = await this.imageSearchResultRepo.findSearchCache(
      request,
    );

    if (cacheResult.isFailure) {
      const imageSearchServiceResult =
        await this.imageSearchService.searchImage(request);

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

      promises.push(
        this.imageSearchResultRepo.saveSearchCache(request, response),
      );
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
      date: new Date(),
    });

    await this.historyItemRepo.saveHistoryItem(historyItem);
  }
}
