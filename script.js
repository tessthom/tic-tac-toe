/**
 * Tic Tac Toe Game
 * This script implements a simple Tic Tac Toe game using the module pattern.
 */
/**
 * Tic Tac Toe Game
 * This script implements a simple Tic Tac Toe game using the module pattern.
 */

// IIFE to encapsulate the entire game and avoid global scope pollution
(function() {
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

    const getPlayerScores = () => [players[0].getScore(), players[1].getScore()];

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
      let gameState = {
        isValidMove: Gameboard.isSquareAvailable(row, col),
        isWinner: false,
        isTie: false,
        currentPlayer: getCurrentPlayer(),
      };

      // if square available...
      if (gameState.isValidMove) {
        // update marker
        Gameboard.placeMarker(row, col, gameState.currentPlayer.marker);

        // check for winner or tie
        gameState.isWinner = checkForWinner(row, col);
        gameState.isTie = checkForTie();

        if (gameState.isWinner) { 
          gameState.currentPlayer.addPoint(); 
        }

        if (!gameState.isWinner && !gameState.isTie) {
          switchTurns();
          gameState.currentPlayer = getCurrentPlayer();
        }
      }

      return gameState;
    };

    // Initial board render
    Gameboard.resetBoard();

    return {
      getCurrentPlayer,
      getPlayerScores,
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
      const playScreenHeading = document.querySelector('.play-screen-heading');
      // playScreenHeading.classList.remove('show');
      playScreenHeading.classList.add('animate');
      
      setTimeout(() => {
        playScreenHeading.textContent = `${message}`;
        playScreenHeading.classList.remove('animate');
        playScreenHeading.classList.add('show-result');
      }, 1000);

      setTimeout(() => {
        playScreenHeading.textContent = `tic tac toe`;
        playScreenHeading.classList.remove('show-result');
      }, 4500);
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

      // Display player's turn indicator
      console.log(`current player's marker is: ${currentPlayer.marker}`);
      if (currentPlayer.marker === 1) {
        document.querySelector('.player-one-indicator').classList.add('show');
        document.querySelector('.player-two-indicator').classList.remove('show');
      } else {
        document.querySelector('.player-two-indicator').classList.add('show');
        document.querySelector('.player-one-indicator').classList.remove('show');
      }

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

      const gameState = GameController.playRound(+selectedRow, +selectedCol);

      if (gameState.isValidMove) {
        updateScreen();
        const { isWinner, isTie, currentPlayer } = gameState;
        if (isWinner) {
          displayRoundResult(`${currentPlayer.name.toUpperCase()} WINS!`);
          // delay for score update + board reset v slider timing
          setTimeout(() => {
            updatePlayerScores(...GameController.getPlayerScores());
            Gameboard.resetBoard();
            updateScreen();
          }, 3500);

          return;
        } else if (isTie) {
          // displayTieMessage();
          displayRoundResult(`It's a tie. No points no gods no masters.`);
          // delay for reset v slider timing
          setTimeout(() => {
            Gameboard.resetBoard();
            updateScreen();
          }, 2000);
          return;
        } 
      }

      updateScreen();
    }

    // Add event listener to board DOM element and pass handleBoard to it
    boardDiv.addEventListener('click', handleBoard);

    // Get name inputs and update Controller with them
    document.querySelector('.title-screen-form').addEventListener('submit', handleNameSubmit);

    return {
      updatePlayerScores,
      displayRoundResult,
      updateScreen,
    }
  })();
  
})(); // End of IIFE