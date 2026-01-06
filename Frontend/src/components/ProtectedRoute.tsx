import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMe } from '../hooks/useAuth';

type Props = { children: ReactNode };

const ProtectedRoute = ({ children }: Props) => {
  const { data: me, isLoading } = useMe();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-cream dark:bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-accent-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 dark:text-stone-400">Verifying your session...</p>
        </div>
      </div>
    );
  }

  if (!me) {
    return <Navigate to="/auth" replace state={{ redirectTo: location.pathname }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
