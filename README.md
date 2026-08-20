# Dockerized Todo App

A full-stack example app: **FastAPI** backend, **PostgreSQL** database, and a
plain HTML/JS frontend served by **Nginx** — all wired together with Docker
Compose.

## Structure

```
.
├── docker-compose.yml
├── backend/
│   ├── main.py          # FastAPI app + SQLAlchemy models + routes
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── index.html
    ├── style.css
    ├── app.js
    ├── nginx.conf        # proxies /api/* to the backend container
    └── Dockerfile
```

## Run it

From the project root:

```bash
docker compose up --build
```

Then open **http://localhost:8080** in your browser.

- Frontend: `http://localhost:8080` (Nginx, serves the static app and proxies `/api` calls)
- Backend API directly: not exposed to the host by default (only reachable inside the Docker network as `backend:8000`) — go through the frontend's `/api` proxy instead
- Postgres: internal only, on the `db` service, database `tododb`

To stop:

```bash
docker compose down
```

To stop and wipe the database volume too:

```bash
docker compose down -v
```

## How the pieces talk to each other

- The **frontend** container serves static files and reverse-proxies any
  request to `/api/*` over to the **backend** container (via Docker's
  internal DNS — service name `backend`, port `8000`). This avoids CORS
  headaches and mirrors how you'd deploy behind a real reverse proxy.
- The **backend** connects to Postgres using the service name `db` as the
  hostname (set via the `DATABASE_URL` environment variable in
  `docker-compose.yml`). It retries the connection a few times on startup
  since Postgres can take a moment to become ready.
- Data persists in a named Docker volume (`db_data`), so it survives
  `docker compose down` (but not `docker compose down -v`).

## API endpoints

| Method | Path              | Description       |
|--------|-------------------|--------------------|
| GET    | `/api/health`     | Health check       |
| GET    | `/api/todos`      | List all todos     |
| POST   | `/api/todos`      | Create a todo      |
| PUT    | `/api/todos/{id}` | Update a todo      |
| DELETE | `/api/todos/{id}` | Delete a todo      |

## Extending this

- Swap the frontend for React/Vue by changing what the `frontend` Dockerfile
  builds — the Nginx proxy setup stays the same.
- Add auth by adding a dependency in `main.py` and a login flow in the
  frontend.
- For production, set real secrets via environment variables or a `.env`
  file (don't commit real passwords — the ones here are dev-only defaults).
