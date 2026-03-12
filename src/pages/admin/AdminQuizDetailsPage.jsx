import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import AppNavbar from '../../components/AppNavbar.jsx';
import { fetchQuizById } from '../../store/quizzesSlice.js';
import api from '../../utils/api.js';

export default function AdminQuizDetailsPage() {
  const { quizId } = useParams();
  const dispatch = useDispatch();

  const quiz = useSelector((s) => s.quizzes.selected);
  const loading = useSelector((s) => s.quizzes.loading);
  const error = useSelector((s) => s.quizzes.error);

  const questions = useMemo(() => (Array.isArray(quiz?.questions) ? quiz.questions : []), [quiz]);

  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchQuizById(quizId));
  }, [dispatch, quizId]);

  const addQuestionToQuiz = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await api.post(`/quizzes/${quizId}/question`, {
        text: text.trim(),
        options: options.map((o) => o.trim()),
        correctAnswerIndex: Number(correctAnswerIndex)
      });
      setText('');
      setOptions(['', '', '', '']);
      setCorrectAnswerIndex(0);
      await dispatch(fetchQuizById(quizId));
    } catch (err) {
      setSubmitError(err?.response?.data?.error || err?.message || 'Cannot add question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AppNavbar />
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="h3 m-0">Quiz Details</h1>
          <Link className="btn btn-outline-secondary btn-sm" to="/admin/quizzes">
            Back
          </Link>
        </div>

        {error ? <div className="alert alert-warning">{error}</div> : null}
        {loading ? <div>Loading...</div> : null}

        {!loading && quiz ? (
          <>
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="fw-semibold">{quiz.title}</div>
                <div className="text-muted">{quiz.description}</div>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="fw-semibold mb-3">Add Question to this Quiz</div>
                {submitError ? <div className="alert alert-danger">{submitError}</div> : null}

                <form onSubmit={addQuestionToQuiz}>
                  <div className="mb-2">
                    <label className="form-label">Question Text</label>
                    <input className="form-control" value={text} onChange={(e) => setText(e.target.value)} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Options</label>
                    {options.map((opt, idx) => (
                      <input
                        key={idx}
                        className="form-control mb-2"
                        value={opt}
                        onChange={(e) => {
                          const next = [...options];
                          next[idx] = e.target.value;
                          setOptions(next);
                        }}
                        required
                      />
                    ))}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correct Answer Index</label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      className="form-control"
                      value={correctAnswerIndex}
                      onChange={(e) => setCorrectAnswerIndex(e.target.value)}
                      required
                    />
                  </div>
                  <button className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Question'}
                  </button>
                </form>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <div className="fw-semibold mb-3">Questions in this Quiz</div>
                {questions.length === 0 ? (
                  <div className="text-muted">No questions yet.</div>
                ) : (
                  <div className="vstack gap-3">
                    {questions.map((q) => (
                      <div key={q._id}>
                        <div className="fw-semibold">{q.text}</div>
                        <ul className="mb-0">
                          {(q.options || []).map((o, idx) => (
                            <li key={idx}>{o}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
