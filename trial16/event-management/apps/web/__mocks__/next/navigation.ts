export function redirect(_url: string): never {
  throw new Error('NEXT_REDIRECT');
}

export function useRouter() {
  return {
    push: () => undefined,
    replace: () => undefined,
    back: () => undefined,
  };
}

export function usePathname() {
  return '/';
}
