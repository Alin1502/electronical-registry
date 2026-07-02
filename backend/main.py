from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import Base, engine
import models.user, models.file, models.entry  
from routes import auth, files, entries, roles, departments, admin

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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