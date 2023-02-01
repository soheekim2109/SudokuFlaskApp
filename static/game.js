'use strict'

// html elements
var sudokuTimer
var sudokuGameplayContainer
var sudokuBoardContainer
var sudokuBoardItems
var sudokuInputmodeItems
var sudokuInputItems
var sudokuMemoItems
var sudokuClearButton
var sudokuCheckButton
var sudokuGameoverResult

var sudokuStartTimestamp
var sudokuTimerInterval
var sudokuTimeTaken
var oneday = 86400000

var sudokuLevel
var sudokuPuzzle

var sudokuInputmode // true - full, false - memo
var sudokuSelectedBoardItem // current html element selected
    // .getAttribute()
    // "sudokuI" : i position
    // "sudokuJ" : j position
    // "sudokuBox" : [0-8]
    // "sudokuEditable" : 'true' or 'false'

var sudokuGameover





window.addEventListener('load', function () {
    // remove /sudoku/
    sudokuLevel = window.location.pathname.substring(8).replace('/','')
    if (sudokuLevel == '') {
        sudokuLevel = 'easy'
    }
    getSudokuElements()

    createSudokuBoardItems()
    generateSudoku()
    sudokuStartTimestamp = Date.now()
    sudokuTimerInterval = setInterval(updateSudokuTimer, 1000)
    sudokuInputmode = true
    sudokuGameover = false

    resizeSudokuItemsToSquare()


    highlightSudokuLevelBar()
    resizeSudokuLevelBar()
})

window.addEventListener('resize', function () {
    resizeSudokuItemsToSquare()
    resizeSudokuLevelBar()
})

document.addEventListener('keydown', function(e) {
    if (1 <= e.key && e.key <= 9) {
        sudokuInputItemWithKeyboard(e.key)
    }

    if (e.key == 'Backspace' || e.key == 'Delete') {
        sudokuInputClear()
    }
})





function askBeforeNewGame() {
    return confirm('Your progress will be lost. Continue?')
}

function highlightSudokuLevelBar() {
    if (sudokuLevel == 'easy') { document.getElementById('sudoku-level-easy').classList.add('sudoku-level-active') }
    if (sudokuLevel == 'medium') { document.getElementById('sudoku-level-medium').classList.add('sudoku-level-active') }
    if (sudokuLevel == 'hard') { document.getElementById('sudoku-level-hard').classList.add('sudoku-level-active') }
}

function resizeSudokuLevelBar() {
    document.getElementById('sudoku-level-container').style.fontSize = sudokuBoardItems[0].clientWidth*0.4 + "px"
}

function getSudokuElements() {
    sudokuTimer = document.getElementById('sudoku-timer')

    sudokuGameplayContainer = document.getElementById('sudoku-gameplay-container')

    sudokuBoardContainer = document.getElementById('sudoku-board-container')
    sudokuBoardItems = document.getElementsByClassName('sudoku-board-item')

    sudokuInputmodeItems = document.getElementsByClassName('sudoku-inputmode-item')

    sudokuInputItems = document.getElementsByClassName('sudoku-input-item')

    sudokuMemoItems = document.getElementsByClassName('sudoku-memo-item')

    sudokuClearButton = document.getElementById('sudoku-clear-button')
    sudokuCheckButton = document.getElementById('sudoku-check-button')

    sudokuGameoverResult = document.getElementsByClassName('sudoku-gameover-result')
}

// setup sudoku board
function createSudokuBoardItems() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let boardItem = document.createElement("div")
            boardItem.classList.add('sudoku-board-item')
            boardItem.setAttribute("sudokuEditable", true)
            boardItem.setAttribute("sudokuI", i)
            boardItem.setAttribute("sudokuJ", j)
            if (0<=i&&i<=2 && 0<=j&&j<=2) { boardItem.setAttribute("sudokuBox", 0) }
            else if (0<=i&&i<=2 && 3<=j&&j<=5) { boardItem.setAttribute("sudokuBox", 1) }
            else if (0<=i&&i<=2 && 6<=j&&j<=8) { boardItem.setAttribute("sudokuBox", 2) }
            else if (3<=i&&i<=5 && 0<=j&&j<=2) { boardItem.setAttribute("sudokuBox", 3) }
            else if (3<=i&&i<=5 && 3<=j&&j<=5) { boardItem.setAttribute("sudokuBox", 4) }
            else if (3<=i&&i<=5 && 6<=j&&j<=8) { boardItem.setAttribute("sudokuBox", 5) }
            else if (6<=i&&i<=8 && 0<=j&&j<=2) { boardItem.setAttribute("sudokuBox", 6) }
            else if (6<=i&&i<=8 && 3<=j&&j<=5) { boardItem.setAttribute("sudokuBox", 7) }
            else if (6<=i&&i<=8 && 6<=j&&j<=8) { boardItem.setAttribute("sudokuBox", 8) }
            boardItem.addEventListener("click", function() {
                sudokuBoardItemOnClick(this)
            })

            // thick board line (gap)
            if (j==2 || j==5) {
                boardItem.classList.add('sudoku-board-item-margin-right')
            }
            if (i==2 || i==5) {
                boardItem.classList.add('sudoku-board-item-margin-bottom')
            }

            let textBox = document.createElement('div')
            textBox.classList.add('sudoku-centred-text')
            boardItem.appendChild(textBox)
            
            let memoContainer = document.createElement('div')
            memoContainer.classList.add('sudoku-memo-container')
            for (let k = 0; k < 9; k++) {
                let memoItem = document.createElement('div')
                memoItem.classList.add('sudoku-memo-item')
                memoItem.innerText = k+1
                memoContainer.appendChild(memoItem)
            }
            boardItem.appendChild(memoContainer)

            sudokuBoardContainer.appendChild(boardItem)
        }
    }
}

// resize to squares, change font size
function resizeSudokuItemsToSquare() {
    // set sudoku-everything

    var windowRatio = 2.5
    var sudokuEverythingRatio = 2.1
    var minimumPaddingWidth = 10
    
    if (window.innerHeight / window.innerWidth > windowRatio) {
        document.getElementsByTagName('body')[0].style.padding = '0 10px'
    } else {
        let sidePaddingWidth = window.innerWidth - (window.innerHeight / sudokuEverythingRatio)
        sidePaddingWidth /= 2
        if (sidePaddingWidth < minimumPaddingWidth) {
            sidePaddingWidth = minimumPaddingWidth
        }

        document.getElementsByTagName('body')[0].style.padding = '0 ' + sidePaddingWidth + 'px'
    }


    // set each element to squares

    let boardWidth
    let inputWidth
    boardWidth = sudokuBoardItems[0].clientWidth
    inputWidth = sudokuInputItems[0].clientWidth

    for (let i = 0; i < sudokuInputItems.length; i++) {
        sudokuInputItems[i].style.height = inputWidth + "px"
        sudokuInputItems[i].firstElementChild.style.fontSize = inputWidth*0.65 + "px"
    }

    for (let i = 0; i < sudokuInputmodeItems.length; i++) {
        sudokuInputmodeItems[i].style.width = boardWidth + "px"
        sudokuInputmodeItems[i].style.height = boardWidth + "px"
    }
    sudokuInputmodeItems[0].firstElementChild.style.fontSize = boardWidth*0.65 + "px"
    
    for (let i = 0; i < sudokuMemoItems.length; i++) {
        sudokuMemoItems[i].style.fontSize = boardWidth*0.28 + "px"
    }

    sudokuTimer.style.fontSize = boardWidth*0.34 + "px"

    sudokuClearButton.firstElementChild.style.width = inputWidth*0.74 + "px"
    sudokuClearButton.firstElementChild.style.height = inputWidth*0.74 + "px"

    sudokuCheckButton.style.fontSize = inputWidth*0.4 + "px"

    sudokuGameoverResult[0].style.fontSize = boardWidth*0.8 + "px"
    sudokuGameoverResult[1].style.fontSize = boardWidth*0.8 + "px"

    setTimeout(function (){
        for (let i = 0; i < sudokuBoardItems.length; i++) {
            sudokuBoardItems[i].style.height = boardWidth + "px"
            sudokuBoardItems[i].firstElementChild.style.fontSize = boardWidth*0.65 + "px"
        }
    }, 100)
}

// fill in numbers in the board
function generateSudoku() {
    // // using sudoku api
    // fetch("https://sugoku2.herokuapp.com/board?difficulty=easy")
    // .then((response) => {
    //     return response.json()
    // })
    // .then((data) => {
    //     sudokuPuzzle = data.board
    //     for (let i = 0; i < sudokuBoardItems.length; i++) {
    //         let posI = sudokuBoardItems[i].getAttribute("sudokuI")
    //         let posJ = sudokuBoardItems[i].getAttribute("sudokuJ")
    //         let valueFromAPI = sudokuPuzzle[posI][posJ]
            
    //         if (valueFromAPI != 0) {
    //             sudokuBoardItems[i].firstElementChild.innerText = valueFromAPI
    //             sudokuBoardItems[i].setAttribute("sudokuEditable", false)
    //         }
    //     }
    // })

    // using sudoku.js
    if (sudokuLevel == 'easy') {
        sudokuPuzzle = sudoku.board_string_to_grid(sudoku.generate('easy'))
    } else if (sudokuLevel == 'medium') {
        sudokuPuzzle = sudoku.board_string_to_grid(sudoku.generate('hard'))
    } else if (sudokuLevel == 'hard') {
        sudokuPuzzle = sudoku.board_string_to_grid(sudoku.generate('very-hard'))
    }

    for (let i = 0; i < sudokuBoardItems.length; i++) {
        let posI = sudokuBoardItems[i].getAttribute("sudokuI")
        let posJ = sudokuBoardItems[i].getAttribute("sudokuJ")
        let valueFromAPI = sudokuPuzzle[posI][posJ]
        
        if (valueFromAPI != '.') {
            sudokuBoardItems[i].firstElementChild.innerText = valueFromAPI
            sudokuBoardItems[i].setAttribute("sudokuEditable", false)
        }
    }
}






// timeTaken in milliseconds
// returns "0 hours, 0 minutes, 0 seconds" or ">= 1 day"
function formatDuration(timeTaken) {
    let formatted = ""

    if (timeTaken < oneday) {
        let hours = Math.floor(timeTaken / 3600000)
        let minutes = Math.floor((timeTaken % 3600000) / 60000)
        let seconds = Math.floor((timeTaken % 60000) / 1000)

        if (hours != 0) {
            if (hours == 1) formatted += hours + " hour"
            else formatted += hours + " hours"
        }
        if (hours != 0 && minutes != 0) formatted += ", "
        if (minutes != 0) {
            if (minutes == 1) formatted += minutes + " minute"
            else formatted += minutes + " minutes"
        }
        if ((hours != 0 && seconds != 0) || (minutes != 0 && seconds != 0)) formatted += ", "
        if (seconds != 0) {
            if (seconds == 1) formatted += seconds + " second"
            else formatted += seconds + " seconds"
        }
    } else {
        formatted = ">= 1 day"
    }

    return formatted
}

function updateSudokuTimer() {
    let currentTimeStamp = Date.now()
    sudokuTimeTaken = currentTimeStamp - sudokuStartTimestamp

    sudokuTimer.innerText = "Time taken: " + formatDuration(sudokuTimeTaken)
}








// handle board click
function sudokuBoardItemOnClick(item) {
    if (!sudokuGameover) {
        if (item.getAttribute("sudokuEditable") == 'true') {
            if (sudokuSelectedBoardItem != undefined) {
                sudokuSelectedBoardItem.classList.remove('sudoku-board-item-selected')
            }
            sudokuSelectedBoardItem = item
            sudokuSelectedBoardItem.classList.add('sudoku-board-item-selected')
        }
    }
}

// handle input mode click
function sudokuInputmodeItemOnClick(modeType) {
    if (!sudokuGameover) {
        if (modeType == 'full') {
            sudokuInputmode = true
            sudokuInputmodeItems[0].classList.add('sudoku-inputmode-selected')
            sudokuInputmodeItems[1].classList.remove('sudoku-inputmode-selected')
        } else {
            sudokuInputmode = false
            sudokuInputmodeItems[0].classList.remove('sudoku-inputmode-selected')
            sudokuInputmodeItems[1].classList.add('sudoku-inputmode-selected')
        }
    }
}






// call only when sudokuSelectedBoardItem != undefined
// return sudokuSelectedBoardItem > sudoku-centred-text
function getSelectedSudokuBoardItemText() {
    return sudokuSelectedBoardItem.firstElementChild
}
// call only when sudokuSelectedBoardItem != undefined
// return sudokuSelectedBoardItem > sudoku-memo-container > 9 sudoku-memo-items
function getSelectedSudokuMemoItems() {
    return sudokuSelectedBoardItem.children[1].children
}

// handle input click
function sudokuInputItemOnClick(item) {
    if (sudokuSelectedBoardItem != undefined) {
        sudokuPutNumberOnInputItem(item.firstElementChild.innerText)
        // if (sudokuInputmode) {
        //     sudokuClearSelectedMemoItems()

        //     getSelectedSudokuBoardItemText().innerText = item.firstElementChild.innerText
        // } else {
        //     sudokuClearSelectedBoardItem()

        //     let thisMemo = getSelectedSudokuMemoItems()[item.firstElementChild.innerText - 1]
        //     if (thisMemo.style.visibility == 'visible') {
        //         thisMemo.style.visibility = 'hidden'
        //     } else {
        //         thisMemo.style.visibility = 'visible'
        //     }
        // }
    }
}

// handle keyboard input
function sudokuInputItemWithKeyboard(thisNumber) {
    if (sudokuSelectedBoardItem != undefined) {
        sudokuPutNumberOnInputItem(thisNumber)
    }
}

// put full/memo number on selected board item
function sudokuPutNumberOnInputItem(thisNumber) {
    if (sudokuInputmode) {
        sudokuClearSelectedMemoItems()

        getSelectedSudokuBoardItemText().innerText = thisNumber
    } else {
        sudokuClearSelectedBoardItem()

        let thisMemo = getSelectedSudokuMemoItems()[thisNumber - 1]
        if (thisMemo.style.visibility == 'visible') {
            thisMemo.style.visibility = 'hidden'
        } else {
            thisMemo.style.visibility = 'visible'
        }
    }
}







// call only when sudokuSelectedBoardItem != undefined
function sudokuClearSelectedBoardItem() {
    getSelectedSudokuBoardItemText().innerText = ''
}
// call only when sudokuSelectedBoardItem != undefined
function sudokuClearSelectedMemoItems() {
    let memoContainer = getSelectedSudokuMemoItems()
    for (let i = 0; i < memoContainer.length; i++) {
        memoContainer[i].style.visibility = 'hidden'
    }
}

// clear selected board item (click and keydown)
function sudokuInputClear() {
    if (sudokuSelectedBoardItem != undefined) {
        sudokuClearSelectedBoardItem()
        sudokuClearSelectedMemoItems()
    }
}








// used to check for blanks before checking the solution
function sudokuHasBlankSpaces() {
    for (let i = 0; i < sudokuBoardItems.length; i++) {
        if (sudokuBoardItems[i].firstElementChild.innerText == '') {
            return true
        }
    }
    return false
}

// checks if nine numbers are unique
function sudokuAllNineNumbersExist(nineNumbers) {
    var thisSet = new Set()

    document.querySelectorAll(nineNumbers).forEach((item) => {
        if (item.innerText != '') {
            thisSet.add(item.innerText)
        }
    })

    if (thisSet.size == 9) {
        return true
    }
    
    return false
}

// highlight wrong parts in red
function sudokuWrongHighlight(thisAttribute) {

    document.querySelectorAll(thisAttribute).forEach((item) => {
        item.classList.add('sudoku-board-item-wrong')
    })
}

// check the solution
function isSudokuCorrect() {
    var isCorrect = true

    for (let n = 0; n < 9; n++) {
        // 9 horizontal lines
        if (!sudokuAllNineNumbersExist("[sudokuI='" + n + "'] > .sudoku-centred-text")) {
            isCorrect = false
            sudokuWrongHighlight("[sudokuI='" + n + "']")
        }
        
        // 9 vertical lines
        if (!sudokuAllNineNumbersExist("[sudokuJ='" + n + "'] > .sudoku-centred-text")) {
            isCorrect = false
            sudokuWrongHighlight("[sudokuJ='" + n + "']")
        }
        
        // 9 boxes
        if (!sudokuAllNineNumbersExist("[sudokuBox='" + n + "'] > .sudoku-centred-text")) {
            isCorrect = false
            sudokuWrongHighlight("[sudokuBox='" + n + "']")
        }
    }

    return isCorrect
}

function disableSudokuPlay() {
    // remove selection highlights
    sudokuSelectedBoardItem.classList.remove('sudoku-board-item-selected')
    sudokuInputmodeItems[0].classList.remove('sudoku-inputmode-selected')
    sudokuInputmodeItems[1].classList.remove('sudoku-inputmode-selected')

    
    // disable inputs
    sudokuGameover = true
    sudokuSelectedBoardItem = undefined

    document.getElementById('sudoku-clear-button').disabled = true
    document.getElementById('sudoku-check-button').disabled = true

    // hide game play elements
    sudokuGameplayContainer.style.display = 'none'
}

function sudokuSetFormValues() {
    document.getElementById('sudoku-form-level').value = sudokuLevel
    document.getElementById('sudoku-form-timetaken').value = sudokuTimeTaken
}

function sudokuShowResult(result) {
    if (result && sudokuTimeTaken < oneday) {
        // correct and in time

        document.getElementById('sudoku-gameover-correct').style.display = 'block'
        document.getElementById('sudoku-gameover-correct-intime').style.display = 'block'

        // You took (time taken) to solve (an easy) sudoku.
        let formattedDuration = "You took " + formatDuration(sudokuTimeTaken) + " to solve "
        if (sudokuLevel == 'easy') { formattedDuration += "an easy sudoku." }
        if (sudokuLevel == 'medium') { formattedDuration += "a medium sudoku." }
        if (sudokuLevel == 'hard') { formattedDuration += "a hard sudoku." }

        document.getElementById('sudoku-result-time').innerText = formattedDuration

        sudokuSetFormValues()
    } else if (result) {
        // correct but took too long

        document.getElementById('sudoku-gameover-correct').style.display = 'block'
        document.getElementById('sudoku-gameover-correct-toolong').style.display = 'block'
        document.getElementById('sudoku-no-entry').style.display = 'block'
    } else {
        // incorrect

        document.getElementById('sudoku-gameover-incorrect').style.display = 'block'
        document.getElementById('sudoku-no-entry').style.display = 'block'
    }
}

function confirmSudokuFinish() {
    if (sudokuHasBlankSpaces()) {
        alert("You still have blank spaces!")
    } else {
        if (confirm("Ready to check?")) {
            clearInterval(sudokuTimerInterval)
            disableSudokuPlay()
            sudokuShowResult(isSudokuCorrect())
        }
    }
}




