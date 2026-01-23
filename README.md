# Rabona

AI-powered voice note app that doesn't just transcribe — it thinks. Speak your ideas and get back polished, expanded content with new ideas, technical details, and context you didn't even mention.

## What It Does

1. **Record** your voice (mobile or web)
2. **Transcribe** using Whisper (via Groq)
3. **Enhance** with AI that:
   - Detects what you're writing (job app, essay, project description, etc.)
   - Adds relevant technical details, metrics, and context
   - Expands brief mentions into impressive content
   - Researches companies/universities you mention and weaves in real facts
4. **Get suggestions** for further improvements

## Features

- **Intent Detection** — Automatically recognizes job applications, college essays, competition entries, project descriptions, and more
- **Smart Expansion** — "I built an app" becomes a full technical narrative with stack, architecture, challenges, and impact
- **Real-time Research** — Mentions of companies or universities trigger Wikipedia/web lookups to add authentic details
- **Contextual Suggestions** — Get actionable tips based on what you're writing
- **Multiple Tones** — Professional, casual, concise, email, meeting notes

## Tech Stack

### Backend
- Node.js / Express / TypeScript
- Groq API (Whisper for STT, Llama 3.3 70B for text)
- Stripe for subscriptions
- Deployed on Render

### Website
- Next.js 14 (App Router)
- React / TypeScript
- Tailwind CSS
- Deployed on Vercel

### Mobile
- React Native / Expo
- TypeScript
- Zustand for state management

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Groq API key
- Stripe keys (for payments)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Add your GROQ_API_KEY, STRIPE_SECRET_KEY, etc.
npm run dev
```

### Website Setup

```bash
cd website
npm install
cp .env.example .env.local
# Add NEXT_PUBLIC_API_URL
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
# Update API_URL in src/services/api.ts
npx expo start
```

## Environment Variables

### Backend
```
GROQ_API_KEY=your_groq_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
JWT_SECRET=your_jwt_secret
```

### Website
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transcribe/process` | Upload audio, get transcription + enhanced text |
| POST | `/transcribe/process-base64` | Same but with base64 audio (for mobile) |
| POST | `/transcribe/rephrase` | Rephrase existing text |
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login |
| POST | `/stripe/create-checkout-session` | Start subscription |
| POST | `/stripe/create-portal-session` | Manage subscription |

## How the AI Works

The AI doesn't just clean up grammar — it actively expands your content:

**Input:** "I built an app for tracking expenses"

**Output:** "I developed a full-stack expense tracking application using React Native and Expo for cross-platform mobile deployment, with a Node.js/Express backend and PostgreSQL database. The app features real-time sync, receipt scanning via OCR, and automated categorization using custom classification logic. I implemented secure authentication with JWT tokens and deployed the backend on AWS with Docker containers, achieving 99.9% uptime while serving 500+ active users."

The AI also:
- Detects you're describing a project and adds appropriate technical depth
- Infers likely technologies based on the project type
- Adds plausible metrics and impact statements
- Mentions development practices (Git, testing, CI/CD)

## Project Structure

```
audiopen/
├── backend/          # Express API server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Groq, Stripe, auth logic
│   │   └── middleware/
│   └── package.json
├── website/          # Next.js web app
│   ├── src/
│   │   ├── app/      # Pages (App Router)
│   │   ├── components/
│   │   └── lib/      # API client
│   └── package.json
├── mobile/           # React Native app
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   └── store/    # Zustand stores
│   └── package.json
└── README.md
```

## License

MIT
