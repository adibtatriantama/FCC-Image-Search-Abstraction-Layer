import { CUSTOM_SEARCH_API_KEY, SEARCH_ENGINE_ID } from '$env/static/private';
import { ERROR_NOT_FOUND, ERROR_TOO_MANY_REQUEST, ERROR_UNKNOWN } from '$lib/server/constant';
import type { ImageDto } from '$lib/dto/image.dto';
import type { QueryDto } from '$lib/dto/query.dto';
import axios from 'axios';
import type { ImageSearchService } from '../imageSearch.service';

type GoogleImageSearchResponseDto = {
	kind: string;
	url: any;
	queries: any;
	context: any;
	searchInformation: any;
	items: GoogleSearchItemDto[];
};

type GoogleSearchItemDto = {
	kind: string;
	title: string;
	htmlTitle: string;
	link: string;
	displayLink: string;
	snippet: string;
	htmlSnippet: string;
	mime: string;
	fileFormat: string;
	image: GoogleSearchImageDto;
};

type GoogleSearchImageDto = {
	contextLink: string;
	height: number;
	width: number;
	byteSize: number;
	thumbnailLink: string;
	thumbnailHeight: number;
	thumbnailWidth: number;
};

export class GoogleImageSearchService implements ImageSearchService {
	async searchImage(query: QueryDto): Promise<ImageDto[]> {
		const images = await this.tryToSearchImage(query);

		return images;
	}

	async tryToSearchImage(query: QueryDto): Promise<ImageDto[]> {
		try {
			const response = await this.createAxiosRequest(query);

			const data = response.data;

			if (!data.items) {
				throw new Error(ERROR_NOT_FOUND);
			}

			return data.items.map(this.mapGoogleSearchItemDtoToImageDto);
		} catch (err: any) {
			if (err?.response?.status == 429) {
				throw new Error(ERROR_TOO_MANY_REQUEST);
			} else if (err?.message === ERROR_NOT_FOUND) {
				throw new Error(ERROR_NOT_FOUND);
			}

			throw new Error(ERROR_UNKNOWN);
		}
	}

	createAxiosRequest(query: QueryDto) {
		return axios.get<GoogleImageSearchResponseDto>(
			'https://customsearch.googleapis.com/customsearch/v1',
			{
				params: {
					key: CUSTOM_SEARCH_API_KEY,
					cx: SEARCH_ENGINE_ID,
					q: query.term,
					searchType: 'image',
					num: query.limit,
					imgSize: query.size,
					start: query.start
				}
			}
		);
	}

	mapGoogleSearchItemDtoToImageDto(item: GoogleSearchItemDto): ImageDto {
		const image = item.image;

		return {
			title: item.title,
			url: item.link,
			mime: item.mime,
			fileFormat: item.fileFormat,
			image: {
				url: image.contextLink,
				height: image.height,
				width: image.width,
				byteSize: image.byteSize,
				thumbnailHeight: image.thumbnailHeight,
				thumbnailUrl: image.thumbnailLink,
				thumbnailWidth: image.thumbnailWidth
			}
		};
	}
}
