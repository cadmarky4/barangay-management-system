// ============================================================================
// hooks/auth/use-auth.ts - TanStack Query hooks for auth
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/__shared/_auth/auth.service';
import { type LoginCredentialsRequest } from '@/services/__shared/_auth/auth.types';
import { useNavigate } from 'react-router-dom';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
};

// Get current user query
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    initialData: () => authService.getCachedUser(),
  });
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentialsRequest) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.currentUser(), data.user);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error?.message || 'Login failed';
        console.error('Login error:', message);
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      // Still clear local state even if server request fails
      queryClient.clear();
      navigate('/login');
    },
  });
}