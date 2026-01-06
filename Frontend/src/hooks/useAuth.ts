import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, login, logout, register } from '../lib/api';
import type { User } from '../types';

export const useMe = () =>
  useQuery<User | null>({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false
  });

export const useAuthMutations = () => {
  const qc = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    }
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    }
  });

  return { loginMutation, registerMutation, logoutMutation };
};
