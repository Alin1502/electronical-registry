import boto3
import os
from botocore.exceptions import ClientError

ses_client = boto3.client(
    "ses",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

FROM_EMAIL = os.getenv("SES_FROM_EMAIL")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def send_invite_email(to_email: str, company_name: str, token: str):
    invite_link = f"{FRONTEND_URL}/accept-invite?token={token}"

    subject = f"Ai fost invitat sa te alaturi {company_name} pe Regix"
    body_text = (
        f"Ai fost invitat sa te alaturi echipei {company_name} pe Regix.\n\n"
        f"Acceseaza urmatorul link pentru a-ti crea contul:\n{invite_link}\n\n"
        f"Acest link expira in 48 de ore."
    )
    body_html = f"""
    <html><body>
      <p>Ai fost invitat sa te alaturi echipei <strong>{company_name}</strong> pe Regix.</p>
      <p><a href="{invite_link}">Acceseaza acest link</a> pentru a-ti crea contul.</p>
      <p>Acest link expira in 48 de ore.</p>
    </body></html>
    """

    try:
        ses_client.send_email(
            Source=FROM_EMAIL,
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {
                    "Text": {"Data": body_text, "Charset": "UTF-8"},
                    "Html": {"Data": body_html, "Charset": "UTF-8"},
                },
            },
        )
    except ClientError as e:
        raise RuntimeError(f"Failed to send invite email: {e.response['Error']['Message']}")