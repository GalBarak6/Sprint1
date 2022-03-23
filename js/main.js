'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gBoard
var gFirstClick = true
var gTimerInterval
var gStartTime = 0
var gIsWin = null
var gLevel = {
    SIZE: 4,
    MINES: 2
}


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    SecsPassed: 0
}


// Onload
function init() {
    gBoard = buildBoard()
    setMinesNegCount(gBoard)
    renderBoard(gBoard)
    gFirstClick = true
    gGame.isOn = true
    gStartTime = 0
}


// Building our model board
function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 4,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    // addRandMines(gLevel.MINES, board)
    board[1][1].isMine = true
    board[2][3].isMine = true
    return board
}


// Rendering the board to HTML shape
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var className = 'cell';
            if (cell.isMine) {
                cell = MINE
                className += ' mine'
            } else if (!cell.minesAroundCount) {
                cell = ''
                className += ' empty'
            } else {
                cell = cell.minesAroundCount
                className += ' num'
            }
            strHTML += `<td class=" ${className} " data-i="${i}" data-j="${j}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"> <span>${cell}</span></td>`
        }
        strHTML += '</tr>'
    }
    var elCells = document.querySelector('.cells');
    elCells.innerHTML = strHTML;
}


//setting the num of neighbours by running countNeighbors on each cell on the board
function setMinesNegCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            cell.minesAroundCount = countNeighbors(i, j, board)
        }
    }
}



// count the neighbours around a specific cell
function countNeighbors(cellI, cellJ, board) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}


function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if(cell.isMarked) return
    if (gFirstClick) timer()
    gFirstClick = false
    var elSpan = elCell.querySelector('span')
    elSpan.style.visibility = 'visible'
    elCell.classList.add('shown')
    cell.isShown = true

    if (elCell.classList.contains('empty')) expandShown(gBoard, elCell, i, j)
    if (cell.isMine) {
        exposeAllMines()
        gIsWin = false
        checkGameOver()
    }
}


function cellMarked(elCell, i, j) {
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);

    var cell = gBoard[i][j]
    var elSpan = elCell.querySelector('span')
    console.log(elSpan.textContent);
    if (cell.isShown) return
    if (cell.isMarked) {
        elSpan.style.visibility = 'hidden'
        if (elCell.classList.contains('.empty')) {
            elSpan.textContent = ''
        } else if (elCell.classList.contains('.mine')) {
            elSpan.textContent = MINE
        } else {
            elSpan.textContent = cell.minesAroundCount
        }
    } else {
        console.log(elSpan.textContent);
        elSpan.textContent = FLAG
        elSpan.style.visibility = 'visible'
    }

    cell.isMarked = !cell.isMarked
}


function checkGameOver() {
    if (!gIsWin) {
        gGame.isOn = false
        openModal()
        stopTimer()
        return
    }
}


function expandShown(board, elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;

            renderCell(i, j, 'visible', 'shown')
            gBoard[i][j].isShown = true
            
        }
    }
}

function addRandMines(minesCount, board) {
    for (var i = 0; i < minesCount; i++) {
        board[getRandomInt(0, board.length)][getRandomInt(0, board.length)].isMine = true
    }
}


function timer() {
    var elMinutes = document.querySelector('.minutes')
    var elSeconds = document.querySelector('.seconds')
    gStartTime = Date.now()
    gTimerInterval = setInterval(function () {
        var timeDiff = Date.now() - gStartTime
        var currTime = new Date(timeDiff)
        elSeconds.innerText = pad(currTime.getSeconds())
        elMinutes.innerText = pad(currTime.getMinutes())
    }, 1000);

}

function stopTimer() {
    clearInterval(gTimerInterval)
}


function exposeAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) renderCell(i, j, 'visible', 'shown')
        }
    }
}


function openModal() {
    var elModal = document.querySelector('.modal')
    if (!gIsWin) {
        elModal.innerText = 'You Lost!'
        elModal.style.visibility = 'visible'
    } else {
        elModal.innerText = 'You Won!'
        elModal.style.visibility = 'visible'
    }
}

function closeModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.visibility = 'hidden'
}


function restart() {

}


function difficultyLevels(elBtn) {
    if (elBtn.classList.contains('level1')) {
        gLevel.SIZE = 4
        gLevel.MINES = 2
    } else if (elBtn.classList.contains('level2')) {
        gLevel.SIZE = 8
        gLevel.MINES = 12
    } else {
        gLevel.SIZE = 12
        gLevel.MINES = 30
    }
    init()
}

