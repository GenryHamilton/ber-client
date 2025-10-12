import React from 'react';
import './JackpotPage.css';

const JackpotPage = ({ onRegisterModalOpen }) => {
  return (
    <div className="jackpot-page">
      <div className="jackpot-background">
        <img src="/images/jackpot-bg-56586a.png" alt="Jackpot Background" />
      </div>
      
      <div className="jackpot-content">
        <div className="jackpot-game-area">
          <div className="jackpot-wheel-container">
            <div className="jackpot-wheel">
              <div className="wheel-background">
                <img src="/images/jackpot-game-bg-56586a.png" alt="Wheel Background" />
              </div>
              <div className="wheel-center">
                <div className="wheel-image">
                  <img src="/images/jackpot-wheel-56586a.png" alt="Wheel" />
                </div>
                <div className="wheel-splash">
                  <img src="/images/wheel-splash.svg" alt="Wheel Splash" />
                  <div className="timer-display">
                    <span className="timer-text">00:00</span>
                    <div className="timer-icon">
                      <img src="/images/timer-icon.svg" alt="Timer" />
                    </div>
                    <span className="timer-value">0</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="jackpot-controls">
              <div className="timer-section">
                <button className="deposit-btn" onClick={onRegisterModalOpen}>Deposit</button>
              </div>
              
              <div className="game-info">
                <p className="game-hash">14a1d8678a7e3e2de0e766fa64db041df8e01e446693301794aad47461899634</p>
                <div className="copy-icon">
                  <img src="/images/copy-icon.svg" alt="Copy" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="jackpot-stats">
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-background"></div>
                <div className="stat-content">
                  <div className="stat-icon">
                    <img src="/images/stat-icon-1.svg" alt="Stat Icon" />
                  </div>
                  <span className="stat-value">0</span>
                  <span className="stat-label">Total amount</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-background"></div>
                <div className="stat-content">
                  <div className="stat-icon">
                    <img src="/images/stat-icon-2.svg" alt="Stat Icon" />
                  </div>
                  <span className="stat-value">0</span>
                  <span className="stat-label">Players total</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-background"></div>
                <div className="stat-content">
                  <div className="stat-icon">
                    <img src="/images/stat-icon-3-56586a.png" alt="Stat Icon" />
                  </div>
                  <span className="stat-value">0/120</span>
                  <span className="stat-label">Items total</span>
                </div>
              </div>
            </div>
            
            <div className="players-section">
              <div className="players-container">
                <div className="no-players">
                  <span>No players yet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JackpotPage;
