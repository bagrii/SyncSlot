from flask import render_template
from flask import request
from flask import Response
from flask import current_app as app
from json import dumps
from jinja2 import Template
from slotsync.db import db_session
from slotsync.models import Meeting
from . import api
from . import email

import json

RESPONSE_SUCCESS = json.dumps({'success':True}), 200, {'ContentType':'application/json'}

@api.route("/create/<meeting_id>", methods=["POST"])
def update(meeting_id):
    meeting = Meeting(meeting_id, dumps(request.json))
    db_session.merge(meeting)
    db_session.commit()
    return RESPONSE_SUCCESS

@api.route("/accept/<meeting_id>", methods=["POST"])
def accept(meeting_id):
    meeting = db_session.query(Meeting).filter(
        Meeting.id == meeting_id).first()
    if meeting:
        accepted = list()
        if meeting.accepted:
            accepted = json.loads(meeting.accepted)
        accepted.append(request.json)
        meeting.accepted = json.dumps(accepted)
        db_session.merge(meeting)
        db_session.commit()
        notify_participants(meeting_id, request.json)

    return RESPONSE_SUCCESS

@api.route("/feedback", methods=["POST"])
def feedback():
    body = render_template("feedback.txt", feedback=request.json)
    email.send_email("SyncSlot: Feedback form", app.config["MAIL_USERNAME"],
                     [app.config["MAIL_USERNAME"]], body)
    return RESPONSE_SUCCESS

def notify_participants(meeting_id, accepted_info):
    # Format email body
    meeting_info = db_session.query(Meeting).filter(
        Meeting.id == meeting_id).first()
    config = json.loads(meeting_info.config)
    subject = "Accepted: {}".format(config["title"])
    sender = "SyncSlot <{}>".format(app.config["MAIL_USERNAME"])
    body = render_template("mail.txt", meeting_id=meeting_id,
                           accepted_info=accepted_info,
                           events=accepted_info["events"])
    email.send_email(subject, sender,
        [config["email"], accepted_info["email"]],
        body)
