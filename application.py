import boto3

from boto3.dynamodb.conditions import Key
from flask import Flask, render_template, request, redirect
from datetime import datetime, timezone, timedelta
from decimal import Decimal


application = Flask(__name__)

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
sudoku_leaderboard = dynamodb.Table('sudoku-leaderboard')








# work with dynamodb

# add an item
def addItemToTable(itemLevel, itemFinished, itemTime, itemName):
    response = sudoku_leaderboard.put_item(
        Item = {
            'level': itemLevel, # partition key
            'finished': itemFinished, # sort key
            'time': itemTime,
            'name': itemName,
        }
    )

# return all items for in a level
# level: 'easy' / 'medium' / 'hard'
def getAllLevelItemsFromTable(level):
    response = sudoku_leaderboard.query(
        KeyConditionExpression = Key('level').eq(level)
    )

    return response['Items']

# return an item that matches level and finished
# returns None if not found, can be checked with == None
def getItemFromTable(itemLevel, itemFinished):
    response = sudoku_leaderboard.get_item(
        Key={
            'level': itemLevel,
            'finished': itemFinished
        }
    )

    return response.get('Item')








# leaderboard functions

# sort and format leaderboard content
def prepareLeaderboard(content):
    # sort by time, finished
    content = sorted(content, key=lambda x: (x['time'], x['finished']))

    # format time hh:mm:ss.fff (only when time < 24 hours)
    for i in range(len(content)):
        content[i]['time'] = str(timedelta(milliseconds=int(content[i]['time'])))[:-3].rjust(12, '0')

    return content

def addToLeaderboard(formName, formLevel, formTime, formFinished):
    formName = formName.upper()

    # add extra bit to prevent overwriting the existing value
    extra = "000"
    newFinished = formFinished + " " + extra

    successful = False

    while (not successful):
        if (getItemFromTable(formLevel, newFinished) == None):
            addItemToTable(formLevel, newFinished, formTime, formName.upper())
            successful = True
        else:
            # change the last bit - "000" to "001"
            extra = str(int(extra) + 1).rjust(3, '0')
            newFinished = formFinished + " " + extra

def getLeaderboardByLevel(level):
    content = getAllLevelItemsFromTable(level)
    content = prepareLeaderboard(content)

    return content









# redirect sudoku

@application.route('/')
@application.route('/sudoku/')
@application.route('/sudoku/easy/')
def sudokuEasyRedirect():
    return redirect("/sudoku/easy")

@application.route('/sudoku/medium/')
def sudokuMediumRedirect():
    return redirect("/sudoku/medium")

@application.route('/sudoku/hard/')
def sudokuHardRedirect():
    return redirect("/sudoku/hard")

# render sudoku

@application.route('/sudoku/easy')
def sudokuEasy():
    return render_template('game.html', lightmode=True, page="sudoku")

@application.route('/sudoku/medium')
def sudokuMedium():
    return render_template('game.html', lightmode=True, page="sudoku")

@application.route('/sudoku/hard')
def sudokuHard():
    return render_template('game.html', lightmode=True, page="sudoku")









# redirect leaderboard

@application.route('/leaderboard/easy/')
def leaderboardEasyRedirect():
    return redirect("/leaderboard/easy")

@application.route('/leaderboard/medium/')
def leaderboardMediumRedirect():
    return redirect("/leaderboard/medium")

@application.route('/leaderboard/hard/')
def leaderboardHardRedirect():
    return redirect("/leaderboard/hard")

# render leaderboard

@application.route('/leaderboard/', methods=["GET", "POST"])
def leaderboard():
    if request.method == "POST":
        formName = request.form['name'] # will be changed to uppercase in the other function
        formLevel = request.form['level']
        formTime = request.form['time-taken']
        formFinished = str(datetime.now(timezone.utc))[:-6] # yyyy-mm-dd hh:mm:ss.ffffff

        addToLeaderboard(formName, formLevel, formTime, formFinished)

        if formLevel == 'easy':
            return redirect("/leaderboard/easy")
        elif formLevel == 'medium':
            return redirect("/leaderboard/medium")
        else:
            return redirect("/leaderboard/hard")

    return redirect("/leaderboard/easy")

@application.route('/leaderboard/easy')
def leaderboardEasy():
    content = getLeaderboardByLevel('easy')

    return render_template('leaderboard.html', lightmode=False, table=content, page="leaderboard")

@application.route('/leaderboard/medium')
def leaderboardMedium():
    content = getLeaderboardByLevel('medium')

    return render_template('leaderboard.html', lightmode=False, table=content, page="leaderboard")

@application.route('/leaderboard/hard')
def leaderboardHard():
    content = getLeaderboardByLevel('hard')

    return render_template('leaderboard.html', lightmode=False, table=content, page="leaderboard")









if __name__ == '__main__':
    application.run(host='0.0.0.0', debug=True, port=8080)
    # application.run()
