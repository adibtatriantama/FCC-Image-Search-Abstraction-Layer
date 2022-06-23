import { HistoryItemRepo } from 'src/repo/historyItemRepo';
import { SearchRepo } from 'src/repo/searchRepo';
import { ImageSearchService } from 'src/service/imageSearch.service';
import {
  ImageNotFoundError,
  SearchForImage,
  TooManyRequestError,
} from './searchForImage';
import { Result } from 'src/core/result';
import { Query } from 'src/model/query';
import { Search } from 'src/model/search';
import { NOT_FOUND, TOO_MANY_REQUEST } from 'src/constant';

let useCase: SearchForImage;
let mockImageSearchResultRepo: SearchRepo;
let mockHistoryItemRepo: HistoryItemRepo;
let mockImageSearchService: ImageSearchService;

afterEach(() => {
  jest.clearAllMocks();
});

describe('SearchForImage', () => {
  const dummyResult = Search.create({
    items: [
      {
        title: 'title',
        url: 'link',
        mime: 'mime',
        fileFormat: 'fileformat',
        image: {
          url: 'url',
          width: 100,
          height: 101,
          byteSize: 102,
          thumbnailHeight: 103,
          thumbnailWidth: 104,
          thumbnailUrl: 'thumbnailUrl',
        },
      },
    ],
    navigations: {
      prev: 'prev',
      next: 'next',
    },
  });
  const dummyResultDto = dummyResult.toDto();

  beforeEach(() => {
    mockImageSearchService = {
      searchImage: jest.fn().mockResolvedValue(Result.ok(dummyResult)),
    };

    mockHistoryItemRepo = {
      saveHistoryItem: jest.fn(),
      findRecentHistoryItems: jest.fn(),
    };

    mockImageSearchResultRepo = {
      findSearchCache: jest.fn().mockResolvedValue(Result.fail('not found')),
      saveSearchCache: jest.fn(),
    };

    useCase = new SearchForImage(
      mockHistoryItemRepo,
      mockImageSearchResultRepo,
      mockImageSearchService,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return dto', async () => {
    const request = Query.create({ search: 'cat' });

    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toEqual(dummyResultDto);
  });

  it('should save search history', async () => {
    const request = Query.create({ search: 'cat' });

    await useCase.execute(request);

    expect(mockHistoryItemRepo.saveHistoryItem).toBeCalled();
  });

  describe('when cache is exist', () => {
    beforeEach(() => {
      mockImageSearchService = {
        searchImage: jest.fn(),
      };

      mockHistoryItemRepo = {
        saveHistoryItem: jest.fn(),
        findRecentHistoryItems: jest.fn(),
      };

      mockImageSearchResultRepo = {
        findSearchCache: jest.fn().mockResolvedValue(Result.ok(dummyResult)),
        saveSearchCache: jest.fn(),
      };

      useCase = new SearchForImage(
        mockHistoryItemRepo,
        mockImageSearchResultRepo,
        mockImageSearchService,
      );
    });

    it('should load from cache instead using service', async () => {
      const request = Query.create({ search: 'cat' });

      const response = await useCase.execute(request);

      expect(mockImageSearchService.searchImage).not.toHaveBeenCalled();
      expect(response.isRight()).toBe(true);
    });
  });

  describe('when using ImageSearchService', () => {
    it('should save cache', async () => {
      const request = Query.create({ search: 'cat' });

      await useCase.execute(request);

      expect(mockImageSearchResultRepo.saveSearchCache).toBeCalled();
    });
  });

  describe('when searching image using ImageSearchService returning failure', () => {
    beforeEach(() => {
      mockImageSearchService = {
        searchImage: jest.fn().mockResolvedValue(Result.fail('api error')),
      };

      mockHistoryItemRepo = {
        saveHistoryItem: jest.fn(),
        findRecentHistoryItems: jest.fn(),
      };

      mockImageSearchResultRepo = {
        findSearchCache: jest.fn().mockResolvedValue(Result.fail('not found')),
        saveSearchCache: jest.fn(),
      };

      useCase = new SearchForImage(
        mockHistoryItemRepo,
        mockImageSearchResultRepo,
        mockImageSearchService,
      );
    });

    it('should return error', async () => {
      const request = Query.create({ search: 'cat' });

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
    });

    describe('when no image is found', () => {
      beforeEach(() => {
        mockImageSearchService = {
          searchImage: jest.fn().mockResolvedValue(Result.fail(NOT_FOUND)),
        };

        useCase = new SearchForImage(
          mockHistoryItemRepo,
          mockImageSearchResultRepo,
          mockImageSearchService,
        );
      });
      it('should return no image is Found', async () => {
        const request = Query.create({ search: 'cat' });

        const response = await useCase.execute(request);

        expect(response.isLeft()).toBe(true);
        expect(response.value.constructor).toBe(ImageNotFoundError);
      });
    });

    describe('when API Limit reached', () => {
      beforeEach(() => {
        mockImageSearchService = {
          searchImage: jest
            .fn()
            .mockResolvedValue(Result.fail(TOO_MANY_REQUEST)),
        };

        useCase = new SearchForImage(
          mockHistoryItemRepo,
          mockImageSearchResultRepo,
          mockImageSearchService,
        );
      });
      it('should return too many request error', async () => {
        const request = Query.create({ search: 'cat' });

        const response = await useCase.execute(request);

        expect(response.isLeft()).toBe(true);
        expect(response.value.constructor).toBe(TooManyRequestError);
      });
    });
  });
});
