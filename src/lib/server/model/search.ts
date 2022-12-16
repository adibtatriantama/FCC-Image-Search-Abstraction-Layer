export type SearchItemImage = {
	url: string;
	height: number;
	width: number;
	byteSize: number;
	thumbnailUrl: string;
	thumbnailHeight: number;
	thumbnailWidth: number;
};

export type SearchItem = {
	title: string;
	url: string;
	mime: string;
	fileFormat: string;
	image: SearchItemImage;
};

export type SearchProps = {
	items: SearchItem[];
	navigations: {
		prev?: string;
		next?: string;
	};
};

export type SearchDto = SearchProps;

export class Search {
	private constructor(public readonly props: SearchProps) {}

	static create(props: Partial<SearchProps>): Search {
		if (!props.items) {
			throw new Error('Items is required');
		}

		return new Search({
			items: props.items,
			navigations: props.navigations || {}
		});
	}

	get items(): SearchItem[] {
		return this.props.items;
	}

	get navigations() {
		return this.props.navigations;
	}

	toDto(): SearchDto {
		return {
			items: this.items,
			navigations: this.navigations
		};
	}
}
