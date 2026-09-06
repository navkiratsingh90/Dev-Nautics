# DevNautics

<p align="center">
  <img src="https://img.shields.io/badge/status-active-8B5CF6?style=flat-square" alt="status" />
  <img src="https://img.shields.io/badge/stack-Next.js%20%7C%20MongoDB%20%7C%20Redis-22D3EE?style=flat-square" alt="stack" />
  <img src="https://img.shields.io/badge/license-MIT-E249D9?style=flat-square" alt="license" />
</p>

<p align="center">
  A developer skill platform where builders find teammates, run code together, learn through daily challenges, and grow a public track record of what they've shipped.
</p>

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

DevNautics brings the pieces of a developer's growth — code, collaboration, and community — into one platform. Instead of juggling a separate job board, a separate chat app, and a separate practice-problem site, DevNautics ties them together around a single developer profile: what you've built, who you've built it with, and what you've learned along the way.

The platform is split into a few connected surfaces:

- A place to **find a project and a team** (Collaborations)
- A place to **run that project** once you have a team (Workspaces)
- A place to **talk to your team and your communities** (Messages)
- A place to **sharpen fundamentals daily** (Assessments)
- A place to **show what you've done** (Profiles, Feed)

## Features

### Collaboration & teams
- Post an open collaboration with a problem statement, tech stack, and the specific roles you're looking for
- Accept or decline join requests, and track current team members against your target team size
- Tag collaborations by category and technology so the right people can find them

### Workspaces
- Each active project gets a workspace with its own task board (priority, assignee, due date, status)
- A visual timeline of milestones, each markable as completed
- GitHub commit log and calendar events (with meeting links) live alongside the tasks
- Per-member role and a running count of tasks each teammate has completed

### Communities
- Topic-based spaces with a join-request flow, multiple admins, and a live online-member count
- Slugged for shareable URLs, with a topics list for discoverability

### Messaging
- Text, media, and file messages scoped to a community or discussion thread
- Delivery and read receipts per message
- Rich file metadata (URL, MIME type, name, size) for shared attachments

### Daily assessments
- Five question categories: aptitude, CS fundamentals, puzzles, DSA, and pseudocode
- Easy / medium / hard difficulty, optional explanations and images per question
- One submission per user per question is enforced at the database level, with points awarded per correct answer
- Questions can be scheduled and toggled active/inactive for a daily-challenge rotation

### Developer profiles
- Education, work experience, and a categorized skill set (frontend, backend, tools, frameworks, libraries, languages)
- A project portfolio entry per project, with tech stack, role, and links to GitHub/live demos
- Connection requests between users and a running total-points score

### Feed
- Short-form posts with an optional attached file
- Bookmarking and threaded comments per post

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Node.js / Express, Next.js API routes |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT-based sessions with email verification |


## Data model

The platform is built around these core Mongoose models:

| Model | Purpose | Key relationships |
|---|---|---|
| `User` | Profile, skills, education, work experience, project portfolio, points | Referenced by nearly every other model |
| `Workspace` | An active team project — tasks, timeline, commits, calendar events | `leader`, `members[].user` → `User` |
| `Collaboration` | An open listing looking for teammates | `createdBy`, `currentTeamMembers[].user`, `pendingRequests` → `User` |
| `Community` | A topic-based space with membership and admins | `createdBy`, `joinedMembers`, `admins`, `pendingRequests` → `User` |
| `Message` | Chat messages within a community/discussion | `communityId` → `Discussion`, `senderId` → `User` |
| `Feed` | Short posts with bookmarks and comments | `createdBy`, `bookmarks`, `comments[].createdBy` → `User` |
| `Question` | A daily-challenge question bank entry | Referenced by `Submission` |
| `Submission` | One user's answer to one question | `user` → `User`, `question` → `Question` (unique compound index) |

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or Atlas)

### Installation

```bash
git clone https://github.com/<your-org>/devnautics.git
cd devnautics
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. If code execution is enabled, start the queue worker in a second terminal:

```bash
npm run worker
```

## Environment variables

Create a `.env.local` file in the project root:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Auth
JWT_SECRET=your_jwt_secret
EMAIL_VERIFICATION_FROM=noreply@yourdomain.com

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project structure
