const ACCESS_KEY = 'algoviz_access';
const REFRESH_KEY = 'algoviz_refresh';

export const tokenStorage = {
  getAccess: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefresh: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  setTokens: (access: string, refresh: string): void => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: (): void => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
