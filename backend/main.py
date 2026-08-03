import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import Base, engine
from core.migrations import ensure_uploaded_file_size_column
import models.user, models.file, models.entry
from routes import auth, files, entries, roles, departments, admin, invites, secure_documents

Base.metadata.create_all(bind=engine)
ensure_uploaded_file_size_column(engine)

app = FastAPI()

origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(entries.router, prefix="/entries", tags=["entries"])
app.include_router(roles.router, prefix="/roles", tags=["roles"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(departments.router, prefix="/departments", tags=["departments"])
app.include_router(invites.router, prefix="/invites", tags=["invites"])
app.include_router(secure_documents.router, prefix="/secure-documents", tags=["secure-documents"])