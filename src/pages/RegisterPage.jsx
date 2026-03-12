import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AppNavbar from '../components/AppNavbar.jsx';
import { fetchMe, register as registerThunk, selectAuth } from '../store/authSlice.js';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [admin, setAdmin] = useState(false);

  const auth = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.token && auth.user) {
      navigate(auth.user.admin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [auth.token, auth.user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerThunk({ username, password, admin }));
    if (registerThunk.fulfilled.match(result)) {
      const me = await dispatch(fetchMe());
      if (fetchMe.fulfilled.match(me)) {
        navigate(me.payload?.admin ? '/admin' : '/dashboard', { replace: true });
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
                <h1 className="h4 text-center mb-4">Register</h1>

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
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="admin"
                      checked={admin}
                      onChange={(e) => setAdmin(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="admin">
                      Register as admin
                    </label>
                  </div>

                  <button className="btn btn-primary w-100" disabled={auth.loading}>
                    {auth.loading ? 'Registering...' : 'Register'}
                  </button>
                </form>

                <div className="text-center mt-3 small">
                  Already have an account? <Link to="/login">Login here</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
