import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AppNavbar from '../../components/AppNavbar.jsx';
import { createQuestion, deleteQuestion, fetchQuestions, updateQuestion } from '../../store/questionsSlice.js';

function normalizeOptions(options) {
  const arr = Array.isArray(options) ? options : [];
  return arr.map((v) => (typeof v === 'string' ? v : '')).slice(0, 4);
}

export default function AdminQuestionsPage() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.questions.items);
  const loading = useSelector((s) => s.questions.loading);
  const error = useSelector((s) => s.questions.error);

  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);

  const [editingId, setEditingId] = useState(null);
  const editing = useMemo(() => items.find((q) => q._id === editingId) || null, [items, editingId]);
  const [editText, setEditText] = useState('');
  const [editOptions, setEditOptions] = useState(['', '', '', '']);
  const [editCorrect, setEditCorrect] = useState(0);

  useEffect(() => {
    dispatch(fetchQuestions());
  }, [dispatch]);

  useEffect(() => {
    if (!editing) return;
    setEditText(editing.text || '');
    setEditOptions(normalizeOptions(editing.options).concat(['', '', '', '']).slice(0, 4));
    setEditCorrect(Number(editing.correctAnswerIndex || 0));
  }, [editing]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (!text.trim() || opts.length < 2) return;

    await dispatch(createQuestion({
      text: text.trim(),
      options: options.map((o) => o.trim()),
      correctAnswerIndex: Number(correctAnswerIndex)
    }));

    setText('');
    setOptions(['', '', '', '']);
    setCorrectAnswerIndex(0);
  };

  const startEdit = (id) => {
    setEditingId(id);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await dispatch(updateQuestion({
      id: editingId,
      text: editText.trim(),
      options: editOptions.map((o) => o.trim()),
      correctAnswerIndex: Number(editCorrect)
    }));
    setEditingId(null);
  };

  const remove = async (id) => {
    await dispatch(deleteQuestion(id));
  };

  return (
    <>
      <AppNavbar />
      <div className="container py-4">
        <h1 className="h3 mb-3">Admin Dashboard</h1>

        {error ? <div className="alert alert-warning">{error}</div> : null}

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="fw-semibold mb-3">Questions</div>

            <form onSubmit={handleCreate}>
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

        {loading ? <div>Loading...</div> : null}

        <div className="vstack gap-3">
          {items.map((q) => (
            <div className="card shadow-sm" key={q._id}>
              <div className="card-body">
                <div className="fw-semibold mb-2">{q.text}</div>
                <ul className="mb-3">
                  {(q.options || []).map((o, idx) => (
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
                ) : (
                  <div className="d-flex gap-2">
                    <button className="btn btn-warning btn-sm" type="button" onClick={() => startEdit(q._id)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" type="button" onClick={() => remove(q._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
