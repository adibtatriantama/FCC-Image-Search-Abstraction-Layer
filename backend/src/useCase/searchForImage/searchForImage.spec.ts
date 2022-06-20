import { HistoryItemRepo } from 'src/repo/historyItemRepo';
import { ImageSearchResultRepo } from 'src/repo/imageSearchResultRepo';
import { ImageSearchService } from 'src/service/imageSearch.service';
import { SearchForImage } from './searchForImage';
import { Result } from 'src/core/result';
import { QueryForImagesInput } from 'src/model/queryForImagesInput';
import { QueryForImagesResult } from 'src/model/queryForImagesResult';
import { UnexpectedError } from 'src/core/useCaseError';

let useCase: SearchForImage;
let mockImageSearchResultRepo: ImageSearchResultRepo;
let mockHistoryItemRepo: HistoryItemRepo;
let mockImageSearchService: ImageSearchService;

afterEach(() => {
  jest.clearAllMocks();
});

describe('SearchForImage', () => {
  const dummyResult = QueryForImagesResult.create({
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
      findImageSearchResultCache: jest
        .fn()
        .mockResolvedValue(Result.fail('not found')),
      saveImageSearchResultCache: jest.fn(),
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
    const request = QueryForImagesInput.create({ search: 'cat' });

    const response = await useCase.execute(request);

    expect(response.isRight()).toBe(true);
    expect(response.value).toEqual(dummyResultDto);
  });

  it('should save search history', async () => {
    const request = QueryForImagesInput.create({ search: 'cat' });

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
        findImageSearchResultCache: jest
          .fn()
          .mockResolvedValue(Result.ok(dummyResult)),
        saveImageSearchResultCache: jest.fn(),
      };

      useCase = new SearchForImage(
        mockHistoryItemRepo,
        mockImageSearchResultRepo,
        mockImageSearchService,
      );
    });

    it('should load from cache instead using service', async () => {
      const request = QueryForImagesInput.create({ search: 'cat' });

      const response = await useCase.execute(request);

      expect(mockImageSearchService.searchImage).not.toHaveBeenCalled();
      expect(response.isRight()).toBe(true);
    });
  });

  describe('when using ImageSearchService', () => {
    it('should save cache', async () => {
      const request = QueryForImagesInput.create({ search: 'cat' });

      await useCase.execute(request);

      expect(mockImageSearchResultRepo.saveImageSearchResultCache).toBeCalled();
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
        findImageSearchResultCache: jest
          .fn()
          .mockResolvedValue(Result.fail('not found')),
        saveImageSearchResultCache: jest.fn(),
      };

      useCase = new SearchForImage(
        mockHistoryItemRepo,
        mockImageSearchResultRepo,
        mockImageSearchService,
      );
    });

    it('should return unexpected error', async () => {
      const request = QueryForImagesInput.create({ search: 'cat' });

      const response = await useCase.execute(request);

      expect(response.isLeft()).toBe(true);
      expect(response.value.constructor).toBe(UnexpectedError);
    });
  });
});
