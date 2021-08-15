from flask_socketio import Namespace, emit
from flask import request
import json
from rubikscube.model import Team

class BotNamespace(Namespace):

    def __init__(self, app, prefix):
        super().__init__(prefix)
        self.app = app

    def on_connect(self):
        print("Bot Connected")
        self.app.bot_sid = request.sid
        emit('num_teams', self.app.num_teams)

    def on_reg_teams(self, data):
        """
        Team data is in JSON: [
        {
            tno: 1,
            members: [ "discord_id_1", "discord_id_2", ...]
        },
        {
            ...
        }]
        """
        teams = json.loads(data)
        print(data)
        for team in teams:
            self.app.quiz.add_team(Team(team['tno'], team['members']))

    def on_pounce(self, data):
        """
        data json format: {
            tno: #,
            discord_id: <id>,
            pounce: <pounce text>
        }
        """
        print("Pounce by ", data)
        pounce = json.loads(data)
        self.app.quiz.get_team(pounce['tno']).register_pounce(pounce['pounce'])
        if self.app.frontend_sid:
            emit('pounce', pounce['tno'], namespace='/frontend', to=self.app.frontend_sid)

    def on_disconnect(self):
        print("Bot Disconnected")

class FrontendNamespace(Namespace):

    def __init__(self, app, prefix):
        super().__init__(prefix)
        self.app = app

    def on_connect(self):
        print("Frontend Connected")
        self.app.frontend_sid = request.sid
        emit('num_teams', self.app.num_teams)

    def on_pounce_open(self):
        self.app.quiz.pounce_open = True
        for team in self.app.quiz.teams:
            self.app.quiz.teams[team].curr_pounce = ""
            self.app.quiz.teams[team].pounced = False
            self.app.quiz.teams[team].bounce = False
        if self.app.bot_sid:
            emit('pounce_open', "", namespace='/bot', to=self.app.bot_sid)

    def on_pounce_close(self):
        self.app.quiz.pounce_open = False
        if self.app.bot_sid:
            emit('pounce_close', "", namespace='/bot', to=self.app.bot_sid)

    def on_score(self, data):
        """
        {
            tno: 1,
            curr_score: 10,
            new_score: 20,
            score_delta: 10
        }
        """
        score_data = json.loads(data)
        team = self.app.quiz.get_team(score_data['tno'])
        if score_data['curr_score'] == team.curr_score:
            team.scores.append(score_data['new_score'])
            team.new_score = score_data['new_score']
        else:
            print("CRITICAL: scores do not match")

    def on_get_question(self, data):
        """
        incoming request: just qcode
        return data format: {
            qcode: <qcode>,
            question: <question>,
            answer: <answer>
        }
        """
        question = self.app.quiz.get_question(data)
        if not question.attempted:
            response = {
                'qcode': question.code,
                'question': question.question,
                'answer': question.answer
            }
            emit('question', json.dumps(response), namespace='/frontend')
        else:
            emit('question', "ATTEMPTED", namespace='/frontend')


    def on_disconnect(self):
        print("Frontend Disconnected")