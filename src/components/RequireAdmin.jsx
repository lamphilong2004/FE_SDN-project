import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectAuth } from '../store/authSlice.js';

export default function RequireAdmin({ children }) {
  const auth = useSelector(selectAuth);
  const location = useLocation();

  if (!auth.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!auth.user && auth.loadingMe) {
    return (
      <div className="container py-5">
        <div>Loading...</div>
      </div>
    );
  }

  if (auth.user && !auth.user.admin) {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  }

  return children;
}
