import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AppNavbar from '../../components/AppNavbar.jsx';
import { createQuiz, deleteQuiz, fetchQuizzes } from '../../store/quizzesSlice.js';

export default function AdminQuizzesPage() {
  const dispatch = useDispatch();
  const quizzes = useSelector((s) => s.quizzes.items);
  const loading = useSelector((s) => s.quizzes.loading);
  const error = useSelector((s) => s.quizzes.error);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createQuiz({ title: title.trim(), description: description.trim() }));
    setTitle('');
    setDescription('');
  };

  const remove = async (id) => {
    await dispatch(deleteQuiz(id));
  };

  return (
    <>
      <AppNavbar />
      <div className="container py-4">
        <h1 className="h3 mb-3">Manage Quizzes</h1>

        {error ? <div className="alert alert-warning">{error}</div> : null}

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="fw-semibold mb-3">Create Quiz</div>
            <form onSubmit={handleCreate}>
              <div className="mb-2">
                <label className="form-label">Title</label>
                <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <button className="btn btn-primary">Create</button>
            </form>
          </div>
        </div>

        {loading ? <div>Loading...</div> : null}

        <div className="list-group">
          {quizzes.map((q) => (
            <div className="list-group-item d-flex align-items-center justify-content-between" key={q._id}>
              <div>
                <div className="fw-semibold">{q.title}</div>
                <div className="small text-muted">{q.description}</div>
              </div>
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-primary btn-sm" to={`/admin/quizzes/${q._id}`}>
                  Details
                </Link>
                <button className="btn btn-outline-danger btn-sm" onClick={() => remove(q._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
