import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMe } from '../hooks/useAuth';

type Props = { children: ReactNode };

const ProtectedRoute = ({ children }: Props) => {
  const { data: me, isLoading } = useMe();
  const location = useLocation();

  if (isLoading) {
    return <div className="mt-6 text-sm text-slate-500">Checking your session…</div>;
  }

  if (!me) {
    return <Navigate to="/auth" replace state={{ redirectTo: location.pathname }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
