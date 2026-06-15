# AI Code Review Assistant

Full-stack monorepo for a code review assistant powered by Google Gemini.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- API Provider: Google Gemini API

## Folder Structure

```text
.
|-- .github/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |   `-- env.js
|   |   |-- controllers/
|   |   |   `-- review.controller.js
|   |   |-- middleware/
|   |   |   |-- errorHandler.js
|   |   |   `-- notFound.js
|   |   |-- routes/
|   |   |   |-- health.routes.js
|   |   |   `-- review.routes.js
|   |   |-- services/
|   |   |   `-- openai.service.js
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   |-- .prettierrc.json
|   |-- eslint.config.js
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |   `-- reviewApi.js
|   |   |-- App.css
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- .env.example
|   |-- vite.config.js
|   `-- package.json
|-- shared/
|-- .gitignore
|-- package.json
`-- README.md
```

## Dependencies

### Root
- `concurrently`: run frontend and backend together in development

### Frontend
- `react`, `react-dom`, `vite`
- `axios` for HTTP requests
- `eslint` stack from Vite template

### Backend
- `express`, `cors`, `helmet`, `morgan`
- `dotenv` for environment config
- `@google/genai` for Gemini integration
- `zod` for request validation
- `express-rate-limit` for API protection
- Dev: `nodemon`, `eslint`, `prettier`, `@eslint/js`, `globals`

## Setup Commands

From workspace root:

```bash
npm install
npm install --workspace frontend
npm install --workspace backend
```

Create environment files:

```bash
copy frontend/.env.example frontend/.env
copy backend/.env.example backend/.env
```

Add your Gemini key in `backend/.env`:

```env
GEMINI_API_KEY=your_real_key
```

Run in development:

```bash
npm run dev
```

This starts:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

Build frontend:

```bash
npm run build
```

Run backend in production mode:

```bash
npm run start
```

## API Endpoints

- `GET /api/health`
- `POST /api/review`
- `POST /api/review-code`

Example review payload:

```json
{
  "language": "javascript",
  "context": "Focus on performance and safety",
  "code": "function sum(a,b){return a+b;}"
}
```
