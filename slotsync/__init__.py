from flask import Flask
from htmlmin.main import minify
from .home import home
from .api import api
from . import config
from . import db

def create_app():
    app = Flask(__name__, static_folder=None)
    app.config.from_object("slotsync.config")

    app.register_blueprint(home)
    app.register_blueprint(api)

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db.db_session.remove()
    
    @app.cli.command("initdb")
    def init_db_command():
        db.init_db()
        print("Initialized database")
    
    @app.after_request
    def response_minify(response):
        if response.content_type == u'text/html; charset=utf-8':
            response.set_data(
                minify(response.get_data(as_text=True))
            )
            return response
        return response

    return app
