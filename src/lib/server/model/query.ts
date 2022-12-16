export type ImageSize = 'icon' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'huge';

export const formatImageSize = (size: string): ImageSize => {
	switch (size) {
		case 'icon':
		case 'small':
		case 'medium':
		case 'large':
		case 'xlarge':
		case 'xxlarge':
		case 'huge':
			return size;

		default:
			return 'medium';
	}
};

export type QueryProps = {
	search: string;
	start: number;
	limit: number;
	size: ImageSize;
};

export type QueryDto = QueryProps;

export class Query {
	private constructor(public readonly props: QueryProps) {}

	static create(props: Partial<QueryProps>): Query {
		if (!props.search) {
			throw new Error('search is required');
		}

		let limit = props.limit || 10;

		if (limit > 10 || limit < 1) {
			console.warn(`Limit is out of range, setting to 10.`);
			limit = 10;
		}

		return new Query({
			limit: limit,
			search: props.search,
			start: props.start || 1,
			size: props.size || 'medium'
		});
	}

	get search(): string {
		return this.props.search;
	}

	get start(): number {
		return this.props.start;
	}

	get limit(): number {
		return this.props.limit;
	}

	get size(): ImageSize {
		return this.props.size;
	}

	toDto(): QueryDto {
		return {
			search: this.search,
			start: this.start,
			limit: this.limit,
			size: this.size
		};
	}

	toUrl(): string {
		const baseUrl = 'x';

		if (!baseUrl) {
			throw new Error('BASE_URL is not set');
		}

		return this.encodeQuery(baseUrl, {
			search: this.search,
			start: this.start.toString(),
			limit: this.limit.toString(),
			size: this.size
		});
	}

	private encodeQuery(url: string, params: Record<string, string>): string {
		let queryUrl = url + '/search-image?';
		for (const key in params) {
			if (params.hasOwnProperty(key)) {
				queryUrl += `${key}=${encodeURIComponent(params[key])}&`;
			}
		}
		return queryUrl.slice(0, -1);
	}
}
