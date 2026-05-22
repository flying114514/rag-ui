import { getStoredToken } from '../authStorage';

export function useAuth() {
  const token = getStoredToken();
  return { isLoggedIn: !!token };
}
