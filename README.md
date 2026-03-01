# Scholar Suite — Student-Professor DBMS Frontend

A full faculty directory web app with search, filtering, bookmarking, and a project viewer.

---

## Project Structure

```
scholar-suite/
├── package.json
│
├── backend/
│   ├── server.js               # Express entry point
│   ├── data/
│   │   ├── faculty.js          # Faculty records
│   │   └── projects.js         # Projects keyed by faculty ID
│   ├── routes/
│   │   ├── faculty.js          # GET /api/faculty, /api/faculty/:id
│   │   └── projects.js         # GET /api/projects, /api/projects/faculty/:id
│   └── middleware/
│       └── headers.js          # CORS + JSON headers
│
└── frontend/
    ├── index.html              # Main HTML shell
    ├── css/
    │   ├── tokens.css          # Design variables, reset, animations
    │   ├── navbar.css          # Top navigation bar
    │   ├── faculty.css         # Directory page & faculty cards
    │   └── projects.css        # Full-page projects view
    └── js/
        ├── api.js              # All fetch() calls to the backend
        ├── state.js            # Shared app state object
        ├── render.js           # Faculty card HTML builder & grid renderer
        ├── projects.js         # Projects page open/close/render
        ├── filters.js          # Search, dept filter, bookmark logic
        └── main.js             # Entry point — boots app, wires events
```

---

## Setup & Running

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```
Or for auto-reload during development:
```bash
npm run dev
```

### 3. Open in browser
```
http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint                        | Description                          |
|--------|---------------------------------|--------------------------------------|
| GET    | `/api/faculty`                  | All faculty (supports `?q=` `?dept=`)|
| GET    | `/api/faculty/:id`              | Single faculty member                |
| GET    | `/api/projects`                 | All projects (supports `?status=`)   |
| GET    | `/api/projects/faculty/:id`     | Projects for a specific faculty      |
| GET    | `/api/projects/:projectId`      | Single project by its string ID      |
| GET    | `/api/health`                   | Server health check                  |

---

## Adding to a Real Database

To swap the flat JS data files for a real DB (MySQL, PostgreSQL, etc.):

1. Replace `backend/data/faculty.js` and `backend/data/projects.js` with async DB query functions.
2. Update `backend/routes/faculty.js` and `backend/routes/projects.js` to `await` those functions.
3. No frontend changes required — the API contract stays the same.
