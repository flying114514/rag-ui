import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getStoredToken } from '../../authStorage';

export default function RequireAuth() {
  const location = useLocation();
  if (!getStoredToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
