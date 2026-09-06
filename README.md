# DevNautics

DevNautics is a developer skill platform where builders find teammates, run code together, learn through daily challenges, and grow a public track record of what they've shipped.

## What it does

- **Collaborate on real projects** — post an open collaboration with a role list and tech stack, and let others request to join
- **Team workspaces** — track tasks, timelines, GitHub commits, and calendar events for an ongoing project with your team
- **Communities** — topic-based spaces with admins, join requests, and live member counts
- **In-app messaging** — text, media, and file messages per community/discussion thread with delivery and read receipts
- **Async code execution** — submit code and get results back through a queued execution pipeline instead of blocking the request
- **Daily assessments** — aptitude, CS fundamentals, puzzles, DSA, and pseudocode questions with per-user submissions and points
- **Developer profiles** — education, work experience, skills, and a project portfolio for every user
- **Social feed** — short posts with bookmarks and threaded comments

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Node.js / Express, Next.js API routes |
| Database | MongoDB (Mongoose) |
| Code execution | BullMQ + Redis job queue, Judge0 / Piston |
| Editor | Monaco Editor |

## Data model

The platform is built around these core Mongoose models:

- `User` — profile, skills, education, work experience, projects, points
- `Workspace` — team, tasks, timeline, commits, calendar events
- `Collaboration` — open project listings with roles wanted and pending requests
- `Community` — topic spaces with members, admins, and join requests
- `Message` — per-community/discussion chat with file attachments
- `Feed` — posts with bookmarks and comments
- `Question` / `Submission` — daily challenge questions and per-user answers

## Getting started

\`\`\`bash
git clone https://github.com/<your-org>/devnautics.git
cd devnautics
npm install
\`\`\`

Create a `.env.local` file:

\`\`\`env
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_jwt_secret
PISTON_API_URL=your_piston_or_judge0_endpoint
\`\`\`

Run the dev server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view it.

## Project structure

\`\`\`
devnautics/
├── models/          # Mongoose schemas (User, Workspace, Collaboration, ...)
├── app/ or pages/    # Next.js routes and pages
├── components/      # Shared UI components
├── lib/             # DB connection, queue workers, helpers
└── public/          # Static assets
\`\`\`

## Roadmap

- [ ] Analytics dashboard for workspace activity
- [ ] Leaderboard seasons and badges
- [ ] Real-time presence in communities
- [ ] Public developer profile pages

## Contributing

Issues and pull requests are welcome. Please open an issue first for larger changes so we can discuss the approach.

## License

MIT
