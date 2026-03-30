import { getSkipTake } from './pagination.utils';

describe('getSkipTake', () => {
  it('should return default values when no params', () => {
    const result = getSkipTake();
    expect(result.skip).toBe(0);
    expect(result.take).toBe(20);
  });

  it('should calculate skip correctly for page 2', () => {
    const result = getSkipTake(2, 10);
    expect(result.skip).toBe(10);
    expect(result.take).toBe(10);
  });

  it('should clamp limit to MAX_PAGE_SIZE', () => {
    const result = getSkipTake(1, 200);
    expect(result.take).toBe(100);
    expect(result.skip).toBe(0);
  });

  it('should clamp page minimum to 1', () => {
    const result = getSkipTake(0, 10);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
  });
});
