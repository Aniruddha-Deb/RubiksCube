from os import environ
from flask import Flask, session
from rubikscube import config, events
from rubikscube.app import RubiksApp

from flask_socketio import SocketIO

socketio = SocketIO(logger=True, engineio_logger=True)


def create_app():
    config_obj = None
    if environ.get('FLASK_ENV') == 'development':
        config_obj = config.Config()
        print("Loaded development config")
    else:
        config_obj = config.ProductionConfig()
        print("Loaded production config")

    # setting static url path and folder in preferences doesn't work properly...
    # this is anyway set to None if the production env is loaded, so it's ok.
    app = RubiksApp(__name__, config_obj, static_url_path='', static_folder='static/')
    app.config.from_object(config_obj)

    socketio.init_app(app)
    socketio.on_namespace(events.BotNamespace(app, '/bot'))
    socketio.on_namespace(events.FrontendNamespace(app, '/frontend'))

    return app