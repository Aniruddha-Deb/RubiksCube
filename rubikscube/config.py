from os import environ, path
from dotenv import load_dotenv, find_dotenv

print(load_dotenv())
print("dotenv loaded")

class Config(object):
    TESTING = False
    SECRET_KEY = environ.get('SECRET_KEY')
    BOT_TOKEN = environ.get('BOT_TOKEN')

class ProductionConfig(Config):
    STATIC_FOLDER = None
    STATIC_URL_PATH = None

class TestingConfig(Config):
    TESTING = True

