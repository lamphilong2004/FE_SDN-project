import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AppNavbar from '../components/AppNavbar.jsx';
import { selectAuth } from '../store/authSlice.js';
import { createQuestion, deleteQuestion, fetchQuestions, updateQuestion } from '../store/questionsSlice.js';
import { fetchQuizzes } from '../store/quizzesSlice.js';

function normalizeOptions(options) {
  const arr = Array.isArray(options) ? options : [];
  return arr.map((v) => (typeof v === 'string' ? v : '')).slice(0, 4);
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);

  const quizzes = useSelector((s) => s.quizzes.items);
  const loading = useSelector((s) => s.quizzes.loading);
  const error = useSelector((s) => s.quizzes.error);

  const questions = useSelector((s) => s.questions.items);
  const questionsLoading = useSelector((s) => s.questions.loading);
  const questionsError = useSelector((s) => s.questions.error);

  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);

  const [editingId, setEditingId] = useState(null);
  const editing = useMemo(() => questions.find((q) => q._id === editingId) || null, [questions, editingId]);
  const [editText, setEditText] = useState('');
  const [editOptions, setEditOptions] = useState(['', '', '', '']);
  const [editCorrect, setEditCorrect] = useState(0);

  const myUserId = auth.user?._id ? String(auth.user._id) : null;
  const questionsWithDeleteFlag = useMemo(() => {
    return (questions || []).map((q) => {
      const authorId = q?.author ? String(q.author) : null;
      return {
        ...q,
        canDelete: Boolean(myUserId && authorId && authorId === myUserId)
      };
    });
  }, [questions, myUserId]);

  useEffect(() => {
    dispatch(fetchQuizzes());
    dispatch(fetchQuestions());
  }, [dispatch]);

  useEffect(() => {
    if (!editing) return;
    setEditText(editing.text || '');
    setEditOptions(normalizeOptions(editing.options).concat(['', '', '', '']).slice(0, 4));
    setEditCorrect(Number(editing.correctAnswerIndex || 0));
  }, [editing]);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    const trimmedText = text.trim();
    const trimmedOptions = options.map((o) => o.trim());
    if (!trimmedText) return;
    if (trimmedOptions.some((o) => !o)) return;

    const result = await dispatch(createQuestion({
      text: trimmedText,
      options: trimmedOptions,
      correctAnswerIndex: Number(correctAnswerIndex)
    }));

    if (!result.error) {
      setText('');
      setOptions(['', '', '', '']);
      setCorrectAnswerIndex(0);
    }
  };

  const removeQuestion = async (id) => {
    await dispatch(deleteQuestion(id));
  };

  const startEdit = (id) => {
    setEditingId(id);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const trimmedText = editText.trim();
    const trimmedOptions = editOptions.map((o) => o.trim());
    if (!trimmedText) return;
    if (trimmedOptions.some((o) => !o)) return;

    const result = await dispatch(updateQuestion({
      id: editingId,
      text: trimmedText,
      options: trimmedOptions,
      correctAnswerIndex: Number(editCorrect)
    }));

    if (!result.error) {
      setEditingId(null);
    }
  };

  return (
    <>
      <AppNavbar />
      <div className="container py-5">
        <h1 className="h3 mb-4">Dashboard</h1>

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

        <hr className="my-5" />

        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="fw-semibold mb-3">Create Question</div>

                {questionsError ? <div className="alert alert-warning">{questionsError}</div> : null}

                <form onSubmit={handleCreateQuestion}>
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

                  <button className="btn btn-primary w-100">Add Question</button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-semibold">Questions</div>
              {questionsLoading ? <div className="small text-muted">Loading...</div> : null}
            </div>

            <div className="vstack gap-3">
              {questionsWithDeleteFlag.map((q) => (
                <div className="card shadow-sm" key={q._id}>
                  <div className="card-body">
                    <div className="fw-semibold mb-2">{q.text}</div>
                    <ul className="mb-3">
                      {normalizeOptions(q.options).map((o, idx) => (
                        <li key={idx}>{o}</li>
                      ))}
                    </ul>

                    {editingId === q._id ? (
                      <div className="border-top pt-3">
                        <div className="mb-2">
                          <label className="form-label">Edit Text</label>
                          <input className="form-control" value={editText} onChange={(e) => setEditText(e.target.value)} />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Edit Options</label>
                          {editOptions.map((opt, idx) => (
                            <input
                              key={idx}
                              className="form-control mb-2"
                              value={opt}
                              onChange={(e) => {
                                const next = [...editOptions];
                                next[idx] = e.target.value;
                                setEditOptions(next);
                              }}
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
                            value={editCorrect}
                            onChange={(e) => setEditCorrect(e.target.value)}
                          />
                        </div>

                        <div className="d-flex gap-2">
                          <button className="btn btn-warning btn-sm" type="button" onClick={saveEdit}>
                            Save
                          </button>
                          <button className="btn btn-secondary btn-sm" type="button" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : q.canDelete ? (
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-warning btn-sm" type="button" onClick={() => startEdit(q._id)}>
                          Edit
                        </button>
                        <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => removeQuestion(q._id)}>
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="small text-muted">Only the creator can edit/delete this question.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
