from sqlalchemy import inspect, text


def ensure_uploaded_file_size_column(engine) -> None:
    inspector = inspect(engine)
    if "files" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("files")}
    with engine.begin() as connection:
        if "size_bytes" not in columns:
            connection.execute(text("ALTER TABLE files ADD COLUMN size_bytes INTEGER NOT NULL DEFAULT 0"))
        else:
            connection.execute(text("UPDATE files SET size_bytes = 0 WHERE size_bytes IS NULL"))
        if "is_secure_document" not in columns:
            connection.execute(text("ALTER TABLE files ADD COLUMN is_secure_document BOOLEAN NOT NULL DEFAULT FALSE"))
        if "access_code_hash" not in columns:
            connection.execute(text("ALTER TABLE files ADD COLUMN access_code_hash VARCHAR(64)"))
        if "encryption_salt" not in columns:
            connection.execute(text("ALTER TABLE files ADD COLUMN encryption_salt VARCHAR(64)"))
        if "encryption_nonce" not in columns:
            connection.execute(text("ALTER TABLE files ADD COLUMN encryption_nonce VARCHAR(64)"))

def ensure_user_profile_columns(engine) -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    with engine.begin() as connection:
        if "avatar_s3_key" not in columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN avatar_s3_key VARCHAR(255)"))