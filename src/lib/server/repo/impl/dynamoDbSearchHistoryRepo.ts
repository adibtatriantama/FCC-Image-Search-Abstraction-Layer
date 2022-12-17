import { ERROR_UNKNOWN } from '$lib/server/constant';
import { onetable, type SearchHistoryType } from '$lib/server/database/onetable';
import type { SearchHistoryDto } from '$lib/dto/searchHistory.dto';
import type { Model } from 'dynamodb-onetable';
import type { SearchHistoryRepo } from '../searchHistoryRepo';

const ONE_WEEK_IN_MILLISECOND = 7 * 24 * 60 * 60 * 1000;

export class DynamoDbSearchHistoryRepo implements SearchHistoryRepo {
	private searchHistoryModel: Model<SearchHistoryType>;

	constructor() {
		this.searchHistoryModel = onetable.getModel<SearchHistoryType>('SearchHistory');
	}

	async findRecentSearchHistories(userId: string): Promise<SearchHistoryDto[]> {
		const searchHistories: SearchHistoryDto[] = [];
		let next: any;

		do {
			const items = await this.searchHistoryModel.find(
				{ userId },
				{
					reverse: true,
					next
				}
			);

			searchHistories.push(
				...items.map((item) => {
					return {
						term: item.term,
						created: item.created
					};
				})
			);

			next = items.next;
		} while (next);

		return searchHistories;
	}

	async saveSearchHistory(userId: string, searchHistory: SearchHistoryDto): Promise<void> {
		await this.searchHistoryModel.create({
			expireAt: new Date(searchHistory.created.getTime() + ONE_WEEK_IN_MILLISECOND),
			userId,
			...searchHistory
		});
	}
}
