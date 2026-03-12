# QuestionBank Frontend (React + Redux)

This folder is the **frontend** for Assignment 4.

- React + React Router
- Redux Toolkit for state management
- Bootstrap 5 styling
- Role-based UI: **admin** can CRUD quizzes/questions, **user** can take quizzes

It consumes the backend API in `../AS3` (default `http://localhost:3000`).

## Run locally

1. Start backend API (AS3)

- In `AS3/`: `npm install` then `npm start`

2. Start frontend

- In this folder: `npm install` then `npm run dev`
- Open `http://localhost:3001`

## Environment

Create `.env` (or use `.env.example`) with:

- `VITE_API_URL=http://localhost:3000`

## Routes

- `/login`, `/register`
- User: `/dashboard`, `/quiz/:quizId`, `/quiz-completed`
- Admin: `/admin/questions`, `/admin/quizzes`, `/admin/quizzes/:quizId`
