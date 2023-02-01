'use strict'

window.addEventListener('load', function () {
    highlightLevel()
})

function highlightLevel() {
    let level = window.location.pathname.substring(13).replace('/','')
    if (level == 'easy') {
        document.getElementById('leaderboard-level-easy').classList.add('current')
    }
    if (level == 'medium') {
        document.getElementById('leaderboard-level-medium').classList.add('current')
    }
    if (level == 'hard') {
        document.getElementById('leaderboard-level-hard').classList.add('current')
    }
}
