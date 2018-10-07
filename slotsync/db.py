import os

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from . import config

db_path = os.path.join(os.path.dirname(__file__), config.DATABASE)
db_uri = 'sqlite:///{}'.format(db_path)

engine = create_engine(db_uri, convert_unicode=True)
db_session = scoped_session(sessionmaker(autocommit=False,
                            autoflush=False,
                            bind=engine))
Base = declarative_base()

def init_db():
    from . import models

    print("Initialize database: ", db_uri)

    Base.metadata.create_all(bind=engine)
