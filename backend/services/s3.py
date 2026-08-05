import os
import boto3
import uuid
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
    region_name=os.getenv("AWS_REGION")
)
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

def upload_file_to_s3(file, s3_key: str):
    s3_client.upload_fileobj(file, BUCKET_NAME, s3_key)

def generate_download_url(s3_key: str, expires_in: int = 300, filename: str | None = None) -> str:
    content_disposition = "inline"
    if filename:
        content_disposition = f'inline; filename="{filename}"'

    return s3_client.generate_presigned_url(
        'get_object',
        Params={
            'Bucket': BUCKET_NAME,
            'Key': s3_key,
            'ResponseContentDisposition': content_disposition,
            'ResponseContentType': 'application/pdf',
        },
        ExpiresIn=expires_in
    )

def delete_file_from_s3(s3_key:str):
    return s3_client.delete_object(Bucket=BUCKET_NAME, Key=s3_key)

def download_file_from_s3(s3_key: str) -> bytes:
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key=s3_key)
    return response["Body"].read()

def get_file_size_from_s3(s3_key: str) -> int:
    response = s3_client.head_object(Bucket=BUCKET_NAME, Key=s3_key)
    return int(response.get("ContentLength", 0))

def upload_chart_to_s3(file_bytes: bytes, user_id: int, content_type: str = "image/png") -> str:
    key = f"org-charts/{user_id}/{uuid.uuid4()}.png"
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return key

def upload_avatar_to_s3(file_bytes: bytes, user_id: int, content_type: str = "image/jpeg") -> str:
    extension = "png" if content_type == "image/png" else "jpg"
    key = f"avatars/{user_id}/{uuid.uuid4()}.{extension}"
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return key


def generate_avatar_url(s3_key: str, expires_in: int = 3600) -> str:
    return s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': BUCKET_NAME, 'Key': s3_key},
        ExpiresIn=expires_in,
    )