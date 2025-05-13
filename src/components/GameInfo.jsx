import React from 'react';
import '../styles/gameInfo.scss';
import PawnSVG from "../assets/pawn.svg?react";
import KnightSVG from "../assets/knight.svg?react";
import BishopSVG from "../assets/bishop.svg?react";
import RookSVG from "../assets/rook.svg?react";
import QueenSVG from "../assets/queen.svg?react";
import KingSVG from "../assets/king.svg?react";

const GameInfo = ({ moveHistory, capturedPieces }) => {
  const pieceComponents = {
    'Pawn': PawnSVG,
    'Rook': RookSVG,
    'Knight': KnightSVG,
    'Bishop': BishopSVG,
    'Queen': QueenSVG,
    'King': KingSVG
  };
  
  const calculateAdvantage = () => {
    const pieceValues = {
      'P': 1,
      'N': 3,
      'B': 3,
      'R': 5,
      'Q': 9
    };

    let whiteScore = 0;
    let blackScore = 0;

    capturedPieces.white.forEach(piece => {
      blackScore += pieceValues[piece.charAt(1)] || 0;
    });

    capturedPieces.black.forEach(piece => {
      whiteScore += pieceValues[piece.charAt(1)] || 0;
    });

    return whiteScore - blackScore;
  };

  const advantage = calculateAdvantage();

  return (
    <div className="game-info">
      <div className="info-section">
        <h3>Move History</h3>
        <div className="move-history">
          {moveHistory.map((move, index) => {
            const PieceIcon = move.pieceType && pieceComponents[move.pieceType];
            return (
              <div key={index} className="move-entry">
                <span className="move-number">{Math.floor(index/2) + 1}.</span>
                <div className={`move ${index % 2 === 0 ? 'white' : 'black'}`}>
                  {PieceIcon && (
                    <span className="piece-icon">
                      <PieceIcon className={`piece-svg ${move.pieceColor}`} />
                    </span>
                  )}
                  <span className="move-destination">{move.to}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="info-section">
        <h3>Captured Pieces</h3>
        <div className="captured-pieces">
          <div className="white-captured">
            {(() => {
              const sortedPieces = [...capturedPieces.black].sort((a, b) => {
                const pieceOrder = { 'P': 1, 'N': 2, 'B': 3, 'R': 4, 'Q': 5, 'K': 6 };
                return pieceOrder[a.charAt(1)] - pieceOrder[b.charAt(1)];
              });
              
              return sortedPieces.map((piece, index) => {
                const pieceType = piece.charAt(1);
                const PieceIcon = pieceComponents[pieceType === 'N' ? 'Knight' : 
                                 pieceType === 'P' ? 'Pawn' : 
                                 pieceType === 'R' ? 'Rook' : 
                                 pieceType === 'B' ? 'Bishop' : 
                                 pieceType === 'Q' ? 'Queen' : 'King'];
                return (
                  <span key={index} className="captured-piece black">
                    {PieceIcon && <PieceIcon className="piece-svg black" />}
                  </span>
                );
              });
            })()}
          </div>
          <div className="black-captured">
            {(() => {
              const sortedPieces = [...capturedPieces.white].sort((a, b) => {
                const pieceOrder = { 'P': 1, 'N': 2, 'B': 3, 'R': 4, 'Q': 5, 'K': 6 };
                return pieceOrder[a.charAt(1)] - pieceOrder[b.charAt(1)];
              });
              
              return sortedPieces.map((piece, index) => {
                const pieceType = piece.charAt(1);
                const PieceIcon = pieceComponents[pieceType === 'N' ? 'Knight' : 
                                 pieceType === 'P' ? 'Pawn' : 
                                 pieceType === 'R' ? 'Rook' : 
                                 pieceType === 'B' ? 'Bishop' : 
                                 pieceType === 'Q' ? 'Queen' : 'King'];
                return (
                  <span key={index} className="captured-piece white">
                    {PieceIcon && <PieceIcon className="piece-svg white" />}
                  </span>
                );
              });
            })()}
          </div>
        </div>
        <div className="material-advantage">
          {advantage > 0 ? `White +${advantage}` : advantage < 0 ? `Black +${Math.abs(advantage)}` : 'Even'}
        </div>
      </div>
    </div>
  );
};

export default GameInfo;