import type { Result } from '../core/result';
import type { Query } from '../model/query';
import type { Search } from '../model/search';

export interface SearchRepo {
	findSearchCache(query: Query): Promise<Result<Search>>;

	saveSearchCache(query: Query, result: Search): Promise<Result<void>>;
}
