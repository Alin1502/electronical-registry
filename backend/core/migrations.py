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