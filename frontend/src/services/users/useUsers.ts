// ============================================================================
// hooks/users/use-users.ts - TanStack Query hooks for users
// ============================================================================

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  useInfiniteQuery 
} from '@tanstack/react-query';

import { useNotifications } from '@/components/_global/NotificationSystem';
import type { 
  User, 
  UserParams, 
  CreateUserFormData, 
  UpdateUserFormData,
  ChangePasswordData,
  UserPermissions,
  UserRole,
  Department
} from './users.types';
import { usersService } from '@/services/users/users.service';
import { useTranslation } from 'react-i18next';

// Query keys
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params: UserParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  current: () => [...usersKeys.all, 'current'] as const,
  statistics: () => [...usersKeys.all, 'statistics'] as const,
  search: (term: string) => [...usersKeys.all, 'search', term] as const,
  availability: () => [...usersKeys.all, 'availability'] as const,
  usernameCheck: (username: string, excludeId?: number) => 
    [...usersKeys.availability(), 'username', username, excludeId] as const,
  emailCheck: (email: string, excludeId?: number) => 
    [...usersKeys.availability(), 'email', email, excludeId] as const,
  byRole: (role: UserRole) => [...usersKeys.all, 'by-role', role] as const,
  byDepartment: (department: Department) => [...usersKeys.all, 'by-department', department] as const,
  activity: (id: string) => [...usersKeys.all, 'activity', id] as const,
  sessions: (id: string) => [...usersKeys.all, 'sessions', id] as const,
  permissions: (id: string) => [...usersKeys.all, 'permissions', id] as const,
};

// Queries
export function useUsers(params: UserParams = {}) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersService.getUser(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: usersKeys.current(),
    queryFn: () => usersService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Don't retry too much for auth errors
  });
}

export function useUserStatistics() {
  return useQuery({
    queryKey: usersKeys.statistics(),
    queryFn: () => usersService.getUserStatistics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useUserSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: usersKeys.search(searchTerm),
    queryFn: () => usersService.searchUsers(searchTerm),
    enabled: enabled && searchTerm.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUsernameAvailability(username: string, excludeUserId?: number, enabled = true) {
  return useQuery({
    queryKey: usersKeys.usernameCheck(username, excludeUserId),
    queryFn: () => usersService.checkUsernameAvailability(username, excludeUserId),
    enabled: enabled && username.trim().length >= 3,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useEmailAvailability(email: string, excludeUserId?: number, enabled = true) {
  return useQuery({
    queryKey: usersKeys.emailCheck(email, excludeUserId),
    queryFn: () => usersService.checkEmailAvailability(email, excludeUserId),
    enabled: enabled && email.includes('@'),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUsersByRole(role: UserRole) {
  return useQuery({
    queryKey: usersKeys.byRole(role),
    queryFn: () => usersService.getUsersByRole(role),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUsersByDepartment(department: Department) {
  return useQuery({
    queryKey: usersKeys.byDepartment(department),
    queryFn: () => usersService.getUsersByDepartment(department),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserActivity(id: string, enabled = true) {
  return useQuery({
    queryKey: usersKeys.activity(id),
    queryFn: () => usersService.getUserActivity(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUserSessions(id: string, enabled = true) {
  return useQuery({
    queryKey: usersKeys.sessions(id),
    queryFn: () => usersService.getUserSessions(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useUserPermissions(id: string, enabled = true) {
  return useQuery({
    queryKey: usersKeys.permissions(id),
    queryFn: () => usersService.getUserPermissions(id),
    enabled: enabled && !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Mutations
export function useCreateUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: (data: CreateUserFormData) => usersService.createUser(data),
    onSuccess: (newUser: User) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });
      queryClient.setQueryData(
        usersKeys.detail(newUser.id),
        newUser
      );

      showNotification({
        type: 'success',
        title: t('users.form.messages.createSuccess'),
        message: t('users.form.messages.createSuccess'),
      });
    },
    onError: (error) => {
      console.error('Create User Error:', error);
      showNotification({
        type: 'error',
        title: t('users.form.messages.createError'),
        message: t('users.form.messages.createError'),
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserFormData }) =>
      usersService.updateUser(id, data),
    onSuccess: (updatedUser: User) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });
      queryClient.setQueryData(
        usersKeys.detail(updatedUser.id),
        updatedUser
      );

      showNotification({
        type: 'success',
        title: t('users.form.messages.updateSuccess'),
        message: t('users.form.messages.updateSuccess'),
      });
    },
    onError: (error) => {
      console.error('Update User Error:', error);
      showNotification({
        type: 'error',
        title: t('users.form.messages.updateError'),
        message: t('users.form.messages.updateError'),
      });
    },
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: (data: Partial<UpdateUserFormData>) => usersService.updateCurrentUser(data),
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(usersKeys.current(), updatedUser);
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(updatedUser.id) });

      showNotification({
        type: 'success',
        title: t('users.form.messages.updateSuccess'),
        message: t('users.form.messages.updateSuccess'),
      });
    },
    onError: (error) => {
      console.error('Update Current User Error:', error);
      showNotification({
        type: 'error',
        title: t('users.form.messages.updateError'),
        message: t('users.form.messages.updateError'),
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });
      queryClient.removeQueries({ queryKey: usersKeys.detail(deletedId) });

      showNotification({
        type: 'success',
        title: t('users.form.messages.deleteSuccess'),
        message: t('users.form.messages.deleteSuccess'),
      });
    },
    onError: (error) => {
      console.error('Delete User Error:', error);
      showNotification({
        type: 'error',
        title: t('users.form.messages.deleteError'),
        message: t('users.form.messages.deleteError'),
      });
    },
  });
}

export function useChangePassword() {
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordData }) =>
      usersService.changePassword(id, data),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: t('users.form.messages.passwordChangeSuccess'),
        message: t('users.form.messages.passwordChangeSuccess'),
      });
    },
    onError: (error) => {
      console.error('Change Password Error:', error);
      showNotification({
        type: 'error',
        title: t('users.form.messages.passwordChangeError'),
        message: t('users.form.messages.passwordChangeError'),
      });
    },
  });
}

export function useChangeCurrentUserPassword() {
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: (data: ChangePasswordData) => usersService.changeCurrentUserPassword(data),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: t('users.form.messages.passwordChangeSuccess'),
        message: t('users.form.messages.passwordChangeSuccess'),
      });
    },
    onError: (error) => {
      console.error('Change Current User Password Error:', error);
      showNotification({
        type: 'error',
        title: t('users.form.messages.passwordChangeError'),
        message: t('users.form.messages.passwordChangeError'),
      });
    },
  });
}

export function useResetUserPassword() {
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ id, sendEmail }: { id: string; sendEmail?: boolean }) =>
      usersService.resetUserPassword(id, sendEmail),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: t('users.form.actions.resetPassword'),
        message: t('users.form.messages.passwordChangeSuccess'),
      });
    },
    onError: (error) => {
      console.error('Reset Password Error:', error);
      showNotification({
        type: 'error',
        title: t('users.form.messages.passwordChangeError'),
        message: t('users.form.messages.passwordChangeError'),
      });
    },
  });
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ id, status, reason }: { 
      id: string; 
      status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; 
      reason?: string 
    }) => usersService.changeUserStatus(id, status, reason),
    onSuccess: (updatedUser: User, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });
      queryClient.setQueryData(
        usersKeys.detail(updatedUser.id),
        updatedUser
      );

      const statusMessage = variables.status === 'ACTIVE' 
        ? t('users.form.messages.activateSuccess')
        : t('users.form.messages.deactivateSuccess');

      showNotification({
        type: 'success',
        title: statusMessage,
        message: statusMessage,
      });
    },
    onError: (error) => {
      console.error('Change User Status Error:', error);
      showNotification({
        type: 'error',
        title: t('users.form.messages.updateError'),
        message: t('users.form.messages.updateError'),
      });
    },
  });
}

export function useSendUserCredentials() {
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ id, includePassword }: { id: string; includePassword?: boolean }) =>
      usersService.sendUserCredentials(id, includePassword),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: t('users.form.messages.credentialsSent'),
        message: t('users.form.messages.credentialsSent'),
      });
    },
    onError: (error) => {
      console.error('Send Credentials Error:', error);
      showNotification({
        type: 'error',
        title: t('users.form.messages.updateError'),
        message: t('users.form.messages.updateError'),
      });
    },
  });
}

export function useTerminateUserSession() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ userId, sessionId }: { userId: string; sessionId: string }) =>
      usersService.terminateUserSession(userId, sessionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.sessions(variables.userId) });
      
      showNotification({
        type: 'success',
        title: 'Session Terminated',
        message: 'User session has been terminated successfully',
      });
    },
    onError: (error) => {
      console.error('Terminate Session Error:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to terminate user session',
      });
    },
  });
}

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: UserPermissions }) =>
      usersService.updateUserPermissions(id, permissions),
    onSuccess: (updatedPermissions: UserPermissions, variables) => {
      queryClient.setQueryData(
        usersKeys.permissions(variables.id),
        updatedPermissions
      );

      showNotification({
        type: 'success',
        title: 'Permissions Updated',
        message: 'User permissions have been updated successfully',
      });
    },
    onError: (error) => {
      console.error('Update Permissions Error:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user permissions',
      });
    },
  });
}

export function useBulkUserAction() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: usersService.bulkUserAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });

      showNotification({
        type: 'success',
        title: 'Bulk Action Completed',
        message: 'The bulk action has been completed successfully',
      });
    },
    onError: (error) => {
      console.error('Bulk Action Error:', error);
      showNotification({
        type: 'error',
        title: 'Bulk Action Failed',
        message: 'Failed to complete the bulk action',
      });
    },
  });
}

export function useImportUsers() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ file, options }: { 
      file: File; 
      options?: {
        update_existing?: boolean;
        send_credentials?: boolean;
        default_password?: string;
      }
    }) => usersService.importUsers(file, options),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });

      showNotification({
        type: 'success',
        title: 'Import Completed',
        message: `Successfully imported ${result.success_count} users. ${result.error_count} errors.`,
      });
    },
    onError: (error) => {
      console.error('Import Users Error:', error);
      showNotification({
        type: 'error',
        title: 'Import Failed',
        message: 'Failed to import users from file',
      });
    },
  });
}

// Infinite query for large datasets
export function useInfiniteUsers(params: Omit<UserParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      usersService.getUsers({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}