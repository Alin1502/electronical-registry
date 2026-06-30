# Database Implementation - Setup Guide

## Overview
The application now includes PostgreSQL database integration with user authentication and file management. Each user can upload, list, and download their own PDF files securely.

## Architecture

### Database Schema
```
Users Table:
- id (Primary Key)
- username (unique)
- email (unique)
- hashed_password
- created_at
- is_active

Files Table:
- id (Primary Key)
- filename
- s3_key (unique - path in S3)
- file_size (bytes)
- uploaded_at
- user_id (Foreign Key -> Users.id)
```

### Security Features
- Passwords hashed with bcrypt
- JWT token-based authentication
- User can only access their own files
- Authorization checks on all file operations

## Setup Instructions

### 1. Install PostgreSQL
- **Windows**: Download from https://www.postgresql.org/download/windows/
- During installation, set:
  - Username: `postgres`
  - Password: (set a strong password)
  - Port: 5432 (default)

### 2. Create Database
```bash
psql -U postgres
postgres=# CREATE DATABASE registratura_db;
postgres=# \q
```

### 3. Update .env File
Edit `backend/.env` and set:
```
DB_USER=postgres
DB_PASSWORD=your_actual_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=registratura_db
SECRET_KEY=generate-a-random-secret-key-here
```

### 4. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 5. Run the Backend
```bash
cd backend
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
Docs at `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /register` - Register new user
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure_password"
  }
  ```

- `POST /login` - Login user
  ```json
  {
    "username": "john_doe",
    "password": "secure_password"
  }
  ```

- `GET /me` - Get current user info (requires auth)

### File Management
- `POST /upload/` - Upload PDF file (requires auth)
  - Multipart form data with file
  
- `GET /files` - List all files for current user (requires auth)

- `GET /download/{file_id}` - Download a file (requires auth)

- `DELETE /files/{file_id}` - Delete a file (requires auth)

## Authentication
All file endpoints require Bearer token authentication:
```
Authorization: Bearer <access_token>
```

The token is received after login/registration and is valid for 30 minutes.

## Next Steps
1. Set up PostgreSQL locally
2. Update .env with database credentials
3. Install Python packages: `pip install -r requirements.txt`
4. Run the backend and test endpoints using FastAPI docs at `/docs`
5. Update frontend to handle authentication and file management UI
