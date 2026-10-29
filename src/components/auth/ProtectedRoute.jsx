import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

// Wrap any routes that should only be visible to a logged-in user.
// If not logged in, redirects to /login and remembers where the user
// was trying to go (so we can send them back after a successful login).
const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
