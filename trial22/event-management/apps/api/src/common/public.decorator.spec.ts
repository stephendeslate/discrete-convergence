import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('Public Decorator', () => {
  it('should export IS_PUBLIC_KEY constant', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
    expect(typeof IS_PUBLIC_KEY).toBe('string');
  });

  it('should export Public as a function', () => {
    expect(Public).toBeDefined();
    expect(typeof Public).toBe('function');
  });
});
