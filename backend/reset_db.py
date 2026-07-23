from core.database import Base, engine
import models.user, models.entry, models.file, models.department, models.role, models.history, models.company
# This drops all existing tables and recreates them with the new schema.
# WARNING: This will delete your test user and the file records in the DB.
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE"))
    conn.execute(text("CREATE SCHEMA public"))
    conn.commit()

print("Creating new tables")
Base.metadata.create_all(bind=engine)

print("Database reset complete!")