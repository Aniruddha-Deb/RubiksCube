from os import environ
from flask import Flask, session
from rubikscube import config, model
import threading, queue, asyncio

class RubiksApp(Flask):

    def __init__(self, config_obj, num_teams, *args, **kwargs):
        super().__init__(name, *args, **kwargs)

        num_teams = config_obj.NUM_TEAMS
        question_file = config_obj.QUESTION_FILE
        self.quiz = model.Quiz(num_teams, question_file)