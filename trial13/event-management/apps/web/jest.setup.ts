import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock Next.js server-side modules
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}));

// Mock server actions
jest.mock('@/lib/actions', () => ({
  loginAction: jest.fn(),
  registerAction: jest.fn(),
  getEvents: jest.fn().mockResolvedValue([]),
  getVenues: jest.fn().mockResolvedValue([]),
  getAttendees: jest.fn().mockResolvedValue([]),
  getRegistrations: jest.fn().mockResolvedValue([]),
  logoutAction: jest.fn(),
  getAppVersion: jest.fn().mockResolvedValue('1.0.0'),
}));
