import { Result } from 'src/core/result';
import { QueryForImagesInput } from 'src/model/queryForImagesInput';
import { QueryForImagesResult } from 'src/model/queryForImagesResult';

export interface ImageSearchService {
  searchImage(
    request: QueryForImagesInput,
  ): Promise<Result<QueryForImagesResult>>;
}
