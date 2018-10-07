try:
    from . import pswd
    MAIL_PASSWORD = pswd.MAIL_PASSWORD
except ImportError:
    raise ValueError("No email password was specified.")
MAIL_SERVER = ""
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = ""
DATABASE = "events.db"
DEBUG=True
