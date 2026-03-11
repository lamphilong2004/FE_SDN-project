# Question Bank Management UI (Assignment 2)

This project is a Node.js + Express UI for managing **Quizzes** and **Questions** with full CRUD support. It integrates with the existing Assignment 1 REST API via **Axios**.

## Features

- Quiz management: list, create, view details (with questions), edit, delete
- Question management: list, create, view details, edit, delete
- Add a question directly to a specific quiz via `POST /quizzes/:quizId/question`
- Bootstrap 5 UI with custom styling in [public/css/style.css](public/css/style.css)

## Tech Stack

- Express (UI server)
- EJS views + `express-ejs-layouts`
- “Hybrid” `.hbs` layout/partial files rendered by EJS (layout/partials keep `.hbs` extensions as requested)
- Axios for REST API calls

## Project Structure

- Routes
  - [routes/index.js](routes/index.js)
  - [routes/quiz.js](routes/quiz.js)
  - [routes/question.js](routes/question.js)
- Views
  - Layout: [views/layouts/main.hbs](views/layouts/main.hbs)
  - Partials: [views/partials/header.hbs](views/partials/header.hbs), [views/partials/footer.hbs](views/partials/footer.hbs)
  - Quiz views: [views/quiz](views/quiz)
  - Question views: [views/questions](views/questions)

## Configuration

The UI defaults to:

- UI server: `http://localhost:3001`
- API server: `http://localhost:3000`

You can override via environment variables:

- `UI_PORT` — port for this UI server
- `API_URL` — base URL of the Assignment 1 API
- `API_TIMEOUT_MS` — axios timeout (ms)

See [.env.example](.env.example).

## How to Run

1. Start the Assignment 1 API at `http://localhost:3000`.
2. From this project folder:
   - `npm install`
   - `npm start`
3. Open `http://localhost:3001`.

## Verification Notes

- Axios integration verified across quiz/question CRUD endpoints.
- Quiz details view fetches quiz info and quiz questions (via `GET /quizzes/:id/populate`).
- Forms and tables use Bootstrap 5 classes and responsive layout.

## Troubleshooting

- If you see 404/500 errors, confirm the API is running and `API_URL` matches the API base URL.
- If quiz details fails to load questions, ensure the API supports `GET /quizzes/:id/populate`.

### Authentication (important)

This UI calls protected endpoints like `GET /quizzes` and `POST /quizzes`.

- If your Assignment 1 API requires JWT/admin for these routes, you must login in the UI at `/login`.
- The UI stores the API JWT in an HTTP-only cookie (`authToken`) and automatically sends `Authorization: Bearer <token>` on API requests.
