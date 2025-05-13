class ChessPiece {
  constructor(color, position) {
    this.color = color;
    this.position = position;
    this.hasMoved = false;
  }

  getValidMoves(board) {
    throw new Error("Subclasses must implement this method");
  }

  toString() {
    return `${this.color[0].toUpperCase()}${this.constructor.name[0]}`;
  }
}

class Pawn extends ChessPiece {
  getValidMoves(board) {
    const validMoves = [];
    const [row, col] = this.position;
    const direction = this.color === 'white' ? -1 : 1;
    
    if (row + direction >= 0 && row + direction < 8 && board.board[row + direction][col] === null) {
      validMoves.push([row + direction, col]);
      
      if (!this.hasMoved && row + 2*direction >= 0 && row + 2*direction < 8 && 
          board.board[row + 2*direction][col] === null) {
        validMoves.push([row + 2*direction, col]);
      }
    }
    
    for (const c of [col-1, col+1]) {
      if (row + direction >= 0 && row + direction < 8 && c >= 0 && c < 8) {
        if (board.board[row + direction][c] !== null && 
            board.board[row + direction][c].color !== this.color) {
          validMoves.push([row + direction, c]);
        }
        
        if (board.enPassantTarget && 
            board.enPassantTarget[0] === row + direction && 
            board.enPassantTarget[1] === c) {
          validMoves.push([row + direction, c]);
        }
      }
    }
    
    return validMoves;
  }
}

class Rook extends ChessPiece {
  getValidMoves(board) {
    const validMoves = [];
    const [row, col] = this.position;
    
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    
    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board.board[r][c] === null) {
          validMoves.push([r, c]);
        } else if (board.board[r][c].color !== this.color) {
          validMoves.push([r, c]);
          break;
        } else {
          break;
        }
        r += dr;
        c += dc;
      }
    }
    
    return validMoves;
  }
}

class Knight extends ChessPiece {
  getValidMoves(board) {
    const validMoves = [];
    const [row, col] = this.position;
    
    const knightMoves = [
      [row-2, col-1], [row-2, col+1],
      [row-1, col-2], [row-1, col+2],
      [row+1, col-2], [row+1, col+2],
      [row+2, col-1], [row+2, col+1]
    ];
    
    for (const [r, c] of knightMoves) {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board.board[r][c] === null || board.board[r][c].color !== this.color) {
          validMoves.push([r, c]);
        }
      }
    }
    
    return validMoves;
  }
  
  toString() {
    return `${this.color[0].toUpperCase()}N`;
  }
}

class Bishop extends ChessPiece {
  getValidMoves(board) {
    const validMoves = [];
    const [row, col] = this.position;
    
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    
    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board.board[r][c] === null) {
          validMoves.push([r, c]);
        } else if (board.board[r][c].color !== this.color) {
          validMoves.push([r, c]);
          break;
        } else {
          break;
        }
        r += dr;
        c += dc;
      }
    }
    
    return validMoves;
  }
}

class Queen extends ChessPiece {
  getValidMoves(board) {
    const validMoves = [];
    const [row, col] = this.position;
    
    const directions = [
      [-1, 0], [0, 1], [1, 0], [0, -1],
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    
    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board.board[r][c] === null) {
          validMoves.push([r, c]);
        } else if (board.board[r][c].color !== this.color) {
          validMoves.push([r, c]);
          break;
        } else {
          break;
        }
        r += dr;
        c += dc;
      }
    }
    
    return validMoves;
  }
}

class King extends ChessPiece {
  getValidMoves(board) {
    const validMoves = [];
    const [row, col] = this.position;
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        
        const r = row + dr;
        const c = col + dc;
        
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
          if (board.board[r][c] === null || board.board[r][c].color !== this.color) {
            validMoves.push([r, c]);
          }
        }
      }
    }
    
    if (!this.hasMoved) {
      if (board.board[row][7] !== null && 
          board.board[row][7] instanceof Rook && 
          board.board[row][7].color === this.color && 
          !board.board[row][7].hasMoved && 
          board.board[row][5] === null && 
          board.board[row][6] === null) {
        validMoves.push([row, 6]);
      }
      
      if (board.board[row][0] !== null && 
          board.board[row][0] instanceof Rook && 
          board.board[row][0].color === this.color && 
          !board.board[row][0].hasMoved && 
          board.board[row][1] === null && 
          board.board[row][2] === null && 
          board.board[row][3] === null) {
        validMoves.push([row, 2]);
      }
    }
    
    return validMoves;
  }
}

class ChessBoard {
  constructor() {
    this.board = Array(8).fill().map(() => Array(8).fill(null));
    this.currentTurn = 'white';
    this.enPassantTarget = null;
    this.whiteKingPos = [7, 4];
    this.blackKingPos = [0, 4];
    this.halfmoveClock = 0;
    this.positionHistory = [];
    this.setupBoard();
  }
  
  clone() {
    const clonedBoard = new ChessBoard();
    
    clonedBoard.board = Array(8).fill().map(() => Array(8).fill(null));
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece) {
          let clonedPiece;
          
          if (piece instanceof Pawn) {
            clonedPiece = new Pawn(piece.color, [row, col]);
          } else if (piece instanceof Rook) {
            clonedPiece = new Rook(piece.color, [row, col]);
          } else if (piece instanceof Knight) {
            clonedPiece = new Knight(piece.color, [row, col]);
          } else if (piece instanceof Bishop) {
            clonedPiece = new Bishop(piece.color, [row, col]);
          } else if (piece instanceof Queen) {
            clonedPiece = new Queen(piece.color, [row, col]);
          } else if (piece instanceof King) {
            clonedPiece = new King(piece.color, [row, col]);
          }
          
          if (clonedPiece) {
            clonedPiece.hasMoved = piece.hasMoved;
            clonedBoard.board[row][col] = clonedPiece;
          }
        }
      }
    }
    
    clonedBoard.currentTurn = this.currentTurn;
    clonedBoard.enPassantTarget = this.enPassantTarget ? [...this.enPassantTarget] : null;
    clonedBoard.whiteKingPos = [...this.whiteKingPos];
    clonedBoard.blackKingPos = [...this.blackKingPos];
    clonedBoard.halfmoveClock = this.halfmoveClock;
    clonedBoard.positionHistory = [...this.positionHistory];
    
    return clonedBoard;
  }
  
  setupBoard() {
    // Set up pawns
    for (let col = 0; col < 8; col++) {
      this.board[1][col] = new Pawn('black', [1, col]);
      this.board[6][col] = new Pawn('white', [6, col]);
    }
    
    this.board[0][0] = new Rook('black', [0, 0]);
    this.board[0][7] = new Rook('black', [0, 7]);
    this.board[7][0] = new Rook('white', [7, 0]);
    this.board[7][7] = new Rook('white', [7, 7]);
    
    this.board[0][1] = new Knight('black', [0, 1]);
    this.board[0][6] = new Knight('black', [0, 6]);
    this.board[7][1] = new Knight('white', [7, 1]);
    this.board[7][6] = new Knight('white', [7, 6]);
    
    this.board[0][2] = new Bishop('black', [0, 2]);
    this.board[0][5] = new Bishop('black', [0, 5]);
    this.board[7][2] = new Bishop('white', [7, 2]);
    this.board[7][5] = new Bishop('white', [7, 5]);
    
    this.board[0][3] = new Queen('black', [0, 3]);
    this.board[7][3] = new Queen('white', [7, 3]);
    
    this.board[0][4] = new King('black', [0, 4]);
    this.board[7][4] = new King('white', [7, 4]);
  }
  
  movePiece(fromPos, toPos) {
    const [fromRow, fromCol] = fromPos;
    const [toRow, toCol] = toPos;
    
    const piece = this.board[fromRow][fromCol];
    if (piece === null) {
      return [false, "No piece at the starting position"];
    }
    
    if (piece.color !== this.currentTurn) {
      return [false, `It's ${this.currentTurn}'s turn`];
    }
    
    const validMoves = piece.getValidMoves(this);
    if (!validMoves.some(move => move[0] === toPos[0] && move[1] === toPos[1])) {
      return [false, "Invalid move"];
    }
    
    let enPassantCapture = false;
    let capturedPiece = null;
    
    if (piece instanceof Pawn && 
        this.enPassantTarget && 
        toPos[0] === this.enPassantTarget[0] && 
        toPos[1] === this.enPassantTarget[1]) {
      enPassantCapture = true;
      const captureRow = fromRow;
      const captureCol = toCol;
      capturedPiece = this.board[captureRow][captureCol];
      this.board[captureRow][captureCol] = null;
    }
    
    let castling = false;
    if (piece instanceof King && Math.abs(fromCol - toCol) === 2) {
      castling = true;
      if (toCol === 6) {
        const rook = this.board[fromRow][7];
        this.board[fromRow][7] = null;
        this.board[fromRow][5] = rook;
        rook.position = [fromRow, 5];
        rook.hasMoved = true;
      } else {
        const rook = this.board[fromRow][0];
        this.board[fromRow][0] = null;
        this.board[fromRow][3] = rook;
        rook.position = [fromRow, 3];
        rook.hasMoved = true;
      }
    }
    
    this.enPassantTarget = null;
    
    if (piece instanceof Pawn && Math.abs(fromRow - toRow) === 2) {
      this.enPassantTarget = [fromRow + (piece.color === 'black' ? 1 : -1), fromCol];
    }
    
    const isCapture = this.board[toRow][toCol] !== null;
    const isPawnMove = piece instanceof Pawn;
    
    if (isCapture || isPawnMove) {
      this.halfmoveClock = 0;
    } else {
      this.halfmoveClock++;
    }
    
    this.board[fromRow][fromCol] = null;
    if (capturedPiece === null) {
      capturedPiece = this.board[toRow][toCol];
    }
    this.board[toRow][toCol] = piece;
    piece.position = toPos;
    piece.hasMoved = true;
    
    if (piece instanceof King) {
      if (piece.color === 'white') {
        this.whiteKingPos = toPos;
      } else {
        this.blackKingPos = toPos;
      }
    }
    
    if (this.isInCheck(piece.color)) {
      this.board[fromRow][fromCol] = piece;
      this.board[toRow][toCol] = capturedPiece;
      piece.position = fromPos;
      
      if (piece instanceof King) {
        if (piece.color === 'white') {
          this.whiteKingPos = fromPos;
        } else {
          this.blackKingPos = fromPos;
        }
      }
      
      if (castling) {
        if (toCol === 6) {
          const rook = this.board[fromRow][5];
          this.board[fromRow][5] = null;
          this.board[fromRow][7] = rook;
          rook.position = [fromRow, 7];
          rook.hasMoved = false;
        } else {
          const rook = this.board[fromRow][3];
          this.board[fromRow][3] = null;
          this.board[fromRow][0] = rook;
          rook.position = [fromRow, 0];
          rook.hasMoved = false;
        }
      }
      
      if (enPassantCapture) {
        this.board[fromRow][toCol] = capturedPiece;
      }
      
      return [false, "That move would put you in check"];
    }
    
    const boardPosition = this.getPositionKey();
    this.positionHistory.push(boardPosition);
    
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    
    return [true, null, capturedPiece];
  }
  
  isInCheck(color) {
    const kingPos = color === 'white' ? this.whiteKingPos : this.blackKingPos;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece !== null && piece.color !== color) {
          const validMoves = piece.getValidMoves(this);
          if (validMoves.some(move => move[0] === kingPos[0] && move[1] === kingPos[1])) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  wouldBeInCheck(color, fromPos, toPos) {
    const [fromRow, fromCol] = fromPos;
    const [toRow, toCol] = toPos;
    
    const piece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];
    
    this.board[fromRow][fromCol] = null;
    this.board[toRow][toCol] = piece;
    
    let originalKingPos = null;
    if (piece instanceof King && piece.color === color) {
      originalKingPos = color === 'white' ? this.whiteKingPos : this.blackKingPos;
      if (color === 'white') {
        this.whiteKingPos = toPos;
      } else {
        this.blackKingPos = toPos;
      }
    }
    
    const inCheck = this.isInCheck(color);
    
    this.board[fromRow][fromCol] = piece;
    this.board[toRow][toCol] = capturedPiece;
    
    if (originalKingPos !== null) {
      if (color === 'white') {
        this.whiteKingPos = originalKingPos;
      } else {
        this.blackKingPos = originalKingPos;
      }
    }
    
    return inCheck;
  }
  
  isCheckmate(color) {
    if (!this.isInCheck(color)) {
      return false;
    }
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece !== null && piece.color === color) {
          const validMoves = piece.getValidMoves(this);
          for (const move of validMoves) {
            if (!this.wouldBeInCheck(color, piece.position, move)) {
              return false;
            }
          }
        }
      }
    }
    
    return true;
  }
  
  isStalemate(color) {
    if (this.isInCheck(color)) {
      return false;
    }
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece !== null && piece.color === color) {
          const validMoves = piece.getValidMoves(this);
          for (const move of validMoves) {
            if (!this.wouldBeInCheck(color, piece.position, move)) {
              return false;
            }
          }
        }
      }
    }
    
    return true;
  }
  
  isFiftyMoveRule() {
    return this.halfmoveClock >= 100;
  }
  
  isThreefoldRepetition() {
    if (this.positionHistory.length < 5) {
      return false;
    }
    
    const currentPosition = this.positionHistory[this.positionHistory.length - 1];
    let repetitionCount = 0;
    
    for (const position of this.positionHistory) {
      if (position === currentPosition) {
        repetitionCount++;
        if (repetitionCount >= 3) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  isInsufficientMaterial() {
    const whitePieces = [];
    const blackPieces = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece !== null) {
          if (piece.color === 'white') {
            whitePieces.push(piece);
          } else {
            blackPieces.push(piece);
          }
        }
      }
    }
    
    if (whitePieces.length === 1 && blackPieces.length === 1) {
      return true;
    }
    
    if ((whitePieces.length === 1 && blackPieces.length === 2) || 
        (whitePieces.length === 2 && blackPieces.length === 1)) {
      const sideWithTwo = whitePieces.length === 2 ? whitePieces : blackPieces;
      const hasKing = sideWithTwo.some(p => p instanceof King);
      const hasBishop = sideWithTwo.some(p => p instanceof Bishop);
      const hasKnight = sideWithTwo.some(p => p instanceof Knight);
      
      if (hasKing && (hasBishop || hasKnight)) {
        return true;
      }
    }
    
    if ((whitePieces.length === 3 && blackPieces.length === 1) || 
        (whitePieces.length === 1 && blackPieces.length === 3)) {
      const sideWithThree = whitePieces.length === 3 ? whitePieces : blackPieces;
      const hasKing = sideWithThree.some(p => p instanceof King);
      const knightCount = sideWithThree.filter(p => p instanceof Knight).length;
      
      if (hasKing && knightCount === 2) {
        return true;
      }
    }
    
    if (whitePieces.length === 2 && blackPieces.length === 2) {
      const whiteHasKing = whitePieces.some(p => p instanceof King);
      const whiteHasBishop = whitePieces.some(p => p instanceof Bishop);
      const blackHasKing = blackPieces.some(p => p instanceof King);
      const blackHasBishop = blackPieces.some(p => p instanceof Bishop);
      
      if (whiteHasKing && whiteHasBishop && blackHasKing && blackHasBishop) {
        const whiteBishop = whitePieces.find(p => p instanceof Bishop);
        const blackBishop = blackPieces.find(p => p instanceof Bishop);
        
        const [whiteRow, whiteCol] = whiteBishop.position;
        const [blackRow, blackCol] = blackBishop.position;
        
        const whiteSum = (whiteRow + whiteCol) % 2;
        const blackSum = (blackRow + blackCol) % 2;
        
        if (whiteSum === blackSum) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  getPositionKey() {
    let key = "";
    
    for (let row = 0; row < 8; row++) {
      let emptyCount = 0;
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            key += emptyCount.toString();
            emptyCount = 0;
          }
          key += piece.toString();
        }
      }
      if (emptyCount > 0) {
        key += emptyCount.toString();
      }
      key += "/";
    }
    
    key += this.currentTurn === "white" ? "w" : "b";
    
    let castling = "";
    for (const [row, color] of [[7, "white"], [0, "black"]]) {
      const king = this.board[row][4];
      if (king !== null && king instanceof King && !king.hasMoved) {
        const rookKingside = this.board[row][7];
        if (rookKingside !== null && rookKingside instanceof Rook && !rookKingside.hasMoved) {
          castling += color === "white" ? "K" : "k";
        }
        const rookQueenside = this.board[row][0];
        if (rookQueenside !== null && rookQueenside instanceof Rook && !rookQueenside.hasMoved) {
          castling += color === "white" ? "Q" : "q";
        }
      }
    }
    key += castling || "-";
    
    if (this.enPassantTarget) {
      const [row, col] = this.enPassantTarget;
      const file = String.fromCharCode(col + 97);
      const rank = 8 - row;
      key += ` ${file}${rank}`;
    } else {
      key += " -";
    }
    
    return key;
  }
}

export { ChessPiece, Pawn, Rook, Knight, Bishop, Queen, King, ChessBoard };