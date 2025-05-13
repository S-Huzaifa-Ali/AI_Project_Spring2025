const PIECE_VALUES = {
  'P': 10,
  'N': 30,
  'B': 30,
  'R': 50,
  'Q': 90,
  'K': 900
};

const POSITION_TABLES = {
  'P': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'N': [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ],
  'B': [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
  ],
  'R': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0]
  ],
  'Q': [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20]
  ],
  'K': [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20]
  ]
};

const getPositionValue = (piece, row, col, color) => {
  const pieceType = piece.toString()[1];
  if (!POSITION_TABLES[pieceType]) return 0;
  
  if (color === 'white') {
    return POSITION_TABLES[pieceType][row][col];
  } else {
    return POSITION_TABLES[pieceType][7 - row][col];
  }
};

const evaluateBoard = (board) => {
  let score = 0;
  
  if (board.isCheckmate('white')) return -10000;
  if (board.isCheckmate('black')) return 10000;
  if (board.isStalemate('white') || board.isStalemate('black')) return 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board.board[row][col];
      if (piece) {
        const pieceType = piece.toString()[1];
        const pieceValue = PIECE_VALUES[pieceType] || 0;
        const positionValue = getPositionValue(piece, row, col, piece.color);
        
        if (piece.color === 'white') {
          score += pieceValue + positionValue;
        } else {
          score -= pieceValue + positionValue;
        }
      }
    }
  }
  
  return score;
};

const getAllValidMoves = (board, color) => {
  const moves = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board.board[row][col];
      if (piece && piece.color === color) {
        const validMoves = piece.getValidMoves(board);
        for (const move of validMoves) {
          if (!board.wouldBeInCheck(color, [row, col], move)) {
            moves.push({
              from: [row, col],
              to: move
            });
          }
        }
      }
    }
  }
  
  return moves;
};

const makeMove = (board, from, to) => {
  const clonedBoard = board.clone();
  clonedBoard.movePiece(from, to);
  return clonedBoard;
};

const minimax = (board, depth, alpha, beta, maximizingPlayer) => {
  if (depth === 0) {
    return { value: evaluateBoard(board) };
  }
  
  const color = maximizingPlayer ? 'white' : 'black';
  const moves = getAllValidMoves(board, color);
  
  if (moves.length === 0) {
    if (board.isInCheck(color)) {
      return { value: maximizingPlayer ? -10000 : 10000 };
    } else {
      return { value: 0 };
    }
  }
  
  let bestMove = null;
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const evalResult = minimax(newBoard, depth - 1, alpha, beta, false);
      const evalValue = evalResult.value;
      
      if (evalValue > maxEval) {
        maxEval = evalValue;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    return { value: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const evalResult = minimax(newBoard, depth - 1, alpha, beta, true);
      const evalValue = evalResult.value;
      
      if (evalValue < minEval) {
        minEval = evalValue;
        bestMove = move;
      }
      
      beta = Math.min(beta, evalValue);
      if (beta <= alpha) break;
    }
    return { value: minEval, move: bestMove };
  }
};

const getBestMove = (board, difficulty, aiColor) => {
  const maximizingPlayer = aiColor === 'white';
  let depth;
  
  switch(difficulty) {
    case 1:
      depth = 1;
      break;
    case 2:
      depth = 2;
      break;
    case 3:
      depth = 3;
      break;
    default:
      depth = 2;
  }
  
  const allMoves = getAllValidMoves(board, aiColor);
  if (allMoves.length === 0) return null;
  
  if (difficulty === 1 && Math.random() < 0.4) {
    const randomIndex = Math.floor(Math.random() * allMoves.length);
    return allMoves[randomIndex];
  }
  
  if (difficulty === 2 && Math.random() < 0.3) {
    const result = minimax(board, depth, -Infinity, Infinity, maximizingPlayer);
    const bestMove = result.move;
    
    const moveEvaluations = [];
    for (const move of allMoves) {
      const newBoard = makeMove(board, move.from, move.to);
      const evaluation = evaluateBoard(newBoard);
      moveEvaluations.push({ move, evaluation: maximizingPlayer ? evaluation : -evaluation });
    }
    
    moveEvaluations.sort((a, b) => b.evaluation - a.evaluation);
    
    const topMoves = moveEvaluations.slice(0, Math.min(3, moveEvaluations.length));
    const randomIndex = Math.floor(Math.random() * topMoves.length);
    return topMoves[randomIndex].move;
  }
  
  const result = minimax(board, depth, -Infinity, Infinity, maximizingPlayer);
  return result.move;
};

export { getBestMove };