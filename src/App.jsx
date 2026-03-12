import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMe, selectAuth } from './store/authSlice.js';
import RequireAuth from './components/RequireAuth.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import QuizCompletedPage from './pages/QuizCompletedPage.jsx';

import AdminHomePage from './pages/admin/AdminHomePage.jsx';
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage.jsx';
import AdminQuizzesPage from './pages/admin/AdminQuizzesPage.jsx';
import AdminQuizDetailsPage from './pages/admin/AdminQuizDetailsPage.jsx';

export default function App() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);

  useEffect(() => {
    if (auth.token && !auth.user && !auth.loadingMe) {
      dispatch(fetchMe());
    }
  }, [auth.token, auth.user, auth.loadingMe, dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/quiz/:quizId"
        element={
          <RequireAuth>
            <QuizPage />
          </RequireAuth>
        }
      />
      <Route
        path="/quiz-completed"
        element={
          <RequireAuth>
            <QuizCompletedPage />
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminHomePage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <RequireAdmin>
            <AdminQuestionsPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/quizzes"
        element={
          <RequireAdmin>
            <AdminQuizzesPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/quizzes/:quizId"
        element={
          <RequireAdmin>
            <AdminQuizDetailsPage />
          </RequireAdmin>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
