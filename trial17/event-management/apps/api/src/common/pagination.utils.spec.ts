jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  clampPagination: jest.fn().mockImplementation((page: number, pageSize: number) => ({
    page: Math.max(1, page),
    pageSize: Math.min(Math.max(1, pageSize), 100),
  })),
}));

import { getPaginationParams } from './pagination.utils';
import { clampPagination } from '@event-management/shared';

describe('getPaginationParams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return default pagination when no params given', () => {
    const result = getPaginationParams();

    expect(result).toEqual({ skip: 0, take: 10, page: 1, pageSize: 10 });
    expect(clampPagination).toHaveBeenCalledWith(1, 10);
  });

  it('should calculate skip for page 2', () => {
    (clampPagination as jest.Mock).mockReturnValue({ page: 2, pageSize: 10 });

    const result = getPaginationParams(2, 10);

    expect(result).toEqual({ skip: 10, take: 10, page: 2, pageSize: 10 });
    expect(clampPagination).toHaveBeenCalledWith(2, 10);
  });
});
