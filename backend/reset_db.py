from core.database import Base, engine
import models.user, models.entry, models.file, models.department, models.role
# This drops all existing tables and recreates them with the new schema.
# WARNING: This will delete your test user and the file records in the DB.
print("Dropping old tables")
Base.metadata.drop_all(bind=engine)

print("Creating new tables")
Base.metadata.create_all(bind=engine)

print("Database reset complete!")