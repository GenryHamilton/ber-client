import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './PlinkoPage.css';

const PlinkoPage = () => {
  const { t } = useTranslation();
  const [betAmount, setBetAmount] = useState(0);
  const [rows, setRows] = useState(10);
  const [difficulty, setDifficulty] = useState('normal');
  const [mode, setMode] = useState('manual');
  const [isPlaying, setIsPlaying] = useState(false);
  const [multipliers, setMultipliers] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);

  // Multipliers for different difficulty levels
  const getMultipliers = (rows, difficulty) => {
    const baseMultipliers = {
      easy: [21.1, 4.8, 1.92, 1.34, 0.58, 0.38, 0.58, 1.34, 1.92, 4.8, 21.1],
      normal: [21.1, 4.8, 1.92, 1.34, 0.58, 0.38, 0.58, 1.34, 1.92, 4.8, 21.1],
      hard: [21.1, 4.8, 1.92, 1.34, 0.58, 0.38, 0.58, 1.34, 1.92, 4.8, 21.1]
    };
    return baseMultipliers[difficulty] || baseMultipliers.normal;
  };

  useEffect(() => {
    setMultipliers(getMultipliers(rows, difficulty));
  }, [rows, difficulty]);

  const handleBet = () => {
    if (betAmount <= 0) return;
    
    setIsPlaying(true);
    
    // Game simulation
    setTimeout(() => {
      const randomSlot = Math.floor(Math.random() * multipliers.length);
      const winAmount = betAmount * multipliers[randomSlot];
      
      const gameResult = {
        id: Date.now(),
        user: 'Player',
        betAmount,
        multiplier: multipliers[randomSlot],
        payout: Math.floor(winAmount),
        date: new Date().toLocaleString(),
        slot: randomSlot
      };
      
      setGameHistory(prev => [gameResult, ...prev.slice(0, 9)]);
      setIsPlaying(false);
    }, 3000);
  };

  const quickBetAmounts = [100, 500, 1000, 5000];
  const rowOptions = [8, 10, 12, 14, 16];

  return (
    <div className="plinko-page">
      <div className="plinko-container">
        {/* Control Panel */}
        <div className="plinko-controls">
          <div className="control-section">
            <div className="control-group">
              <label>Mode</label>
              <div className="mode-buttons">
                <button 
                  className={mode === 'manual' ? 'active' : ''}
                  onClick={() => setMode('manual')}
                >
                  Manual
                </button>
                <button 
                  className={mode === 'auto' ? 'active' : ''}
                  onClick={() => setMode('auto')}
                >
                  Auto
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Difficulty</label>
              <div className="difficulty-buttons">
                <button 
                  className={difficulty === 'easy' ? 'active' : ''}
                  onClick={() => setDifficulty('easy')}
                >
                  Easy
                </button>
                <button 
                  className={difficulty === 'normal' ? 'active' : ''}
                  onClick={() => setDifficulty('normal')}
                >
                  Normal
                </button>
                <button 
                  className={difficulty === 'hard' ? 'active' : ''}
                  onClick={() => setDifficulty('hard')}
                >
                  Hard
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Bet amount</label>
              <div className="bet-input-container">
                <div className="coin-icon">🪙</div>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  placeholder="0"
                  className="bet-input"
                />
                <div className="bet-actions">
                  <button>+</button>
                  <button>-</button>
                </div>
              </div>
              <div className="quick-bet-buttons">
                {quickBetAmounts.map(amount => (
                  <button 
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className="quick-bet"
                  >
                    +{amount}
                  </button>
                ))}
                <button onClick={() => setBetAmount(betAmount / 2)}>1/2</button>
                <button onClick={() => setBetAmount(betAmount * 2)}>x2</button>
                <button onClick={() => setBetAmount(10000)}>max</button>
              </div>
            </div>

            <div className="control-group">
              <label>Amount of rows</label>
              <div className="row-buttons">
                {rowOptions.map(option => (
                  <button
                    key={option}
                    className={rows === option ? 'active' : ''}
                    onClick={() => setRows(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-win">
              MAX WIN: 10,000,000 coins
            </div>

            <button 
              className="place-bet-btn"
              onClick={handleBet}
              disabled={isPlaying || betAmount <= 0}
            >
              {isPlaying ? 'Playing...' : 'place bet'}
            </button>
          </div>
        </div>

        {/* Game Field */}
        <div className="plinko-game-area">
          <div className="plinko-board">
            <div className="plinko-pins">
              {/* Generate pins for grid */}
              {Array.from({ length: rows }, (_, rowIndex) => (
                <div key={rowIndex} className="pin-row">
                  {Array.from({ length: rowIndex + 1 }, (_, pinIndex) => (
                    <div key={pinIndex} className="pin" />
                  ))}
                </div>
              ))}
            </div>
            
            {/* {t('plinko.slotsWithMultipliers')} */}
            <div className="multiplier-slots">
              {multipliers.map((multiplier, index) => (
                <div key={index} className="multiplier-slot">
                  <div className={`multiplier-icon multiplier-${index}`}>
                    {index === 0 || index === multipliers.length - 1 ? '🔥' : '💎'}
                  </div>
                  <span className="multiplier-value">{multiplier}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game History */}
        <div className="plinko-history">
          <div className="history-header">
            <div>User</div>
            <div>Bet amount</div>
            <div>Multiplier</div>
            <div>Payout</div>
            <div>Date</div>
          </div>
          <div className="history-list">
            {gameHistory.map((game) => (
              <div key={game.id} className="history-item">
                <div className="user-info">
                  <div className="user-avatar">👤</div>
                  <span>{game.user}</span>
                </div>
                <div className="bet-info">
                  <div className="coin-icon">🪙</div>
                  <span>{game.betAmount}</span>
                </div>
                <div className="multiplier-info">{game.multiplier}x</div>
                <div className="payout-info">
                  <div className="coin-icon">🪙</div>
                  <span className={game.payout > game.betAmount ? 'win' : 'loss'}>
                    {game.payout}
                  </span>
                </div>
                <div className="date-info">{game.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlinkoPage;




