import os
import boto3

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
    region_name=os.getenv("AWS_REGION")
)
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

def upload_file_to_s3(file, s3_key: str):
    s3_client.upload_fileobj(file, BUCKET_NAME, s3_key)

def generate_download_url(s3_key: str, expires_in: int = 900) -> str:
    return s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': BUCKET_NAME, 'Key': s3_key},
        ExpiresIn=expires_in
    )

def delete_file_from_s3(s3_key:str):
    return s3_client.delete_object(Bucket=BUCKET_NAME, Key=s3_key)