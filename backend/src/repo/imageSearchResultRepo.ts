import { Result } from 'src/core/result';
import { QueryForImagesInput } from 'src/model/queryForImagesInput';
import { QueryForImagesResult } from 'src/model/queryForImagesResult';

export interface ImageSearchResultRepo {
  findImageSearchResultCache(
    query: QueryForImagesInput,
  ): Promise<Result<QueryForImagesResult>>;

  saveImageSearchResultCache(
    query: QueryForImagesInput,
    result: QueryForImagesResult,
  ): Promise<Result<void>>;
}
