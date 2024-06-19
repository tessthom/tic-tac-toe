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

  // just returns current board array
  const getBoard = () => board;

  // method to change square's value to 1 or 2
  const placeMarker = (row, col, player) => {
    // check if square is empty, if not just return
    // if empty, place marker arg
    const isSquareAvailable = !board[row][col].getValue();
    console.log(`is the square available? ${isSquareAvailable}`);
    console.log(`the value of board[${row}][${col}].getValue() is ${board[row][col].getValue()}`);
    // if the square isn't available, exit fn
    if (!isSquareAvailable) return;
    // else the square IS available, so we can add the player's marker:
    board[row][col].addMarker(player);
    console.log(board[row][col].getValue());
  };

  const printBoard = () => {
    // map over every row in the board...
    const boardWithValues = board.map((row) => {
      // then map over every square in each row, and return the player value from each
      return row.map((square) => square.getValue());
    });
    console.dir(boardWithValues);
  };

  // Return object with fn to get board state, check for valid move, update board based on player moves:
  return {
    getBoard,
    placeMarker,
    printBoard,
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
      points: 0
    },
    {
      name: playerTwoName,
      marker: 2,
      points: 0
    }
  ];

  // init current player
  let currentPlayer = players[0];

  // method to switch turns
  const switchTurns = () => {
    currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
  };

  // method to access currentPlayer from outside the FF
  const getCurrentPlayer = () => currentPlayer;

  // method to call to start new round
  const printNewRound = () => {
    // ACCESS METHODS ON THE BOARD FROM THE GAMEBOARD OBJECT :)
    // print a new empty board
    Gameboard.printBoard();
    // alert player it's their turn
    console.log(`Okay ${getCurrentPlayer().name}, it's your turn.`);
  };

  // method to play a round
  const playRound = (col, row) => {
    // place marker for current player
    console.log(`Placing ${getCurrentPlayer().name}'s marker, ${getCurrentPlayer().marker}, into the square at column ${col}, row ${row}...`);
    Gameboard.placeMarker(col, row, getCurrentPlayer().marker);

    /* This is where we'll check for a winner and handle that logic, like displaying a win message */

    // switch turns
    switchTurns();
    // display blank board and empty board array
    printNewRound();
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
GameController.playRound(0, 1);
GameController.playRound(1, 1);
GameController.playRound(2, 2);