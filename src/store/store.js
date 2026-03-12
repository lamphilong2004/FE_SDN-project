import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import quizzesReducer from './quizzesSlice.js';
import questionsReducer from './questionsSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quizzes: quizzesReducer,
    questions: questionsReducer
  }
});
