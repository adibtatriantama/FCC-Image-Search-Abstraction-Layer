import type { Result } from '../core/result';
import type { HistoryItem } from '../model/historyItem';

export interface HistoryItemRepo {
	findRecentHistoryItems(): Promise<Result<HistoryItem[]>>;

	saveHistoryItem(historyItem: HistoryItem): Promise<Result<void>>;
}
