import { create } from 'zustand';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const getInitialState = () => {
  const token = localStorage.getItem('token');
  if (!token) return { token: null, role: null };
  const decoded = parseJwt(token);
  if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
    localStorage.removeItem('token');
    return { token: null, role: null };
  }
  return { token, role: decoded.role || null };
};

export const useAuthStore = create((set) => ({
  ...getInitialState(),
  setAuth: (token) => {
    localStorage.setItem('token', token);
    const decoded = parseJwt(token);
    set({ token, role: decoded?.role || null });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, role: null });
  },
}));
