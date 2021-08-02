from os import environ, path
from dotenv import load_dotenv

class Config():
    TESTING = False
    SECRET_KEY = environ.get('SECRET_KEY')

class ProductionConfig(Config):
    API_URL_PREFIX = '/MathSolver/api'
    STATIC_FOLDER = None
    STATIC_URL_PATH = None

class DevelopmentConfig(Config):
    API_URL_PREFIX = '/api'

class TestingConfig(Config):
    TESTING = True

load_dotenv()