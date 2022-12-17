export type ImageDto = {
	title: string;
	url: string;
	mime: string;
	fileFormat: string;
	image: {
		url: string;
		height: number;
		width: number;
		byteSize: number;
		thumbnailUrl: string;
		thumbnailHeight: number;
		thumbnailWidth: number;
	};
};
