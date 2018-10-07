from base64 import b64decode
# at least hide from shoulder snooping
MAIL_PASSWORD = b64decode(b'eW91ciBwYXNzd29yZCBpcyBoZXJl').decode("utf-8")
