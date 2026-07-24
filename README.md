# Aplicatie Registratura

## Run with Docker Compose

From the project root:

```bash
docker compose up --build
```

This starts:
- Backend at http://localhost:8000
- Frontend at http://localhost:5173
- PostgreSQL on port 5432

### Stop containers

```bash
docker compose down
```

### Reset database volume

```bash
docker compose down -v
```
