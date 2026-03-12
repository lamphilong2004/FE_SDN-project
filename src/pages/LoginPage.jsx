import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AppNavbar from '../components/AppNavbar.jsx';
import { fetchMe, login, selectAuth } from '../store/authSlice.js';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const auth = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (auth.token && auth.user) {
      navigate(auth.user.admin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [auth.token, auth.user, navigate]);

  const from = location.state?.from;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ username, password }));
    if (login.fulfilled.match(result)) {
      const me = await dispatch(fetchMe());
      if (fetchMe.fulfilled.match(me)) {
        const isAdmin = Boolean(me.payload?.admin);
        if (typeof from === 'string' && from.startsWith('/')) {
          navigate(from, { replace: true });
        } else {
          navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
        }
      }
    }
  };

  return (
    <>
      <AppNavbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h1 className="h4 text-center mb-4">Login</h1>

                {auth.error ? <div className="alert alert-danger">{auth.error}</div> : null}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <button className="btn btn-primary w-100" disabled={auth.loading}>
                    {auth.loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="text-center mt-3 small">
                  Don&apos;t have an account? <Link to="/register">Register here</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
