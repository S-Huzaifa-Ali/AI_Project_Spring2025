import React from "react";
import Pawn from "../assets/pawn.svg?react";
import Knight from "../assets/knight.svg?react";
import Bishop from "../assets/bishop.svg?react";
import Rook from "../assets/rook.svg?react";
import Queen from "../assets/queen.svg?react";
import King from "../assets/king.svg?react";
import "../styles/chessboard.scss";

const ChessBoard = () => {
  const board = [];

  const getPiece = (row, col) => {
    const isWhite = row === 6 || row === 7;

    if (row === 1 || row === 6) {
      return <Pawn className={`piece ${isWhite ? "white" : "black"}`} />;
    }

    if (row === 0 || row === 7) {
      const piecesOrder = [
        Rook,
        Knight,
        Bishop,
        Queen,
        King,
        Bishop,
        Knight,
        Rook,
      ];
      const Piece = piecesOrder[col];
      return <Piece className={`piece ${isWhite ? "white" : "black"}`} />;
    }

    return null;
  };

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isDark = (row + col) % 2 === 1;
      const piece = getPiece(row, col);

      board.push(
        <div
          key={`${row}-${col}`}
          className={`square ${isDark ? "dark" : "light"}`}
          data-position={`${row}-${col}`}
        >
          {piece}
        </div>
      );
    }
  }

  return <div className="chess-board">{board}</div>;
};

export default ChessBoard;
