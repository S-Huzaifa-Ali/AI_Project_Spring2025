import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChessBoard as ChessBoardLogic, Queen, Rook, Bishop, Knight } from '../game/ChessLogic';
import { getBestMove } from '../game/ChessAI';
import GameInfo from './GameInfo';
import '../styles/chessboard.scss';
import '../styles/gameInfo.scss';
import PawnSVG from "../assets/pawn.svg?react";
import KnightSVG from "../assets/knight.svg?react";
import BishopSVG from "../assets/bishop.svg?react";
import RookSVG from "../assets/rook.svg?react";
import QueenSVG from "../assets/queen.svg?react";
import KingSVG from "../assets/king.svg?react";

const ChessGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const gameMode = location.state?.gameMode || 'twoPlayer';
  const receivedAiSettings = location.state?.aiSettings;
  
  const [gameState, setGameState] = useState({
    board: new ChessBoardLogic(),
    selectedPiece: null,
    validMoves: [],
    gameOver: false,
    gameStatus: '',
    winner: null,
    promotion: {
      active: false,
      position: null,
      fromPosition: null
    },
    moveHistory: [],
    capturedPieces: {
      white: [],
      black: []
    }
  });
  
  const [aiSettings, setAiSettings] = useState({
    enabled: gameMode === 'ai',
    playerColor: receivedAiSettings?.playerColor || 'white',
    difficulty: receivedAiSettings?.difficulty || 2,
    thinking: false
  });
  
  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location, navigate]);

  const pieceComponents = {
    'P': PawnSVG,
    'R': RookSVG,
    'N': KnightSVG,
    'B': BishopSVG,
    'Q': QueenSVG,
    'K': KingSVG
  };

  useEffect(() => {
    if (aiSettings.enabled && 
        !gameState.gameOver && 
        gameState.board.currentTurn !== aiSettings.playerColor && 
        !aiSettings.thinking) {
      
      setAiSettings(prev => ({ ...prev, thinking: true }));
      
      const timer = setTimeout(() => {
        makeAiMove();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.board.currentTurn, aiSettings.enabled, gameState.gameOver]);

  const makeAiMove = () => {
    const { board } = gameState;
    const aiColor = aiSettings.playerColor === 'white' ? 'black' : 'white';
    
    const move = getBestMove(board, aiSettings.difficulty, aiColor);
    
    if (move) {
      if (checkPromotion(move.from, move.to)) {
        const [fromRow, fromCol] = move.from;
        const [toRow, toCol] = move.to;
        const piece = board.board[fromRow][fromCol];
        
        if (piece) {
          board.board[fromRow][fromCol] = null;
          
          const newQueen = new Queen(piece.color, [toRow, toCol]);
          board.board[toRow][toCol] = newQueen;
          
          board.currentTurn = board.currentTurn === 'white' ? 'black' : 'white';
          
          checkGameState(board);
        }
      } else {
        const [success, message, capturedPiece] = board.movePiece(move.from, move.to);
        
        if (success) {
          // Add move to history
          const moveInfo = getMoveNotation(move.from, move.to, board);
          updateMoveHistory(moveInfo);
          
          if (capturedPiece) {
            updateCapturedPieces(capturedPiece);
          }

          checkGameState(board);
        } else {
          console.log('AI move failed:', message);
        }
      }
    } else {
      console.log('AI could not find a valid move');
    }
    
    setAiSettings(prev => ({ ...prev, thinking: false }));
  };

  const checkPromotion = (fromPos, toPos) => {
    const [fromRow, fromCol] = fromPos;
    const [toRow, toCol] = toPos;
    const { board } = gameState;
    
    const piece = board.board[fromRow][fromCol];
    
    if (piece && piece.constructor.name === 'Pawn') {
      if ((piece.color === 'white' && toRow === 0) || 
          (piece.color === 'black' && toRow === 7)) {
        return true;
      }
    }
    
    return false;
  };
  
  const handlePromotion = (pieceType) => {
    const { board, promotion } = gameState;
    const { position, fromPosition } = promotion;
    
    if (!position || !fromPosition) return;
    
    const [toRow, toCol] = position;
    const [fromRow, fromCol] = fromPosition;
    const piece = board.board[fromRow][fromCol];
    
    if (!piece) return;
    
    let newPiece;
    const pieceColor = piece.color;
    let promotedPieceType = '';
    
    switch (pieceType) {
      case 'Q':
        newPiece = new Queen(pieceColor, [toRow, toCol]);
        promotedPieceType = 'Queen';
        break;
      case 'R':
        newPiece = new Rook(pieceColor, [toRow, toCol]);
        promotedPieceType = 'Rook';
        break;
      case 'B':
        newPiece = new Bishop(pieceColor, [toRow, toCol]);
        promotedPieceType = 'Bishop';
        break;
      case 'N':
        newPiece = new Knight(pieceColor, [toRow, toCol]);
        promotedPieceType = 'Knight';
        break;
      default:
        newPiece = new Queen(pieceColor, [toRow, toCol]);
        promotedPieceType = 'Queen';
    }
    
    board.board[fromRow][fromCol] = null;
    board.board[toRow][toCol] = newPiece;
    
    const fromFile = String.fromCharCode(97 + fromCol);
    const toFile = String.fromCharCode(97 + toCol);
    const fromRank = 8 - fromRow;
    const toRank = 8 - toRow;
    
    const moveInfo = {
      notation: `${fromFile}${fromRank} ${toFile}${toRank}`,
      pieceType: promotedPieceType,
      pieceColor: pieceColor,
      from: `${fromFile}${fromRank}`,
      to: `${toFile}${toRank}`
    };
    
    updateMoveHistory(moveInfo);
    
    board.currentTurn = board.currentTurn === 'white' ? 'black' : 'white';
    
    checkGameState(board);
    
    setGameState(prev => ({
      ...prev,
      promotion: {
        active: false,
        position: null,
        fromPosition: null
      },
      selectedPiece: null,
      validMoves: []
    }));
  };
  
  const handleSquareClick = (row, col) => {
    const { board, selectedPiece, validMoves, promotion } = gameState;
    
    if (promotion.active) return;
    
    if (gameState.gameOver || aiSettings.thinking) return;
    
    if (aiSettings.enabled && board.currentTurn !== aiSettings.playerColor) return;

    if (selectedPiece) {
      const [fromRow, fromCol] = selectedPiece;
      const toPos = [row, col];
      
      const isValidMove = validMoves.some(move => move[0] === row && move[1] === col);
      
      if (isValidMove) {
        if (checkPromotion([fromRow, fromCol], toPos)) {
          setGameState(prev => ({
            ...prev,
            promotion: {
              active: true,
              position: toPos,
              fromPosition: [fromRow, fromCol]
            }
          }));
          return;
        }
        
        const [success, message, capturedPiece] = board.movePiece([fromRow, fromCol], toPos);
        
        if (success) {
          const moveInfo = getMoveNotation([fromRow, fromCol], toPos, board);
          updateMoveHistory(moveInfo);
          
          if (capturedPiece) {
            updateCapturedPieces(capturedPiece);
          }
          
          checkGameState(board);
        } else {
          console.log(message);
        }
        
        setGameState(prev => ({
          ...prev,
          selectedPiece: null,
          validMoves: []
        }));
      } else {
        const piece = board.board[row][col];
        if (piece && piece.color === board.currentTurn) {
          const newValidMoves = piece.getValidMoves(board).filter(
            move => !board.wouldBeInCheck(piece.color, [row, col], move)
          );
          
          setGameState(prev => ({
            ...prev,
            selectedPiece: [row, col],
            validMoves: newValidMoves
          }));
        } else {
          setGameState(prev => ({
            ...prev,
            selectedPiece: null,
            validMoves: []
          }));
        }
      }
    } else {
      const piece = board.board[row][col];
      if (piece && piece.color === board.currentTurn) {
        const newValidMoves = piece.getValidMoves(board).filter(
          move => !board.wouldBeInCheck(piece.color, [row, col], move)
        );
        
        setGameState(prev => ({
          ...prev,
          selectedPiece: [row, col],
          validMoves: newValidMoves
        }));
      }
    }
  };

  const checkGameState = (board) => {
    const currentColor = board.currentTurn;
    let gameOver = false;
    let gameStatus = '';
    let winner = null;

    if (board.isInCheck(currentColor)) {
      if (board.isCheckmate(currentColor)) {
        gameOver = true;
        winner = currentColor === 'white' ? 'black' : 'white';
        gameStatus = `Checkmate! ${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`;
      } else {
        gameStatus = `${currentColor.charAt(0).toUpperCase() + currentColor.slice(1)} is in check!`;
      }
    } else if (board.isStalemate(currentColor)) {
      gameOver = true;
      gameStatus = 'Stalemate! The game is a draw.';
    } else if (board.isFiftyMoveRule()) {
      gameOver = true;
      gameStatus = '50-move rule! The game is a draw.';
    } else if (board.isThreefoldRepetition()) {
      gameOver = true;
      gameStatus = 'Threefold repetition! The game is a draw.';
    } else if (board.isInsufficientMaterial()) {
      gameOver = true;
      gameStatus = 'Insufficient material! The game is a draw.';
    }

    if (gameOver || gameStatus) {
      setGameState(prev => ({
        ...prev,
        gameOver,
        gameStatus,
        winner
      }));
    }
  };

  const resetGame = () => {
    setGameState({
      board: new ChessBoardLogic(),
      selectedPiece: null,
      validMoves: [],
      gameOver: false,
      gameStatus: '',
      winner: null,
      promotion: {
        active: false,
        position: null,
        fromPosition: null
      },
      moveHistory: [],
      capturedPieces: {
        white: [],
        black: []
      }
    });
  };
  
  const getMoveNotation = (fromPos, toPos, board) => {
    const [fromRow, fromCol] = fromPos;
    const [toRow, toCol] = toPos;
    
    const piece = board.board[toRow][toCol];
    const pieceType = piece ? piece.constructor.name : '';
    const pieceColor = piece ? piece.color : '';
    
    const fromFile = String.fromCharCode(97 + fromCol);
    const toFile = String.fromCharCode(97 + toCol);
    
    const fromRank = 8 - fromRow;
    const toRank = 8 - toRow;
    
    return {
      notation: `${fromFile}${fromRank} ${toFile}${toRank}`,
      pieceType,
      pieceColor,
      from: `${fromFile}${fromRank}`,
      to: `${toFile}${toRank}`
    };
  };
  
  const updateMoveHistory = (moveInfo) => {
    setGameState(prev => ({
      ...prev,
      moveHistory: [...prev.moveHistory, moveInfo]
    }));
  };
  
  const updateCapturedPieces = (capturedPiece) => {
    if (!capturedPiece) return;
    
    const pieceColor = capturedPiece.color;
    const pieceNotation = capturedPiece.toString();
    
    setGameState(prev => {
      const updatedCapturedPieces = {...prev.capturedPieces};
      
      if (pieceColor === 'white') {
        updatedCapturedPieces.white = [...updatedCapturedPieces.white, pieceNotation];
      } else {
        updatedCapturedPieces.black = [...updatedCapturedPieces.black, pieceNotation];
      }
      
      return {
        ...prev,
        capturedPieces: updatedCapturedPieces
      };
    });
  };
  
  const toggleAI = () => {
    setAiSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };
  
  const changePlayerColor = (color) => {
    setAiSettings(prev => ({
      ...prev,
      playerColor: color
    }));
    
    resetGame();
  };
  
  const changeDifficulty = (level) => {
    setAiSettings(prev => ({
      ...prev,
      difficulty: parseInt(level, 10)
    }));
  };

  const renderBoard = () => {
    const { board, selectedPiece, validMoves } = gameState;
    const squares = [];

    let whiteKingPos = null;
    let blackKingPos = null;
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board.board[r][c];
        if (p && p.constructor.name === 'King') {
          if (p.color === 'white') {
            whiteKingPos = [r, c];
          } else {
            blackKingPos = [r, c];
          }
        }
      }
    }

    const whiteInCheck = whiteKingPos && board.isInCheck('white');
    const blackInCheck = blackKingPos && board.isInCheck('black');

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isDark = (row + col) % 2 === 1;
        const piece = board.board[row][col];
        
        const isSelected = selectedPiece && selectedPiece[0] === row && selectedPiece[1] === col;
        const isValidMove = validMoves.some(move => move[0] === row && move[1] === col);
        
        const isWhiteKingInCheck = whiteInCheck && whiteKingPos && whiteKingPos[0] === row && whiteKingPos[1] === col;
        const isBlackKingInCheck = blackInCheck && blackKingPos && blackKingPos[0] === row && blackKingPos[1] === col;
        const isInCheck = isWhiteKingInCheck || isBlackKingInCheck;
        
        let className = `square ${isDark ? 'dark' : 'light'}`;
        if (isSelected) className += ' selected';
        if (isValidMove) className += ' valid-move';
        if (isInCheck) className += ' in-check';
        
        let pieceElement = null;
        if (piece) {
          const pieceCode = piece.toString();
          const PieceComponent = pieceComponents[pieceCode[1]];
          if (PieceComponent) {
            pieceElement = <PieceComponent className={`piece ${piece.color}`} />;
          }
        }
        
        squares.push(
          <div
            key={`${row}-${col}`}
            className={className}
            onClick={() => handleSquareClick(row, col)}
            data-position={`${row}-${col}`}
          >
            {pieceElement}
            {isValidMove && <div className="move-indicator"></div>}
          </div>
        );
      }
    }
    
    return squares;
  };

  const goToWelcome = () => {
    navigate('/');
  };

  const renderPromotionUI = () => {
    const { promotion } = gameState;
    if (!promotion.active) return null;
    
    const [row, col] = promotion.position;
    const piece = gameState.board.board[promotion.fromPosition[0]][promotion.fromPosition[1]];
    if (!piece) return null;
    
    const pieceColor = piece.color;
    
    const promotionPieces = [
      { type: 'Q', component: pieceComponents['Q'], label: 'Queen' },
      { type: 'R', component: pieceComponents['R'], label: 'Rook' },
      { type: 'B', component: pieceComponents['B'], label: 'Bishop' },
      { type: 'N', component: pieceComponents['N'], label: 'Knight' }
    ];
    
    return (
      <div className="promotion-overlay">
        <div className="promotion-modal">
          <h3>Choose promotion</h3>
          <div className="promotion-options">
            {promotionPieces.map(({ type, component: PieceComponent, label }) => (
              <div 
                key={type} 
                className="promotion-option"
                onClick={() => handlePromotion(type)}
              >
                <PieceComponent className={`piece ${pieceColor}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chess-game">
      <div className="game-controls">
        <div className="game-mode-info">
          <p>{gameMode === 'twoPlayer' ? 'Two Player Mode' : 'Playing Against AI'}</p>
        </div>
      </div>
      
      <div className="game-status">
        {gameState.gameStatus || 
         (aiSettings.thinking ? "AI is thinking..." : 
          `${gameState.board.currentTurn.charAt(0).toUpperCase() + gameState.board.currentTurn.slice(1)}'s turn`)}
      </div>
      
      <div className="game-container">
        <div className="chess-board">
          {renderBoard()}
          {renderPromotionUI()}
        </div>
        
        <GameInfo 
          moveHistory={gameState.moveHistory} 
          capturedPieces={gameState.capturedPieces} 
        />
      </div>
      
      <div className="game-buttons">
        <button className="reset-button" onClick={resetGame}>
          New Game
        </button>
        <button className="back-button" onClick={goToWelcome}>
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default ChessGame;