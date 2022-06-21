export type QueryForImagesInputSize =
  | 'icon'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge'
  | 'xxlarge'
  | 'huge';

export const formatImageSize = (size: string): QueryForImagesInputSize => {
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
      return null;
  }
};

export type QueryForImagesInputProps = {
  search: string;
  start: number;
  limit: number;
  size: QueryForImagesInputSize;
};

export type QueryForImagesInputDto = QueryForImagesInputProps;

export class QueryForImagesInput {
  private constructor(public readonly props: QueryForImagesInputProps) {}

  static create(props: Partial<QueryForImagesInputProps>): QueryForImagesInput {
    if (!props.search) {
      throw new Error('search is required');
    }

    let limit = props.limit || 10;

    if (props.limit > 10 || props.limit < 1) {
      console.warn(`Limit is out of range, setting to 10.`);
      limit = 10;
    }

    return new QueryForImagesInput({
      limit: limit,
      search: props.search,
      start: props.start || 1,
      size: props.size || 'medium',
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

  get size(): QueryForImagesInputSize {
    return this.props.size;
  }

  toDto(): QueryForImagesInputDto {
    return {
      search: this.search,
      start: this.start,
      limit: this.limit,
      size: this.size,
    };
  }

  toUrl(): string {
    const baseUrl = process.env.BASE_URL;

    if (!baseUrl) {
      throw new Error('BASE_URL is not set');
    }

    return this.encodeQuery(baseUrl, {
      search: this.search,
      start: this.start.toString(),
      limit: this.limit.toString(),
      size: this.size,
    });
  }

  private encodeQuery(url: string, params: Record<string, string>): string {
    let queryUrl = url;
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        queryUrl += `${key}=${encodeURIComponent(params[key])}&`;
      }

      return queryUrl.slice(0, -1);
    }
  }
}
