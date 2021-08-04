from os import environ
from flask import Flask, session
from rubikscube import api, config, events
from rubikscube.app import RubiksApp

from flask_socketio import SocketIO

socketio = SocketIO(logger=True, engineio_logger=True)


def create_app():
    # setting static url path and folder in preferences doesn't work properly...
    # this is anyway set to None if the production env is loaded, so it's ok.
    app = RubiksApp(__name__, static_url_path='', static_folder='static/')
    config_obj = None
    if environ.get('FLASK_ENV') == 'development':
        config_obj = config.Config()
        print("Loaded development config")
    else:
        config_obj = config.ProductionConfig()
        print("Loaded production config")

    app.config.from_object(config_obj)
    #app.register_blueprint(api.bp, url_prefix=config_obj.API_URL_PREFIX)

    socketio.init_app(app)
    socketio.on_namespace(events.BotNamespace(app, '/bot'))
    socketio.on_namespace(events.FrontendNamespace(app, '/frontend'))

    return app