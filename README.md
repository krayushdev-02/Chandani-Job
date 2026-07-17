# ChandandiJobs - Enterprise AI Job Portal (MERN Stack)

**ChandandiJobs** is a production-grade, enterprise job matching ecosystem inspired by Naukri.com, LinkedIn Jobs, and Indeed. It integrates local intelligence algorithms for resume scoring, career counseling, mock interview evaluations, Stripe & Razorpay transaction billing, and Socket.io real-time chat.

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Redux Toolkit, Framer Motion, Axios, React Hot Toast, Recharts
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), Socket.io, JWT Authentication, Winston Logger, Helmet Security
- **Payment Processing**: Stripe, Razorpay
- **AI Processing Layer**: Local-intelligence rules engine with OpenAI/Gemini integration API hooks
- **Deployment & Orchestration**: Docker, Docker Compose, PM2 ready configurations

## Core Features

- **Multi-Role Dashboards**: Custom interfaces for Guest, Job Seeker, Recruiter, Employer, HR Manager, and Super Admin.
- **ATS Resume Analyzer**: Pastes raw resume text, scores formatting/STAR structures, and highlights skills gaps.
- **AI Interview Coach**: Dynamic technical, behavioral, and situational questions generated on selected roles with detailed evaluations, scoring, and outlines.
- **Real-Time Messenger**: Socket.io backed chats between candidates and recruiters with typing indicators and online markers.
- **Subscription Portals**: Subscriptions checkout gates utilizing sandbox simulations and invoice email generation.

## Project Structure

```
ChandaniJob/
├── client/                 # React 19 Vite Frontend
│   ├── src/
│   │   ├── components/     # UI, Navbar, Footer, Loading Skeletons
│   │   ├── services/       # Axios API Instantiator
│   │   ├── store/          # Redux Toolkit setup and slices
│   │   ├── pages/          # Home, JobSearch, ResumeBuilder, AICenter, Chat
│   │   └── main.tsx        # Mount point
│   └── Dockerfile          # Production Nginx Dockerfile
│
├── server/                 # Express Backend Server
│   ├── src/
│   │   ├── config/         # MongoDB and Winston configs
│   │   ├── models/         # Mongoose User, Job, Company, Chat Schemas
│   │   ├── middleware/     # JWT Auth guards, Error Handlers, Rate Limiters
│   │   ├── controllers/    # API logical handlers
│   │   ├── services/       # AI local parser, Razorpay order, Socket nodes
│   │   └── index.ts        # Express entry point
│   └── Dockerfile          # Production Node Dockerfile
│
├── docker-compose.yml      # Local DB & service stack orchestrator
└── package.json            # Root conductor script
```

## Setup & Execution

### 1. Database Seeding
To populate categories, blogs, mock google/stripe jobs, and initial test credentials (such as Ayush Kumar recruiter profile), run:
```bash
cd server
npm run seed
```

### 2. Local Development (Running Concurrently)
Run the root conductor script to boot both Express backend (Port 5000) and React frontend (Port 3000):
```bash
npm run dev
```

### 3. Containerized Orchestration (Docker Compose)
Run compose commands to containerize MongoDB, client, and server stacks:
```bash
docker-compose up --build
```

---

**Owner Info**
- **Creator**: Ayush Kumar
- **Email**: ayushk2375@gmail.com
- **Location**: Bettiah, Bihar, India
