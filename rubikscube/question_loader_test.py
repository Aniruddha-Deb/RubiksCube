import model

if __name__ == "__main__":

    question_file = "rubikscube/questions.txt"
    num_teams = 3
    quiz = model.Quiz(num_teams, question_file)

    print(quiz.questions)