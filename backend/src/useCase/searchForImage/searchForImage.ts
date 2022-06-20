import { Either, left, right } from 'src/core/either';
import { UseCase } from 'src/core/useCase';
import { UnexpectedError, UseCaseError } from 'src/core/useCaseError';
import { HistoryItem } from 'src/model/historyItem';
import { QueryForImagesInput } from 'src/model/queryForImagesInput';
import {
  QueryForImagesResult,
  QueryForImagesResultDto,
} from 'src/model/queryForImagesResult';
import { HistoryItemRepo } from 'src/repo/historyItemRepo';
import { ImageSearchResultRepo } from 'src/repo/imageSearchResultRepo';
import { ImageSearchService } from 'src/service/imageSearch.service';

export type SearchForImageResponse = Either<
  UseCaseError,
  QueryForImagesResultDto
>;

export class SearchForImage
  implements UseCase<QueryForImagesInput, SearchForImageResponse>
{
  constructor(
    private readonly historyItemRepo: HistoryItemRepo,
    private readonly imageSearchResultRepo: ImageSearchResultRepo,
    private readonly imageSearchService: ImageSearchService,
  ) {}

  async execute(request: QueryForImagesInput): Promise<SearchForImageResponse> {
    let queryForImageResult: QueryForImagesResult;

    const cacheResult =
      await this.imageSearchResultRepo.findImageSearchResultCache(request);

    if (cacheResult.isFailure) {
      const imageSearchServiceResult =
        await this.imageSearchService.searchImage(request);

      if (imageSearchServiceResult.isFailure) {
        console.error(imageSearchServiceResult.getErrorValue());

        return left(new UnexpectedError());
      }

      queryForImageResult = imageSearchServiceResult.getValue();

      await this.imageSearchResultRepo.saveImageSearchResultCache(
        request,
        queryForImageResult,
      );
    } else {
      queryForImageResult = cacheResult.getValue();
    }

    const historyItem = HistoryItem.create({
      title: request.search,
      url: request.toUrl(),
      date: new Date(),
    });

    await this.historyItemRepo.saveHistoryItem(historyItem);

    return right(queryForImageResult.toDto());
  }
}