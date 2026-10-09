# MERN Task Manager

A full stack task manager built with **MongoDB, Express, React and Node.js**. It has JWT login, role-based access (user and admin), and a clean React UI for creating, filtering and tracking tasks.

## Features

- Sign up and log in with email and password (passwords hashed with bcrypt)
- JWT authentication with a reusable `requireAuth` middleware
- Role-based access: users see only their own tasks, admins see and manage everyone's
- The first account created becomes the admin, so the demo works out of the box
- Create, edit status, and delete tasks with priority and due date
- Search by title and filter by status
- Central error handling and input validation with Mongoose
- Responsive layout that works on mobile

## Tech stack

| Part | Tech |
| --- | --- |
| Client | React 18, Vite, Context API |
| API | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT, bcryptjs |

## Getting started

You need Node.js 18+ and a MongoDB database (local, Docker or a free MongoDB Atlas cluster).

```bash
# API
cd server
cp .env.example .env     # set MONGO_URI and JWT_SECRET
npm install
npm run dev              # http://localhost:5000

# Client (second terminal)
cd client
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` to the Express server, so no CORS setup is needed in development.

Quick MongoDB with Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

## API reference

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create an account, returns token |
| POST | `/api/auth/login` | Public | Log in, returns token |
| GET | `/api/auth/me` | User | Current user |
| GET | `/api/tasks?status=&priority=&q=` | User | List tasks (all tasks for admins) |
| POST | `/api/tasks` | User | Create a task |
| PATCH | `/api/tasks/:id` | Owner or admin | Update a task |
| DELETE | `/api/tasks/:id` | Owner or admin | Delete a task |
| GET | `/api/users` | Admin | List users |
| PATCH | `/api/users/:id/role` | Admin | Change a user's role |

Send the token as `Authorization: Bearer <token>`.

## Project structure

```
server/src/
  index.js              app setup, error handler, DB connection
  models/               User, Task
  middleware/auth.js    JWT verify, role guard
  routes/               auth, tasks, users
client/src/
  api.js                fetch wrapper with token
  AuthContext.jsx       login state
  pages/                AuthPage, TasksPage
```

## License

MIT
