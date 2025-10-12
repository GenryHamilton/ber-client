import React, { useState } from 'react';
import './MinesPage.css';

const MinesPage = ({ onRegisterModalOpen }) => {
  const [minesCount, setMinesCount] = useState(10);
  const [betAmount, setBetAmount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [revealedCells, setRevealedCells] = useState([]);
  const [gameHash, setGameHash] = useState('no hash');

  // Сетка 5x5 = 25 клеток
  const gridSize = 5;
  const totalCells = gridSize * gridSize;

  // Создаем массив клеток
  const cells = Array.from({ length: totalCells }, (_, index) => ({
    id: index,
    isRevealed: revealedCells.includes(index),
    isMine: false, // В реальной игре это будет определяться сервером
    adjacentMines: 0
  }));

  const handleCellClick = (cellId) => {
    if (gameStarted && !revealedCells.includes(cellId)) {
      setRevealedCells([...revealedCells, cellId]);
    }
  };

  const handleMinesCountChange = (count) => {
    setMinesCount(count);
  };

  const handleBetAmountChange = (amount) => {
    setBetAmount(amount);
  };

  const startGame = () => {
    if (betAmount > 0 && minesCount > 0) {
      setGameStarted(true);
      setRevealedCells([]);
      // Генерируем новый хеш игры
      setGameHash(Math.random().toString(36).substring(2, 15));
    }
  };

  const cashOut = () => {
    // Логика вывода средств
    setGameStarted(false);
    setRevealedCells([]);
  };

  const resetGame = () => {
    setGameStarted(false);
    setRevealedCells([]);
    setBetAmount(0);
  };

  return (
    <div className="mines-page">
      <div className="mines-background"></div>
      
      <div className="mines-content">
        <div className="mines-game-area">
          <div className="mines-game-container">
            <div className="mines-game-info">
              <div className="game-hash-section">
                <div className="hash-display">
                  <span className="hash-text">{gameHash}</span>
                </div>
              </div>
            </div>
            
            <div className="mines-grid-container">
              <div className="mines-grid">
                {cells.map((cell) => (
                  <div
                    key={cell.id}
                    className={`mine-cell ${cell.isRevealed ? 'revealed' : ''}`}
                    onClick={() => handleCellClick(cell.id)}
                  >
                    {cell.isRevealed ? (
                      <div className="cell-content">
                        {cell.isMine ? (
                          <div className="mine-icon">💣</div>
                        ) : (
                          <div className="diamond-icon">💎</div>
                        )}
                      </div>
                    ) : (
                      <div className="cell-question">?</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mines-controls">
            <div className="controls-container">
              <div className="bet-section">
                <div className="bet-amount">
                  <label className="control-label">Bet amount</label>
                  <div className="bet-input-container">
                    <div className="currency-icon">
                      <img src="/images/blackcoin-1a9023c1.svg" alt="Currency" />
                    </div>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => handleBetAmountChange(parseFloat(e.target.value) || 0)}
                      className="bet-input"
                      placeholder="0"
                      disabled={gameStarted}
                    />
                    <div className="clear-icon">
                      <img src="/images/copy-icon.svg" alt="Clear" />
                    </div>
                  </div>
                  
                  <div className="bet-quick-actions">
                    <button className="quick-bet-btn" onClick={() => handleBetAmountChange(betAmount + 100)}>+100</button>
                    <button className="quick-bet-btn" onClick={() => handleBetAmountChange(betAmount + 500)}>+500</button>
                    <button className="quick-bet-btn" onClick={() => handleBetAmountChange(betAmount + 1000)}>+1000</button>
                    <button className="quick-bet-btn" onClick={() => handleBetAmountChange(betAmount + 5000)}>+5000</button>
                    <button className="quick-bet-btn" onClick={() => handleBetAmountChange(betAmount / 2)}>1/2</button>
                    <button className="quick-bet-btn" onClick={() => handleBetAmountChange(betAmount * 2)}>x2</button>
                    <button className="quick-bet-btn" onClick={() => handleBetAmountChange(10000)}>max</button>
                  </div>
                </div>
                
                <div className="mines-count">
                  <label className="control-label">Mines amount</label>
                  <div className="mines-input-container">
                    <div className="mines-icon">
                      <img src="/images/mines-game-56586a.png" alt="Mines" />
                    </div>
                    <input
                      type="number"
                      value={minesCount}
                      onChange={(e) => handleMinesCountChange(parseInt(e.target.value) || 1)}
                      className="mines-input"
                      placeholder="10"
                      min="1"
                      max="24"
                      disabled={gameStarted}
                    />
                  </div>
                  
                  <div className="mines-quick-actions">
                    <button 
                      className={`mines-count-btn ${minesCount === 1 ? 'active' : ''}`}
                      onClick={() => handleMinesCountChange(1)}
                    >1</button>
                    <button 
                      className={`mines-count-btn ${minesCount === 3 ? 'active' : ''}`}
                      onClick={() => handleMinesCountChange(3)}
                    >3</button>
                    <button 
                      className={`mines-count-btn ${minesCount === 5 ? 'active' : ''}`}
                      onClick={() => handleMinesCountChange(5)}
                    >5</button>
                    <button 
                      className={`mines-count-btn ${minesCount === 10 ? 'active' : ''}`}
                      onClick={() => handleMinesCountChange(10)}
                    >10</button>
                    <button 
                      className={`mines-count-btn ${minesCount === 24 ? 'active' : ''}`}
                      onClick={() => handleMinesCountChange(24)}
                    >24</button>
                  </div>
                </div>
              </div>
              
              <div className="game-actions">
                <button 
                  className="cashout-btn"
                  onClick={cashOut}
                  disabled={!gameStarted || revealedCells.length === 0}
                >
                  <img src="/images/coinflip-tails.png" alt="Cash Out" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mines-footer">
          <p className="footer-text">
            Mines is a game of chance. Play responsibly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MinesPage;
