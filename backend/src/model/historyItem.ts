type IsoDateString = string;

export type HistoryItemProps = {
  title: string;
  url: string;
  date: Date;
};

export type HistoryItemDto = Omit<HistoryItemProps, 'date'> & {
  date: IsoDateString;
};

export class HistoryItem {
  private constructor(public readonly props: HistoryItemProps) {}

  static create(props: HistoryItemProps): HistoryItem {
    return new HistoryItem(props);
  }

  get title(): string {
    return this.props.title;
  }

  get date(): Date {
    return this.props.date;
  }

  get url(): string {
    return this.props.url;
  }

  toDto(): HistoryItemDto {
    return {
      title: this.title,
      url: this.url,
      date: this.date.toISOString(),
    };
  }
}
