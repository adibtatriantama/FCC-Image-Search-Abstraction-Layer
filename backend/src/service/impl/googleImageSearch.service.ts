import axios from 'axios';
import { Result } from 'src/core/result';
import { QueryForImagesInput } from 'src/model/queryForImagesInput';
import { QueryForImagesResult } from 'src/model/queryForImagesResult';
import { ImageSearchService } from '../imageSearch.service';

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
  async searchImage(
    request: QueryForImagesInput,
  ): Promise<Result<QueryForImagesResult>> {
    try {
      const response = await axios.get<GoogleImageSearchResponseDto>(
        'https://customsearch.googleapis.com/customsearch/v1',
        {
          params: {
            key: process.env.CUSTOM_SEARCH_API_KEY,
            cx: process.env.SEARCH_ENGINE_ID,
            q: request.search,
            searchType: 'image',
            num: request.limit,
            imgSize: request.size,
            start: request.start,
          },
        },
      );

      const data = response.data;

      const imageResult = QueryForImagesResult.create({
        items: data.items.map((item) => {
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
              thumbnailWidth: image.thumbnailWidth,
            },
          };
        }),
        navigations: this.generateNavigation(request),
      });

      return Result.ok(imageResult);
    } catch (err) {
      console.error(err);

      return Result.fail('Google image search error');
    }
  }

  private generateNavigation(request: QueryForImagesInput): {
    prev?: string;
    next?: string;
  } {
    let prev: string;

    if (request.start - request.limit > 0) {
      prev = QueryForImagesInput.create({
        search: request.search,
        size: request.size,
        limit: request.limit,
        start: request.start - request.limit,
      }).toUrl();
    }

    const next = QueryForImagesInput.create({
      search: request.search,
      size: request.size,
      limit: request.limit,
      start: request.start + request.limit,
    }).toUrl();

    return { prev, next };
  }
}

// url: string;
// height: number;
// width: number;
// byteSize: number;
// thumbnailUrl: string;
// thumbnailHeight: number;
// thumbnailWidth: number;
// };

// export type QueryForImagesResultItem = {
// title: string;
// url: string;
// mime: string;
// fileFormat: string;
// image: QueryForImagesResultImage;
