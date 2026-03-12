import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectAuth } from '../store/authSlice.js';

export default function AppNavbar() {
  const auth = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const isAdmin = Boolean(auth.user?.admin);
  const username = auth.user?.username;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container">
        <Link className="navbar-brand fw-bold" to={isAdmin ? '/admin' : '/dashboard'}>
          FPT University
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar"
          aria-controls="navbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {!isAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/dashboard">
                  Home
                </NavLink>
              </li>
            )}

            {isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/questions">
                    Manage Questions
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/quizzes">
                    Manage Quizzes
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {username ? <div className="small text-muted">Welcome, {username}</div> : null}
            {auth.token ? (
              <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <NavLink className="btn btn-primary btn-sm" to="/login">
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
