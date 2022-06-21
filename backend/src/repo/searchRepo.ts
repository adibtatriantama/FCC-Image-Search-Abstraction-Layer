import { Result } from 'src/core/result';
import { Query } from 'src/model/query';
import { Search } from 'src/model/search';

export interface SearchRepo {
  findSearchCache(query: Query): Promise<Result<Search>>;

  saveSearchCache(query: Query, result: Search): Promise<Result<void>>;
}
