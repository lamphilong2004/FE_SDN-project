import { Link, useLocation, useNavigate } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';

export default function QuizCompletedPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const score = location.state?.score;
  const total = location.state?.total;

  if (typeof score !== 'number' || typeof total !== 'number') {
    return (
      <>
        <AppNavbar />
        <div className="container py-5">
          <div className="alert alert-info">No quiz result found.</div>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavbar />
      <div className="container py-5">
        <div className="text-center">
          <h1 className="h3 mb-2">Quiz Completed</h1>
          <div className="text-muted mb-4">Your score: {score} / {total}</div>

          <button className="btn btn-primary" onClick={() => navigate('/dashboard', { replace: true })}>
            Restart Quiz
          </button>
        </div>
      </div>
    </>
  );
}
