import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import AppNavbar from '../components/AppNavbar.jsx';
import { fetchQuizById } from '../store/quizzesSlice.js';

export default function QuizPage() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const quiz = useSelector((s) => s.quizzes.selected);
  const loading = useSelector((s) => s.quizzes.loading);
  const error = useSelector((s) => s.quizzes.error);

  const questions = useMemo(() => {
    const arr = Array.isArray(quiz?.questions) ? quiz.questions : [];
    return arr;
  }, [quiz]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    dispatch(fetchQuizById(quizId));
  }, [dispatch, quizId]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
  }, [quizId]);

  const currentQuestion = questions[currentIndex];
  const options = Array.isArray(currentQuestion?.options) ? currentQuestion.options : [];

  const handleSubmit = () => {
    if (selectedIndex === null) return;

    const isCorrect = Number(currentQuestion?.correctAnswerIndex) === Number(selectedIndex);
    const nextScore = isCorrect ? score + 1 : score;

    const isLast = currentIndex >= questions.length - 1;
    if (isLast) {
      navigate('/quiz-completed', {
        replace: true,
        state: { score: nextScore, total: questions.length, quizTitle: quiz?.title }
      });
      return;
    }

    setScore(nextScore);
    setCurrentIndex((v) => v + 1);
    setSelectedIndex(null);
  };

  return (
    <>
      <AppNavbar />
      <div className="container py-5">
        <h1 className="h3 mb-4">Dashboard</h1>

        {error ? <div className="alert alert-warning">{error}</div> : null}
        {loading ? <div>Loading...</div> : null}

        {!loading && quiz ? (
          <div className="text-center">
            <div className="h4 mb-4">Quiz</div>

            {questions.length === 0 ? (
              <div className="alert alert-info">This quiz has no questions yet.</div>
            ) : (
              <div className="card mx-auto shadow-sm" style={{ maxWidth: 520 }}>
                <div className="card-body">
                  <div className="h5 mb-3">{currentQuestion?.text}</div>

                  <div className="text-start mb-3">
                    {options.map((opt, idx) => (
                      <div className="form-check" key={idx}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="option"
                          id={`opt-${idx}`}
                          checked={Number(selectedIndex) === idx}
                          onChange={() => setSelectedIndex(idx)}
                        />
                        <label className="form-check-label" htmlFor={`opt-${idx}`}>
                          {opt}
                        </label>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={selectedIndex === null}
                  >
                    Submit Answer
                  </button>

                  <div className="mt-3 small text-muted">
                    Question {currentIndex + 1} / {questions.length}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
