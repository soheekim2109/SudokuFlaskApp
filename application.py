from flask import Flask, render_template
application = Flask(__name__)

@application.route('/')
def root():
#     return render_template('index.html')

# @application.route('/sudoku')
# def sudoku():
    return render_template('sudoku.html')

@application.route('/easy')
def easy():
    return render_template('sudoku.html')

@application.route('/medium')
def medium():
    return render_template('sudoku.html')

@application.route('/hard')
def hard():
    return render_template('sudoku.html')

if __name__ == '__main__':
    application.run(host='0.0.0.0', debug=True, port=8080)
    # application.run()
