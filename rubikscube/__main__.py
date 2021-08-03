from rubikscube import bot
from os import environ
import os
from flask import Flask, session
from rubikscube import api, config
from rubikscube.app import RubiksApp

import threading

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

    app.create_bot(config_obj.BOT_TOKEN, 'q')

    return app

if __name__ == '__main__':

    flask_app = create_app()

    flask_thread = threading.Thread(target=flask_app.run, kwargs={'host': '127.0.0.1', 'port': 5000, 'debug': True, 'use_reloader': False}, daemon=True)
    flask_thread.start()

    flask_app.run_bot()