/**
 * Tic Tac Toe
 * Store the gameboard as an array inside of a Gameboard object.
 * Store players in objects.
 * Store flow control in a Game object.
 */

/**
 * Factory Func for board squares 
 * Returns object with a method to get a value that will be one of:
 * 0: square is empty
 * 1: playerOne
 * 2: playerTwo
 * And a method to set the value to 0, 1, or 2
 */
const Square = function () {
  // init value of square to empty 
  let value = 0;

  // call this like board[n][n].addMarker(player1), will set value to 1 or 2 depending on player arg
  const addMarker = (player) => {
    value = player;
    };
    
  const getValue = () => value;

  return {
    addMarker,
    getValue,
  };
}

/**
 * Module for Gameboard
 * needs to store state of board
 * Fn to init board as array of object. Each el is instance of Square(), which returns an object that has 2 methods: 1 to change state of square, one to get value of square.
 * Fn that checks if square is empty, updates square if it is. Should take col, row, marker.
 * Fn that prints board
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
  
  const getCurrBoard = () => currBoard;

  const isSquareAvailable = (row, col) => !currBoard[row][col].getValue();

  const placeMarker = (row, col, player) => {
    currBoard[row][col].addMarker(player);
  };

  const printBoard = () => {
    // map over every row in the board...
    const boardWithValues = currBoard.map((row) => {
      // then map over every square in each row, and return the player value from each
      return row.map((square) => square.getValue());
    });
    console.dir(boardWithValues); // TODO: THIS IS WHAT IS INITIALLY PRINTING BOARD FOR CONSOLE VERSION. MAKE IT A CALL TO THE UI HANDLING ONCE BUILT
  };

  // Return object with fn to get board state, check for valid move, update board based on player moves:
  return {
    size,
    getCurrBoard,
    isSquareAvailable,
    placeMarker,
    printBoard,
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
    let score = 0; // private

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
  // TODO: Move to future UI obj
  const alertPlayerOfTurn = () => {
    console.log(`It's ${getCurrentPlayer().name}'s turn.`);
  };

  const getCurrentPlayer = () => currentPlayer;

  const printNewRound = () => {
    Gameboard.resetBoard();
    Gameboard.printBoard();
    // alert player it's their turn
    // TODO: Move to future UI obj
    console.log(`NEW ROUND: Okay ${getCurrentPlayer().name}, it's your turn.`);
  };

  const checkForWinner = (row, col) => {
    const currBoard = Gameboard.getCurrBoard();
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
    const currBoard = Gameboard.getCurrBoard();
    // flattened array makes it easier to iterate over values
    return currBoard.flat().every(square => square.getValue() !== 0);
  };

  const playRound = (row, col) => {
    // place current player marker - updates value of square to 1 or 2, or returns if square unavailable
    console.log(`Placing ${getCurrentPlayer().name}'s marker, ${getCurrentPlayer().marker}, into the square at row ${row}, column ${col}...`);
    // if square available...
    if (Gameboard.isSquareAvailable(row, col)) {
      // place marker
      Gameboard.placeMarker(row, col, getCurrentPlayer().marker);

      // determine if play wins round
      const isWinner = checkForWinner(row, col);
      if (isWinner) {
        console.log(`${getCurrentPlayer().name} wins!!!`);

        getCurrentPlayer().addPoint();
        console.log(`Score: ${players[0].name}: ${players[0].getScore()}. ${players[1].name}: ${players[1].getScore()}.`);

        printNewRound();
        return;
      }
      // If no winner yet...
      else if (!isWinner) {
        Gameboard.printBoard();
        switchTurns();
        alertPlayerOfTurn();
      }
    } else { // if square unavailable, log error, do not place marker or switch turns
      // TODO: After UI built, call a method from future UI handler to display red border flash or similar side effect if square is not empty.
      console.log(`Sorry, that square is already taken. Try again.`);
      alertPlayerOfTurn();
    }
  };

  // Initial play game message
  printNewRound();

  return {
    getCurrentPlayer,
    printNewRound,
    playRound,
    checkForTie,
  };
})();

// Test calls to insert vals at (row, col):
GameController.playRound(0, 0);
GameController.playRound(1, 0);
GameController.playRound(1, 1);
// GameController.playRound(1, 1); // this is a check for trying an unavailable square
GameController.playRound(1, 2);
GameController.playRound(2, 2);

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