import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AppNavbar from '../../components/AppNavbar.jsx';
import { selectAuth } from '../../store/authSlice.js';

export default function AdminHomePage() {
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();

  useEffect(() => {
    // Default admin landing
    navigate('/admin/questions', { replace: true });
  }, [navigate]);

  return (
    <>
      <AppNavbar />
      <div className="container py-5">
        <h1 className="h3">Admin Dashboard</h1>
        <div className="text-muted">Welcome, {auth.user?.username}</div>
      </div>
    </>
  );
}
