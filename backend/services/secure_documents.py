import hashlib
import hmac
import os
import secrets
from typing import Tuple

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


KDF_ITERATIONS = int(os.getenv("SECURE_DOCUMENTS_KDF_ITERATIONS", "600000"))


def _get_pepper() -> bytes:
    pepper = os.getenv("SECURE_DOCUMENTS_PEPPER") or os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY")
    if not pepper:
        raise RuntimeError("SECURE_DOCUMENTS_PEPPER or JWT_SECRET must be configured")
    return pepper.encode("utf-8")


def normalize_access_code(code: str) -> str:
    return "".join(character for character in code.strip().upper() if character.isalnum())


def generate_access_code() -> str:
    raw_code = secrets.token_hex(16).upper()
    return "-".join(raw_code[index:index + 4] for index in range(0, len(raw_code), 4))


def hash_access_code(code: str, company_id: int) -> str:
    normalized = normalize_access_code(code)
    payload = f"{company_id}:{normalized}".encode("utf-8")
    return hmac.new(_get_pepper(), payload, hashlib.sha256).hexdigest()


def derive_key(code: str, salt: bytes) -> bytes:
    normalized = normalize_access_code(code).encode("utf-8")
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=KDF_ITERATIONS,
    )
    return kdf.derive(normalized)


def encrypt_document(plaintext: bytes, code: str) -> Tuple[bytes, bytes, bytes]:
    salt = secrets.token_bytes(16)
    nonce = secrets.token_bytes(12)
    key = derive_key(code, salt)
    ciphertext = AESGCM(key).encrypt(nonce, plaintext, None)
    return ciphertext, salt, nonce


def decrypt_document(ciphertext: bytes, code: str, salt_hex: str, nonce_hex: str) -> bytes:
    salt = bytes.fromhex(salt_hex)
    nonce = bytes.fromhex(nonce_hex)
    key = derive_key(code, salt)
    return AESGCM(key).decrypt(nonce, ciphertext, None)