import { Result } from 'src/core/result';
import { HistoryItem } from 'src/model/historyItem';

export interface HistoryItemRepo {
  findRecentHistoryItems(): Promise<Result<HistoryItem[]>>;

  saveHistoryItem(historyItem: HistoryItem): Promise<Result<void>>;
}
