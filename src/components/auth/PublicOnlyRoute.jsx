import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

// Wraps the /login route. If the user is already logged in and somehow
// navigates to /login, this sends them straight to the dashboard
// instead of showing the login form again.
const PublicOnlyRoute = () => {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
