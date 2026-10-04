# Archified

Archified is a web app that turns uploaded 2D floor plans into AI-generated 3D-style architectural renders.

Users can sign in with Puter, upload a floor plan image, generate a rendered version, compare the original and rendered images, export the result, and share or unshare projects.

## Tech Stack

- React
- TypeScript
- React Router
- Vite
- Tailwind CSS
- Puter.js
- Puter Workers
- Puter KV storage
- Gemini image generation through Puter AI

## Features

- User authentication with Puter
- Floor plan image upload
- AI-generated 3D-style render
- Before/after image comparison slider
- Project history
- Export rendered image
- Share and unshare projects between private and public KV storage

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file and add your Puter worker URL:

```bash
VITE_PUTER_WORKER_URL=https://your-worker-url
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run type checks:

```bash
npm run typecheck
```

## Project Structure

```text
app/
  routes/              App pages and routes
components/            Reusable UI components
lib/                   Puter, AI, hosting, and utility logic
public/                Static assets
type.d.ts              Shared TypeScript types
```

## Main Flow

```text
User uploads floor plan
        ↓
Image is stored with Puter hosting
        ↓
Project metadata is saved in private Puter KV
        ↓
AI generates a 3D-style render
        ↓
User compares, exports, shares, or unshares the project
```

## Important Files

- `app/root.tsx` sets up the app layout and Puter authentication state.
- `app/routes/home.tsx` shows the upload area and saved projects.
- `app/routes/visualizer.$id.tsx` shows the image comparison and project actions.
- `components/upload.tsx` handles image selection and upload progress.
- `lib/ai.action.ts` calls Puter AI to generate the rendered image.
- `lib/puter.action.ts` connects the frontend to the Puter worker.
- `lib/puter.worker.js` handles project save, list, get, share, and unshare actions.

## Notes

The app needs a valid Puter account, a deployed Puter worker, and `VITE_PUTER_WORKER_URL` configured before project history, sharing, and AI workflows will work fully.
