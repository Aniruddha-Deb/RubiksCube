from os import environ
from flask import Flask, session
from mathsolver import api, config

def create_app():
    # setting static url path and folder in preferences doesn't work properly...
    # this is anyway set to None if the production env is loaded, so it's ok.
    app = Flask(__name__, static_url_path='', static_folder='static/')
    config_obj = None
    if environ.get('FLASK_ENV') == 'development':
        config_obj = config.DevelopmentConfig()
        print("Loaded development config")
    else:
        config_obj = config.ProductionConfig()
        print("Loaded production config")

    app.config.from_object(config_obj)
    app.register_blueprint(api.bp, url_prefix=config_obj.API_URL_PREFIX)
    
    print(app.static_folder)
    print(app.static_url_path)
    return app