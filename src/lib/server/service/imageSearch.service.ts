import type { Result } from '../core/result';
import type { Query } from '../model/query';
import type { Search } from '../model/search';

export interface ImageSearchService {
	searchImage(query: Query): Promise<Result<Search>>;
}
