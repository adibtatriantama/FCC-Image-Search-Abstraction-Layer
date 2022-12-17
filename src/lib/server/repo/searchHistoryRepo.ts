import type { SearchHistoryDto } from '../../dto/searchHistory.dto';

export interface SearchHistoryRepo {
	findRecentSearchHistories(userId: string): Promise<SearchHistoryDto[]>;

	saveSearchHistory(userId: string, searchHistoryDto: SearchHistoryDto): Promise<void>;
}
