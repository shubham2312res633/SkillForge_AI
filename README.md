# SkillForge AI — Autonomous Career Growth Multi-Agent System

SkillForge AI is an advanced career operating system powered by a cooperating multi-agent system. It analyzes technical portfolios, maps custom month-by-month roadmaps, suggests tailor-made portfolio projects, conducts interactive mock interviews, and dynamically tracks readiness metrics.

---

## 🚀 Key Capabilities

- **PII Scrubbing & Injection Audit**: Intercepts input payloads, redacting sensitive personal data (emails, phone numbers) and blocking prompt injections.
- **ATS Parsing & Grading**: Parses raw text from PDF resumes, calculating structural resume ratings.
- **Priority Skill Gap Analyzer**: Compares skills against target positions (e.g., *Backend Engineer*), sorting missing skills by priority (*High/Medium/Low*).
- **Milestone roadmap generator**: Structures detailed month-by-month modules including study resources and milestone tasks.
- **Interactive Interview Simulator**: Simulates a technical assessor, presenting 3 chat-based questions and generating a grading rubric (covering technical correctness, communication, and key weaknesses).
- **Persistent JSON Mock database fallback**: If MongoDB is not active locally, the backend launches in **In-Memory Mock Database Mode** with local JSON file persistence ([mockDb.json](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/config/mockDb.json)).

---
## 📸 Project Demo & Screenshots

Here is a preview of the SkillForge AI interface. Place your screenshots in the `docs/screenshots/` folder and link them below:

| 📊 Dashboard & ATS Grading | 🗺️ Dynamic Milestone Roadmap |
| :---: | :---: |
| ![Dashboard Overview](https://github.com/shubham2312res633/SkillForge_AI/blob/b1407f38d378c5b3b27f7d1cf6c9dfadff65fe65/Screenshots/Dashboard.png) | ![Roadmap Planner](https://github.com/shubham2312res633/SkillForge_AI/blob/d0593d0a9edba9b1b5526488256f9961abae24ff/Screenshots/Roadmap.png) |

| 💬 Interactive Mock Interview | 🤖 Agent Activity Logs |
| :---: | :---: |
| ![Mock Interview](https://github.com/shubham2312res633/SkillForge_AI/blob/8971f3ec5ef2e95666c29404cffd8c5dec98b32b/Screenshots/Interview%20simulation.png) | ![Agent Activity](https://github.com/shubham2312res633/SkillForge_AI/blob/62e5b362c35ebdcdcfe29dd011f2b5f95797707a/Screenshots/Agent%20activity.png) |

| 🎯 Target Career Role Selection | 💼 Project & Job Recommendations |
| :---: | :---: |
| ![Target Role Selection](https://github.com/shubham2312res633/SkillForge_AI/blob/72926b642148964f893c12e88cf55a0ecc692012/Screenshots/Target%20role.png) | ![Recommendations](docs/screenshots/recommendations.png) |

---


## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, React Router, Lucide Icons, Glassmorphism CSS layout.
- **Backend**: Node.js, Express.js.
- **LLM Engine**: Google Gemini API (`gemini-2.5-flash` model).
- **Protocol Layer**: Model Context Protocol (MCP) SDK (JSON-RPC stdio transport).
- **Database**: Mongoose, MongoDB, or local JSON fallback.

---

## 🤖 Multi-Agent Architecture

```
                       User (React Client)
                               │
                               ▼
                    [CareerOrchestrator]
                               │
  ┌──────────────────┬─────────┴─────────┬──────────────────┐
  ▼                  ▼                   ▼                  ▼
[SecurityAgent] ──► [ResumeAgent] ──► [SkillAgent] ──► [RoadmapAgent]
 (Masks PII)       (Parses text)     (Gaps scan)      (Time planner)
                                                            │
  ┌──────────────────┬───────────────────┴──────────────────┤
  ▼                  ▼                                      ▼
[ProjectAgent]   [JobAgent]                            [MemoryAgent]
(Portfolio)      (Mock jobs)                           (State store)
```

- **CareerOrchestrator** ([CareerOrchestrator.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/CareerOrchestrator.js)): Coordinates the flow, calling agents sequentially and mapping results to the database.
- **SecurityAgent** ([SecurityAgent.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/SecurityAgent.js)): Redacts PII and checks inputs for injection attacks.
- **ResumeAgent** ([ResumeAgent.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/ResumeAgent.js)): Invokes the `resume_parser_tool` to convert raw text to structured skills.
- **SkillAgent** ([SkillAgent.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/SkillAgent.js)): Runs the `career_analyzer_tool` to identify gaps.
- **RoadmapAgent** ([RoadmapAgent.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/RoadmapAgent.js)): Runs the `roadmap_generator_tool` to lay out a monthly study schedule.
- **ProjectAgent** ([ProjectAgent.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/ProjectAgent.js)): Structures project recommendations to address missing skills.
- **JobAgent** ([JobAgent.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/JobAgent.js)): Queries mock job listings matching candidate skills.
- **InterviewAgent** ([InterviewAgent.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/InterviewAgent.js)): Simulates technical chats, checks answers, and generates a scorecard.
- **MemoryAgent** ([MemoryAgent.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/MemoryAgent.js)): Reads and writes user profiles and scores via MCP tools.

---

## 🔄 Architecture & Data Flow

The operational flow of the system is structured as follows:

1. **Client Request**: The process starts when a user uploads a PDF/text resume and selects a target career role on the React frontend. The client transmits the payload via a secure HTTP POST request, containing a Bearer JWT token in the headers, to the Express backend.
2. **Authentication Middleware**: The backend verifies the token and loads user credentials. If local MongoDB is inactive, it pulls from the local persistent JSON store ([mockDb.json](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/config/mockDb.json)) using the patched mock document handlers.
3. **Security Audit**: The request is handed over to the [CareerOrchestrator](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/CareerOrchestrator.js), which invokes the [SecurityAgent](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/SecurityAgent.js). The text is audited for injection risks and cleaned of PII (emails and phone numbers).
4. **ATS Parsing & Grading**: The orchestrator sends the sanitized text to the [ResumeAgent](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/ResumeAgent.js), which queries the MCP Server's `resume_parser_tool`. This tool communicates with the Google Gemini API using structured JSON output schemas to return skills, projects, and ATS score metrics.
5. **Gaps & Trajectory Modeling**: The orchestrator sends the parsed skills to the [SkillAgent](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/SkillAgent.js). The agent queries the MCP `career_analyzer_tool` to compute skill gaps (High/Medium/Low priority) and estimate Career Readiness.
6. **Curriculum Generation**: The [RoadmapAgent](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/RoadmapAgent.js) is called with the gaps list, querying the MCP `roadmap_generator_tool` to build monthly study blocks complete with milestones, resource links, and custom portfolio project specifications generated by the [ProjectAgent](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/ProjectAgent.js).
7. **Job Match & Memory Sync**: The [JobAgent](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/JobAgent.js) matches the profile against simulated job vacancies, and the [MemoryAgent](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/MemoryAgent.js) coordinates updates. All profile, roadmap, and milestone changes are saved to the persistent database.
8. **Interactive Mock Interview**: In the Interview Room, the frontend initiates a chat session. The [InterviewAgent](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/agents/InterviewAgent.js) directs a 3-question session, grading user inputs dynamically and updating their overall Career score in the database.

---

## 🔌 Model Context Protocol (MCP) Tools

Exposed by the local MCP server ([server.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/mcp/server.js)):

- **`resume_parser_tool`**: Converts raw resume strings to skills and achievements.
- **`career_analyzer_tool`**: Maps skills against target roles to yield gaps.
- **`roadmap_generator_tool`**: Builds a personalized study curriculum.
- **`job_search_tool`**: Matches skills against simulated vacancies.
- **`memory_tool`**: Persists profile logs and milestones.

---

## 🗄️ Database Schemas

Schemas are located in `backend/models/`:

- **User** ([User.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/models/User.js)): `name`, `email` (unique), `password` (bcrypt).
- **Resume** ([Resume.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/models/Resume.js)): `userId`, `fileName`, `rawText`, `parsedData`.
- **CareerProfile** ([CareerProfile.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/models/CareerProfile.js)): `userId`, `targetRole`, `skills`, `strengths`, `weaknesses`, `resumeScore`, `readinessScore`, `missingSkills`.
- **Roadmap** ([Roadmap.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/models/Roadmap.js)): `userId`, `targetRole`, `months` (array of topics, resources, milestones, and projects).
- **Progress** ([Progress.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/models/Progress.js)): `userId`, `completedTopics`, `completedProjects`, `overallCareerScore`.
- **Interview** ([Interview.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/models/Interview.js)): `userId`, `topic`, `history` (messages), `score`, `feedback` (JSON assessment), `status`.
- **AgentActivity** ([AgentActivity.js](file:///c:/Users/shubh/OneDrive/Desktop/Capstone%20Project/backend/models/AgentActivity.js)): `userId`, `agentName`, `action`, `status`, `details`, `timestamp`.

---

## 📡 API Routes Reference

- **Auth** (`/api/auth`): `POST /register`, `POST /login`, `GET /me`.
- **Resume** (`/api/resume`): `POST /upload`, `GET /history`.
- **Career** (`/api/career`): `GET /profile`, `POST /goal`.
- **Roadmap** (`/api/roadmap`): `GET /`, `POST /toggle-topic`, `POST /toggle-project`.
- **Interview** (`/api/interview`): `POST /start`, `POST /chat`, `GET /history`.
- **Dashboard** (`/api/dashboard`): `GET /stats`, `GET /activity`.

---

## 🚀 Setup & Setup Instructions

### 1. Install Dependencies
Run the command below in the project root:
```bash
npm run setup
```

### 2. Configure Environment Variables
Create a file named `.env` in the `backend/` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/skillforge
JWT_SECRET=your_jwt_secret_token
GEMINI_API_KEY=AIzaSy... (Your Google Studio Gemini Key)
```

### 3. Run Backend
In a terminal, run:
```bash
npm run start:backend
```
*(Starts on [http://localhost:5000](http://localhost:5000). Launches in persistent JSON fallback mode if MongoDB is not running)*

### 4. Run Frontend
In a separate terminal, run:
```bash
npm run start:frontend
```
*(Starts on [http://localhost:3000](http://localhost:3000))*
