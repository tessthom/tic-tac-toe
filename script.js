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
  const board = [];
  const size = 3;

  // Init board 
  for (let i = 0; i < size; i++) {
    // create sub-array for each row
    board[i] = [];
    // for every row, push an instance of Square
    for (let j = 0; j < size; j++) {
      board[i].push(Square()); 
    }
  }

  const getBoard = () => board;
  // TODO: MAKE COPY OF INITIAL ARRAY SO YOURE NOT MODDING ORIG ARRAY CONSTANTLY

  const isSquareAvailable = (row, col) => !board[row][col].getValue();

  const placeMarker = (row, col, player) => {
    // TODO: After UI built, call a method from future UI handler to display red border flash or similar side effect if square is not empty.
    if (!isSquareAvailable(row, col)) return;
    // else add the player's marker:
    board[row][col].addMarker(player);
  };

  const printBoard = () => {
    // map over every row in the board...
    const boardWithValues = board.map((row) => {
      // then map over every square in each row, and return the player value from each
      return row.map((square) => square.getValue());
    });
    console.dir(boardWithValues);
  };

  const resetBoard = () => {

  }

  // Return object with fn to get board state, check for valid move, update board based on player moves:
  return {
    size,
    getBoard,
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
  // TODO: Reassess if best way to store player data, or make separate factory fn? If you do, need to refactor the way 
  const players = [
    {
      name: playerOneName,
      marker: 1,
      score: 0
    },
    {
      name: playerTwoName,
      marker: 2,
      score: 0
    }
  ];

  let currentPlayer = players[0];

  const switchTurns = () => {
    currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
  };


  const getCurrentPlayer = () => currentPlayer;

  const addPoint = () => currentPlayer.score += 1;

  const printNewRound = () => {
    // print a new empty board
    Gameboard.printBoard(); // TODO: THIS CURRENTLY JUST PRINTS BOARD AS IS, NEED TO RESET
    // alert player it's their turn
    console.log(`Okay ${getCurrentPlayer().name}, it's your turn.`);
  };

  const checkForWinner = (row, col) => {
    const currBoard = Gameboard.getBoard();
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

  const playRound = (row, col) => {
    // place marker for current player
    console.log(`Placing ${getCurrentPlayer().name}'s marker, ${getCurrentPlayer().marker}, into the square at row ${row}, column ${col}...`);
    Gameboard.placeMarker(row, col, getCurrentPlayer().marker);

    /* This is where will check for a winner and handle that logic, like displaying a win message */
    if (checkForWinner(row, col)) {
      console.log(`${getCurrentPlayer().name} wins!!!`);
      // increment player's score
      addPoint();
      console.log(`Score: ${players[0].name}: ${players[0].score}. ${players[1].name}: ${players[1].score}`);
      // reset board
    };
    // switch turns
    switchTurns();
    // display blank board and empty board array
    printNewRound(); // TODO: this currently just prints the board as is!
  };

  // Initial play game message
  printNewRound();

  return {
    getCurrentPlayer,
    playRound,
  };
})();

// Test calls to insert vals at (row, col):
GameController.playRound(0, 0);
GameController.playRound(1, 0);
GameController.playRound(1, 1);
GameController.playRound(1, 1);
GameController.playRound(2, 2);