# LearnFlow AI

> AI-powered Customer Journey Orchestrator for Corporate Learning & Development.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js, JWT, bcrypt, Zod |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini API |

## Project Structure

```
project-root/
├── client/     → React + Vite frontend (deploy to Vercel)
├── server/     → Node.js + Express backend (deploy to Render)
├── docs/       → Documentation
├── .env.example
└── README.md
```

## Getting Started

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in values
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Environment Variables

See `.env.example` for required variables.

## Deployment

- **Frontend:** Vercel (set Root Directory to `client`)
- **Backend:** Render (set Root Directory to `server`)
- **Database:** MongoDB Atlas
