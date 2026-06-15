# Frontend

React + Vite client for submitting code and rendering structured review feedback.

Development

Run from workspace root:

`npm run dev:frontend`

The app runs on `http://localhost:5173`.

API configuration

The client uses `VITE_API_BASE_URL` if provided. In local development, `/api` is proxied to `http://localhost:8080` by Vite.

Build

`npm run build --workspace frontend`

Preview

`npm run preview --workspace frontend`
