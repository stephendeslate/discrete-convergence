const mockCookieStore = {
  get: jest.fn().mockReturnValue({ value: 'mock-token' }),
  set: jest.fn(),
  delete: jest.fn(),
};

export function cookies() {
  return Promise.resolve(mockCookieStore);
}
