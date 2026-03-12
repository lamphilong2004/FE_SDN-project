import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AppNavbar from '../components/AppNavbar.jsx';
import { fetchQuizzes } from '../store/quizzesSlice.js';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const quizzes = useSelector((s) => s.quizzes.items);
  const loading = useSelector((s) => s.quizzes.loading);
  const error = useSelector((s) => s.quizzes.error);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  return (
    <>
      <AppNavbar />
      <div className="container py-5">
        <h1 className="h3 mb-4">Dashboard</h1>

        <div className="mb-4">Click and do Quiz</div>

        {error ? <div className="alert alert-warning">{error}</div> : null}

        {loading ? <div>Loading...</div> : null}

        <div className="row g-3">
          {quizzes.map((q) => (
            <div className="col-12 col-md-6 col-lg-4" key={q._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="fw-semibold">{q.title}</div>
                  <div className="text-muted small mb-3">{q.description}</div>
                  <Link className="btn btn-primary btn-sm" to={`/quiz/${q._id}`}>
                    Start Quiz
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
