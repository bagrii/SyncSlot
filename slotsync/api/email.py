from flask import current_app as app
import flask
from flask_mail import Message
from flask_mail import Mail
from threading import Thread

def send_email(subject, sender, recipients, body):
    def send_async_email(msg, app):
        with app.app_context():
            mail = Mail(app)
            mail.send(msg)

    msg = Message(subject,
                  sender=sender,
                  recipients=recipients)
    msg.body = body
    Thread(target=send_async_email, args=(msg, app._get_current_object())).start()
