# AI-Based Chess Game

## Project Overview

This project is a **fully functional Chess game** implemented entirely in **JavaScript**. It features both classic Player vs Player gameplay as well as an intelligent Player vs AI mode. The game respects all official chess rules and includes helpful features like move history tracking.

## Features

- Complete rule-based chess engine
- **Player vs Player** mode for two human players
- **Player vs AI** mode using **Minimax with Alpha-Beta Pruning**
  - AI difficulty scales by depth level in the Minimax algorithm
- **Move History** functionality showing all past moves

## AI Logic

The AI opponent is powered by the **Minimax algorithm enhanced with Alpha-Beta Pruning**, which evaluates board states to choose optimal moves based on the configured difficulty level. As difficulty increases, the depth of the tree traversal increases, making the AI smarter and more challenging.

## Tech Stack

- **Frontend & Logic**: JavaScript
- **Build Tool**: Vite
- **Framework**: React (for UI components)
- **Version Control**: Git & GitHub

## Contributors

- **Syed Huzaifa Ali** – Frontend Implementation
- **Muhammad Yesaullah Sheikh** - AI logic (Minimax with alpha beta pruning)
- **Syed Murtaza Jaffri** - Chess game logic
- **Haris Ahmed** - Chess game logic
