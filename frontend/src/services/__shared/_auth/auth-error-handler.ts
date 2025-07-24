/**
 * Authentication error handler utility
 * Provides a way for API services to trigger logout when authentication fails
 */

let logoutHandler: (() => void) | null = null;

export const setAuthErrorHandler = (handler: () => void) => {
  logoutHandler = handler;
};

export const triggerLogout = () => {
  if (logoutHandler) {
    console.log('Authentication error detected, triggering logout...');
    logoutHandler();
  } else {
    console.warn('No logout handler registered, forcing page reload to login');
    window.location.href = '/login';
  }
};

export const clearAuthErrorHandler = () => {
  logoutHandler = null;
};

