from os import environ, path
from dotenv import load_dotenv, find_dotenv

load_dotenv()

class Config(object):
    TESTING = False
    SECRET_KEY = environ.get('SECRET_KEY')
    BOT_TOKEN = environ.get('BOT_TOKEN')
    NUM_TEAMS = int(environ.get('NUM_TEAMS'))
    QUESTION_FILE = environ.get('QUESTION_FILE')

class ProductionConfig(Config):
    STATIC_FOLDER = None
    STATIC_URL_PATH = None

class TestingConfig(Config):
    TESTING = True

