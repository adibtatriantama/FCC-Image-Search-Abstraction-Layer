export type QueryForImagesResultImage = {
  url: string;
  height: number;
  width: number;
  byteSize: number;
  thumbnailUrl: string;
  thumbnailHeight: number;
  thumbnailWidth: number;
};

export type QueryForImagesResultItem = {
  title: string;
  url: string;
  mime: string;
  fileFormat: string;
  image: QueryForImagesResultImage;
};

export type QueryForImagesResultProps = {
  items: QueryForImagesResultItem[];
  navigations: {
    prev?: string;
    next?: string;
  };
};

export type QueryForImagesResultDto = QueryForImagesResultProps;

export class QueryForImagesResult {
  private constructor(public readonly props: QueryForImagesResultProps) {}

  static create(
    props: Partial<QueryForImagesResultProps>,
  ): QueryForImagesResult {
    if (!props.items) {
      throw new Error('Items is required');
    }

    return new QueryForImagesResult({
      items: props.items,
      navigations: props.navigations || {},
    });
  }

  get items(): QueryForImagesResultItem[] {
    return this.props.items;
  }

  get navigations() {
    return this.props.navigations;
  }

  toDto(): QueryForImagesResultDto {
    return {
      items: this.items,
      navigations: this.navigations,
    };
  }
}
