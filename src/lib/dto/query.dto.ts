export type ImageSize = 'icon' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'huge';

export type QueryDto = {
	term: string;
	start: number;
	limit: number;
	size: ImageSize;
};
