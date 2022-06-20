import { Result } from 'src/core/result';
import { HistoryItem } from 'src/model/historyItem';
import { HistoryItemRepo } from 'src/repo/historyItemRepo';
import { FindRecentHistory } from './findRecentHistory';

const dummyHistoryItems = [
  HistoryItem.create({
    title: 'dummy Title',
    url: 'https://link.me',
    date: new Date(),
  }),
];
const dummyHistoryItemDtos = dummyHistoryItems.map((item) => item.toDto());

let useCase: FindRecentHistory;
let mockHistoryItemRepo: HistoryItemRepo;

afterEach(() => {
  jest.clearAllMocks();
});

describe('FindRecentHistory', () => {
  beforeEach(() => {
    mockHistoryItemRepo = {
      findRecentHistoryItems: jest
        .fn()
        .mockResolvedValue(Result.ok(dummyHistoryItems)),
      saveHistoryItem: jest.fn(),
    };

    useCase = new FindRecentHistory(mockHistoryItemRepo);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return dtos', async () => {
    const response = await useCase.execute();

    expect(response.isRight()).toBe(true);
    expect(response.value).toEqual(dummyHistoryItemDtos);
  });

  describe('when repo returning failure', () => {
    beforeEach(() => {
      mockHistoryItemRepo = {
        findRecentHistoryItems: jest
          .fn()
          .mockResolvedValue(Result.fail('fail')),
        saveHistoryItem: jest.fn(),
      };

      useCase = new FindRecentHistory(mockHistoryItemRepo);
    });

    it('should return error', async () => {
      const response = await useCase.execute();

      expect(response.isLeft()).toBe(true);
    });
  });
});
