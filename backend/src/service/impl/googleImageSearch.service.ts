import axios from 'axios';
import { NOT_FOUND, TOO_MANY_REQUEST } from 'src/constant';
import { Result } from 'src/core/result';
import { Query } from 'src/model/query';
import { Search } from 'src/model/search';
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
  async searchImage(query: Query): Promise<Result<Search>> {
    let response;
    let data;
    try {
      response = await axios.get<GoogleImageSearchResponseDto>(
        'https://customsearch.googleapis.com/customsearch/v1',
        {
          params: {
            key: process.env.CUSTOM_SEARCH_API_KEY,
            cx: process.env.SEARCH_ENGINE_ID,
            q: query.search,
            searchType: 'image',
            num: query.limit,
            imgSize: query.size,
            start: query.start,
          },
        },
      );

      data = response.data;

      if (!data.items) {
        throw new Error(NOT_FOUND);
      }
    } catch (err: any) {
      if (err?.response?.status == 429) {
        return Result.fail(TOO_MANY_REQUEST);
      } else if (err?.message === NOT_FOUND) {
        return Result.fail(NOT_FOUND);
      }

      console.error(err);
      return Result.fail('api error');
    }

    const imageResult = Search.create({
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
      navigations: this.generateNavigation(query),
    });

    return Result.ok(imageResult);
  }

  private generateNavigation(request: Query): {
    prev?: string;
    next?: string;
  } {
    let prev: string;

    if (request.start - request.limit > 0) {
      prev = Query.create({
        search: request.search,
        size: request.size,
        limit: request.limit,
        start: request.start - request.limit,
      }).toUrl();
    }

    const next = Query.create({
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
