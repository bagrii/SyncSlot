from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import String
from sqlalchemy.sql import func

from . import db

class Meeting(db.Base):
    __tablename__ = 'meetings'
    id = Column(String(), primary_key=True)
    config = Column(String())
    date = Column(DateTime(timezone=True), default=func.now())
    accepted = Column(String())

    def __init__(self, id, config):
        self.id = id
        self.config = config

    def __repr__(self):
        return "<Meeting id: {} date: {}>".format(self.id, self.date)
