import re

class Quiz:

    def __init__(self, num_teams, question_file):
        self.num_teams = num_teams
        self.question_file = question_file
        self.teams = {}
        self.questions = {}

        self.load_questions(question_file)

    def load_questions(self, question_file):
        # Rudimentary parser to load questions from question_file
        qbuffer = ""
        with open(question_file, 'r') as questions_raw:
            for l in questions_raw:
                if re.match(r'[#]{15}[#]+', l):
                    print(qbuffer)
                    question = Question(qbuffer)
                    if question.code in self.questions:
                        raise Exception("Loaded two questions with the same key. Ignoring second one")
                    else:
                        self.questions[question.code] = question
                    qbuffer = ""
                else:
                    qbuffer = qbuffer + l

    def get_question(self, qcode):
        qcode = ''.join(sorted(qcode))
        return self.questions[qcode]

    def attempted_question(self, qcode):
        qcode = ''.join(sorted(qcode))
        self.questions[qcode].attempted = True

    def add_team(self, team):
        self.teams[team.id] = team

    def remove_team(self, tno):
        self.teams.pop(tno, None)

    def get_team(self, tno):
        return self.teams[tno]

class Team:

    def __init__(self, tno, t_members):
        self.id = tno
        self.members = []
        self.curr_score = 0
        self.scores = []
        self.pounced = False
        self.bounce = False

        for member in t_members:
            self.members.append(Member(self, member))

class Member:

    def __init__(self, team, tmember):
        self.team = team
        self.name = tmember['name']
        self.discord_id = tmember['discord_id']

class Question:

    def __init__(self, q_raw):
        # rudimentary parser, yet again
        contents = re.split(r'\n---\n', q_raw)
        self.code = ''.join(sorted(contents[0].strip()))
        qa = re.split(r'[\-]{15}[\-]+', contents[1])
        self.question = qa[0].strip()
        self.answer = qa[1].strip()
        self.attempted = False

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return self.code + "{ Question {" + self.question + "}, Answer {" + self.answer + "} }"
