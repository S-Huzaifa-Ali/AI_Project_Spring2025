import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/welcome.scss';

const Welcome = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null);
  const [aiColor, setAiColor] = useState('white');
  const [difficulty, setDifficulty] = useState('medium');

  const handleModeSelection = (mode) => {
    setSelectedMode(mode);
  };

  const startGame = () => {
    const difficultyLevel = {
      'easy': 1,
      'medium': 2,
      'hard': 3
    }[difficulty];

    if (selectedMode === 'ai') {
      navigate('/game', { 
        state: { 
          gameMode: selectedMode,
          aiSettings: {
            playerColor: aiColor,
            difficulty: difficultyLevel
          }
        } 
      });
    } else {
      navigate('/game', { state: { gameMode: selectedMode } });
    }
  };

  return (
    <div className="welcome-container">
      <h1>Chess Game</h1>
      <div className="welcome-content">
        <p>Select your game mode:</p>
        <div className="mode-buttons">
          <button 
            className={`mode-button ${selectedMode === 'twoPlayer' ? 'selected' : ''}`}
            onClick={() => handleModeSelection('twoPlayer')}
          >
            Two Player
          </button>
          <button 
            className={`mode-button ${selectedMode === 'ai' ? 'selected' : ''}`}
            onClick={() => handleModeSelection('ai')}
          >
            Play Against AI
          </button>
        </div>

        {selectedMode === 'ai' && (
          <div className="ai-settings">
            <div className="setting-group">
              <h3>Choose your color:</h3>
              <div className="color-options">
                <label>
                  <input 
                    type="radio" 
                    name="color" 
                    value="white" 
                    checked={aiColor === 'white'}
                    onChange={() => setAiColor('white')} 
                  />
                  White
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="color" 
                    value="black" 
                    checked={aiColor === 'black'}
                    onChange={() => setAiColor('black')} 
                  />
                  Black
                </label>
              </div>
            </div>

            <div className="setting-group">
              <h3>Difficulty:</h3>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        )}

        {selectedMode && (
          <button 
            className="start-button"
            onClick={startGame}
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  );
};

export default Welcome;