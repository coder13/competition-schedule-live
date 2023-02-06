// Basic react provider for user data. Stores user in localstorage and fetches on startup
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useState } from 'react';
import { notifApiFetch } from '../notifapi';

const UserContext = createContext<{
  user?: User;
  loading: boolean;
  submitCode?: UseMutationResult<User, { message: string }, string, unknown>;
  logout?: () => void;
}>({
  loading: true,
});

const key = ['me'];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery<{
    user: User & {
      competitionSubscriptions: Record<string, Subscription[]>;
    };
  }>({
    queryKey: key,
    queryFn: () => notifApiFetch('/v0/internal/me'),
  });

  console.log(32, data);

  const submitCode = useMutation<User, { message: string }, string, unknown>({
    mutationFn: async (code: string) => {
      const { user } = await notifApiFetch('/v0/internal/auth/number/code', {
        method: 'POST',
        body: JSON.stringify({
          code,
        }),
      });

      return user;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const logout = async () => {
    try {
      await notifApiFetch('/v0/internal/auth/logout', {
        method: 'POST',
      });

      queryClient.clear();
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <UserContext.Provider
      value={{ user: data?.user, loading, submitCode, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
