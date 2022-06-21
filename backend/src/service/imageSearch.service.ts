import { Result } from 'src/core/result';
import { Query } from 'src/model/query';
import { Search } from 'src/model/search';

export interface ImageSearchService {
  searchImage(query: Query): Promise<Result<Search>>;
}
