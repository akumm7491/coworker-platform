const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

interface StoredUser {
  id: string;
  email: string;
  name: string;
}

export const saveTokens = (tokens: StoredTokens) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const getTokens = (): StoredTokens | null => {
  const tokens = localStorage.getItem(TOKEN_KEY);
  return tokens ? JSON.parse(tokens) : null;
};

export const saveUser = (user: StoredUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): StoredUser | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
