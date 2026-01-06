import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
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

// Helper to guard actions that require login. If the user is unauthenticated,
// send them to /auth and preserve the current path to come back after login.
export const useRequireAuth = () => {
  const { data: me } = useMe();
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    if (!me) {
      navigate('/auth', { state: { redirectTo: location.pathname || '/' } });
      return false;
    }
    return true;
  };
};
