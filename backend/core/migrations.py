from sqlalchemy import inspect, text
from models.notification import Notification


def ensure_notifications_table(engine):
    inspector = inspect(engine)
    if "notifications" not in inspector.get_table_names():
        Notification.__table__.create(bind=engine)

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


def ensure_register_types_table(engine) -> None:
    inspector = inspect(engine)

    if "register_types" not in inspector.get_table_names():
        with engine.begin() as connection:
            connection.execute(text("""
                CREATE TABLE register_types (
                    id SERIAL PRIMARY KEY,
                    company_id INTEGER NOT NULL REFERENCES companies(id),
                    key VARCHAR NOT NULL,
                    display_name VARCHAR NOT NULL,
                    field_config JSON NOT NULL,
                    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """))

    if "document_entries" in inspector.get_table_names():
        entry_columns = {c["name"] for c in inspector.get_columns("document_entries")}
        with engine.begin() as connection:
            if "custom_fields" not in entry_columns:
                connection.execute(text(
                    "ALTER TABLE document_entries ADD COLUMN custom_fields JSON NOT NULL DEFAULT '{}'"
                ))


DEFAULT_FIELD_CONFIG = [
    {"key": "nr_inregistrare", "label": "Nr Inregistrare", "source": "column", "system": True},
    {"key": "cod", "label": "Cod", "source": "column", "system": True},
    {"key": "iesire_intrare", "label": "Iesire/Intrare", "source": "column", "system": False},
    {"key": "nr_data_emitent", "label": "Nr/Data Emitent", "source": "column", "system": False},
    {"key": "nr_data_destinator", "label": "Nr/Data Destinator", "source": "column", "system": False},
    {"key": "rezumat", "label": "Rezumat", "source": "column", "system": False},
    {"key": "repartizare_dpt", "label": "Repartizare Dpt", "source": "column", "system": False},
    {"key": "mod_rezolvare", "label": "Mod Rezolvare", "source": "column", "system": False},
    {"key": "nr_pag_anexe", "label": "Nr Pag & Nr Anexe", "source": "column", "system": False},
]

DEFAULT_REGISTERS = [
    ("contracte", "Contracte"),
    ("intrari/iesiri", "Intrări / Ieșiri"),
    ("decizii/hotarari", "Decizii / Hotărâri"),
    ("facturi", "Facturi"),
    ("jurnal", "Jurnal"),
    ("inventar", "Inventar"),
    ("casa", "Casa"),
    ("unic de control", "Unic de Control"),
    ("evidenta a salariatilor", "Evidența Salariaților"),
]


def seed_default_register_types(engine) -> None:
    """One-time seed: for every company that has no register_types rows yet,
    create the 9 existing hardcoded registers as pre-locked entries."""
    import json

    inspector = inspect(engine)
    if "register_types" not in inspector.get_table_names() or "companies" not in inspector.get_table_names():
        return

    with engine.begin() as connection:
        company_ids = [row[0] for row in connection.execute(text("SELECT id FROM companies"))]
        for company_id in company_ids:
            existing = connection.execute(
                text("SELECT COUNT(*) FROM register_types WHERE company_id = :cid"),
                {"cid": company_id},
            ).scalar()
            if existing:
                continue  # this company already has custom register types configured — don't touch

            for key, display_name in DEFAULT_REGISTERS:
                connection.execute(
                    text("""
                        INSERT INTO register_types (company_id, key, display_name, field_config, is_locked, is_active)
                        VALUES (:cid, :key, :name, :config, TRUE, TRUE)
                    """),
                    {
                        "cid": company_id,
                        "key": key,
                        "name": display_name,
                        "config": json.dumps(DEFAULT_FIELD_CONFIG),
                    },
                )

def ensure_file_entry_link(engine):
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("files")]
    with engine.begin() as conn:
        if "entry_id" not in columns:
            conn.execute(text("ALTER TABLE files ADD COLUMN entry_id INTEGER REFERENCES document_entries(id)"))
        # backfill: pentru orice entry cu file_id vechi, leagă fișierul înapoi la ea
        conn.execute(text("""
            UPDATE files
            SET entry_id = document_entries.id
            FROM document_entries
            WHERE document_entries.file_id = files.id
              AND files.entry_id IS NULL
        """))

def ensure_user_department_link(engine):
    inspector = inspect(engine)
    if "user_departments" not in inspector.get_table_names():
        with engine.begin() as conn:
            conn.execute(text("""
                CREATE TABLE user_departments (
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
                    PRIMARY KEY (user_id, department_id)
                )
            """))