// Mock implementation for next/navigation in Storybook
// This allows dynamic search params based on Storybook parameters

let currentSearchParams = new URLSearchParams();

export function setSearchParams(params: URLSearchParams) {
  currentSearchParams = params;
}

export const mockRouter = {
  push: () => {
    // Router push action - no-op in Storybook
  },
  replace: () => {
    // Router replace action - no-op in Storybook
  },
  prefetch: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
};

export function useRouter() {
  return mockRouter;
}

export function useSearchParams() {
  return currentSearchParams;
}

export function usePathname() {
  return '/expenses';
}
