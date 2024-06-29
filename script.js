/**
 * Factory Func for board squares 
 * Returns object with a value that will be one of:
 * 0: square is empty
 * 1: playerOne
 * 2: playerTwo
 * And a method to set the value to 0, 1, or 2
 */
const Square = function () {
  // init value of square to empty 
  let value = 0;
  let marker = '';

  // call this like board[n][n].addMarker(player1), will set value to 1 or 2 depending on player arg
  const addMarker = (player) => {
    value = player;
    };
    
  const getValue = () => value;

  const getMarker = () => {
    if (value === 1) { marker = 'X' };
    if (value === 2) { marker = 'O' };
    return marker;
  }

  return {
    addMarker,
    getValue,
    getMarker,
  };
}

/**
 * Module for Gameboard
 * Stores state of board
 */
const Gameboard = (function() {
  const emptyBoard = [];
  const size = 3;
  let currBoard = makeDeepCopy(emptyBoard);

  // Init board 
  for (let i = 0; i < size; i++) {
    // create sub-array for each row
    emptyBoard[i] = [];
    // for every row, push an instance of Square
    for (let j = 0; j < size; j++) {
      emptyBoard[i].push(Square()); 
    }
  }

  function makeDeepCopy (arr) {
    return arr.map(row => row.map(square => Square()));
  }

  const resetBoard = () => {
    currBoard = makeDeepCopy(emptyBoard);
    };

  const getSize = () => size;
  
  const getBoardState = () => currBoard;

  const isSquareAvailable = (row, col) => !currBoard[row][col].getValue();

  const placeMarker = (row, col, player) => {
    currBoard[row][col].addMarker(player);
  };

  // const printBoard = () => {
  //   // map over every row in the board...
  //   const boardWithValues = currBoard.map((row) => {
  //     // then map over every square in each row, and return the player value from each
  //     return row.map((square) => square.getValue());
  //   });
  //   console.dir(boardWithValues); 
  // };

  return {
    getSize,
    getBoardState,
    isSquareAvailable,
    placeMarker,
    resetBoard,
  };
})();

/**
 * The GameController is responsible for the flow and
 * state of the game, including of the turns, and for
 * checking if either player has won the game.
 */
const GameController = (function(
  playerOneName = 'Player One', 
  playerTwoName = 'Player Two'
) {
  const createPlayer = (name, marker) => {
    let score = 0;

    return {
      name,
      marker,
      getScore: () => score,
      addPoint: () => { score += 1; },
    };
  }

  const players = [
    createPlayer('Player One', 1),
    createPlayer('Player Two', 2)
  ]

  let currentPlayer = players[0];

  const switchTurns = () => {
    currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
  };

  const getCurrentPlayer = () => currentPlayer;

  const updatePlayers = (name1, name2) => {
    players[0].name = name1;
    players[1].name = name2;
  }

  const checkForWinner = (row, col) => {
    const currBoard = Gameboard.getBoardState();
    const targetValue = currBoard[row][col].getValue();

    const checkRow = () => currBoard[row].every(cell => cell.getValue() === targetValue);

    const checkCol = () => currBoard.every(row => row[col].getValue() === targetValue);
    
    const checkDiagonal = () => {
      const size = currBoard.length;
      const mainDiagonal = currBoard.map((row, index) => row[index].getValue());
      const antiDiagonal = currBoard.map((row, index) => row[size - 1 - index].getValue());

      const isMainDiagonalWin = mainDiagonal.every(square => square === targetValue);
      const isAntiDiagonalWin = antiDiagonal.every(square => square === targetValue);

      return isMainDiagonalWin || isAntiDiagonalWin;
    }

    return checkRow() || checkCol() || checkDiagonal();
  }

  const checkForTie = () => {
    const currBoard = Gameboard.getBoardState();
    // flattened array makes it easier to iterate over values
    return currBoard.flat().every(square => square.getValue() !== 0);
  };

  const playRound = (row, col) => {
    // if square available...
    if (Gameboard.isSquareAvailable(row, col)) {
      // place marker
      Gameboard.placeMarker(row, col, getCurrentPlayer().marker);

      // check for tie
      const isTie = checkForTie(row, col);
      if (isTie) {
        GameUI.displayRoundResult(`It's a tie. No points no gods no masters.`);
        setTimeout(Gameboard.resetBoard(), 2000);
        return;
      }

      // check for win
      const isWinner = checkForWinner(row, col);
      if (isWinner) {
        console.log(`${getCurrentPlayer().name} wins!!!`);
        
        GameUI.displayRoundResult(`${getCurrentPlayer().name} wins!!!`);
          
        getCurrentPlayer().addPoint();
        // delay for UI score update to coincide with banner slide-out
        setTimeout(() => {
            GameUI.updatePlayerScores(players[0].getScore(), players[1].getScore());
            Gameboard.resetBoard();
            GameUI.updateScreen();
        }, 3000);

        return;
      }
      // If no winner yet...
      else if (!isWinner) {
        switchTurns();
        // alertPlayerOfTurn();
      }
    } else { // if square unavailable, log error, do not place marker or switch turns
      // TODO: After UI built, call a method from future UI handler to display red border flash or similar side effect if square is not empty.
      console.log(`Sorry, that square is already taken. Try again.`);
      // alertPlayerOfTurn();
    }
  };

  // Initial board render
  Gameboard.resetBoard();

  return {
    getCurrentPlayer,
    updatePlayers,
    checkForWinner,
    checkForTie,
    playRound,
  };
})();

/**
 * UI Logic
 */
const GameUI = (function() {
  // UI should only need to interact with the core game code via GameController.playRound()!
  /** 
   * Need to:
   * - display title screen to get player names
   *    - call a GameController fn to update player instances with those names
   * - display initial board and player names/scores
   * - display updated board after player move
   * - display cleared board after win or reset
   */

  const titleScreen = document.querySelector('.title-screen-container');
  const gameboardScreen = document.querySelector('.play-screen-container');
  const boardDiv = document.querySelector('.board');

  const hideTitleScreen = () => {
    titleScreen.classList.toggle('hidden');
    titleScreen.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      titleScreen.style.display = 'none';
    }, 1000);
    gameboardScreen.setAttribute('aria-hidden', 'false');
  }

  const updatePlayerNames = (name1, name2) => {
    GameController.updatePlayers(name1, name2); // share names with controller
    const playerOneSpan = document.querySelector('.player-one-name');
    const playerTwoSpan = document.querySelector('.player-two-name');
    playerOneSpan.innerText = name1;
    playerTwoSpan.innerText = name2;
  };

  const updatePlayerScores = (score1, score2) => {
    const playerOneSpan = document.querySelector('.player-one-score');
    const playerTwoSpan = document.querySelector('.player-two-score');
    playerOneSpan.innerText = score1;
    playerTwoSpan.innerText = score2;
  };

  const displayRoundResult = (message) => {
    const alertBanner = document.querySelector('.winner-container');
    const alertPara = document.querySelector('.winner-alert');
    alertPara.textContent = `${message}`;
    alertBanner.classList.add('show');

    setTimeout(() => {
      alertBanner.classList.remove('show');
    }, 2500);
  };

  const setMarkerColor = (marker) => {
    return marker === 'X' ? 'player-one' : 'player-two';
  };

  const updateScreen = () => {
    // Clear the board
    boardDiv.textContent = '';

    // Get latest board and player state
    const board = Gameboard.getBoardState();
    const currentPlayer = GameController.getCurrentPlayer();

    // Display player's turn
    const currentPlayerSpan = document.querySelector('.current-player');
    currentPlayerSpan.textContent = `${currentPlayer.name}`;

    // Render board squares
    board.forEach((row, index) => {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('board-row')
      rowDiv.dataset.row = index;
      boardDiv.appendChild(rowDiv);

      row.forEach((cell, index) => {
        // make buttons for squares because they are clickable
        const cellBtn = document.createElement('button');
        cellBtn.classList.add('cell');
        // data attribute identifies which column the cell is in,
        // which makes it easier to pass into playRound()
        cellBtn.dataset.col = index;
        cellBtn.textContent = cell.getMarker();
        // set class that controls marker color
        cellBtn.classList.add(setMarkerColor(cell.getMarker()));
        rowDiv.appendChild(cellBtn);
      });
    });
  };

  function handleNameSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const playerOneName = formData.get('player-one');
    const playerTwoName = formData.get('player-two');

    updatePlayerNames(playerOneName, playerTwoName);
    hideTitleScreen();
    updateScreen();
  }

  function handleBoard(e) {
    const selectedRow = e.target.closest('.board-row').dataset.row;
    const selectedCol = e.target.dataset.col;
    // check that col was clicked and not gap between col: 
    if (!selectedCol) return;

    GameController.playRound(+selectedRow, +selectedCol);
    updateScreen();
  }

  // Add event listener to board DOM element and pass handleBoard to it
  boardDiv.addEventListener('click', handleBoard);

  // Display title screen

  // Get name inputs and update Controller with them
  document.querySelector('.title-screen-form').addEventListener('submit', handleNameSubmit);
  // Initial render
  // updateScreen();

  return {
    updatePlayerScores,
    displayRoundResult,
    updateScreen,
  }
})();


// Test calls to insert vals at (row, col):
// GameController.playRound(0, 0);
// GameController.playRound(1, 0);
// GameController.playRound(1, 1);
// // GameController.playRound(1, 1); // this is a check for trying an unavailable square
// GameController.playRound(1, 2);
// GameController.playRound(2, 2);

/**
 * Plays to a tie
 */
// GameController.playRound(0, 0);
// GameController.playRound(0, 1);
// GameController.playRound(1, 1);
// GameController.playRound(0, 2);
// GameController.playRound(1, 2);
// GameController.playRound(1, 0);
// GameController.playRound(2, 0);
// GameController.playRound(2, 2);
// GameController.playRound(2, 1);
// console.log(GameController.checkForTie()); // true