from flask import render_template
from flask import request
from flask import redirect
from flask import url_for
from nanoid import generate
import json
from . import home
from slotsync import db
from slotsync import models

@home.route("/")
def create():
    meeting_id = get_shared_id()
    share_url = request.base_url + meeting_id
    return render_template("create.html", share_url=share_url,
        meeting_id=meeting_id)

@home.route("/<meeting_id>")
def view(meeting_id):
    meeting = db.db_session.query(models.Meeting).filter(
        models.Meeting.id == meeting_id).first()
    if meeting:
        config = json.loads(meeting.config)
        # remove sensitive information before sending to viewer
        del config["email"]
        return render_template("view.html", config=config)
    else:
        return create()

def get_shared_id():
    return generate("0123456789abcdefghijklmnopqrstuvwxyz", 7)
