import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import './page.css';
import JackpotPage from '../components/JackpotPage';
import CoinflipPage from '../components/CoinflipPage';
import MinesPage from '../components/MinesPage';
import PlinkoPage from '../components/PlinkoPage';
import LoginPage from '../components/LoginPage/LoginPage';
import RegisterPage from '../components/RegisterPage';
import DepositPage from './deposit';
import WithdrawPage from './withdraw';
import PaymentCardPage from './payment-card';

const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('main');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleStartKYC = () => {
    setIsRegisterModalOpen(true);
  };
  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };
  const handleOpenRegister = () => {
    setIsRegisterModalOpen(true);
  };

  return (
    <div className="casino-app">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" fill="url(#logoGradient)" stroke="#FFC701" strokeWidth="2"/>
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF922E"/>
                    <stop offset="100%" stopColor="#FFC239"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="sidebar-nav">
          <div className={`nav-item ${currentPage === 'main' ? 'active' : ''}`} onClick={() => setCurrentPage('main')}>
            <div className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="6" height="6" stroke="#EC981A" strokeWidth="1.25"/>
                <rect x="2" y="12" width="6" height="6" stroke="#A96500" strokeWidth="1.25"/>
                <rect x="12" y="2" width="6" height="6" stroke="#FFC701" strokeWidth="1.25"/>
                <rect x="12" y="12" width="6" height="6" stroke="#FFC701" strokeWidth="1.25"/>
              </svg>
            </div>
            <span className="nav-text">MAIN</span>
          </div>
          
          <div className={`nav-item ${currentPage === 'jackpot' ? 'active' : ''}`} onClick={() => setCurrentPage('jackpot')}>
            <div className="nav-icon">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M1 13L12 1L12 12L25 12" stroke="#3B436B" strokeWidth="1.5"/>
                <path d="M1 1L12 12L1 12L1 25" stroke="#4D5B97" strokeWidth="1.5"/>
                <path d="M13 1L25 12L13 12L13 25" stroke="#2D3660" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="nav-text">JACKPOT</span>
          </div>
          
          <div className={`nav-item ${currentPage === 'coinflip' ? 'active' : ''}`} onClick={() => setCurrentPage('coinflip')}>
            <div className="nav-icon">
              <svg width="26" height="29" viewBox="0 0 26 29" fill="none">
                <circle cx="13" cy="13" r="4" stroke="#3B436B" strokeWidth="1.34"/>
                <path d="M2 7L24 7" stroke="#4D5B97" strokeWidth="1.34"/>
                <path d="M2 21L24 21" stroke="#2D3660" strokeWidth="1.34"/>
              </svg>
            </div>
            <span className="nav-text">COINFLIP</span>
          </div>
          
          <div className={`nav-item ${currentPage === 'mines' ? 'active' : ''}`} onClick={() => setCurrentPage('mines')}>
            <div className="nav-icon">
              <svg width="30" height="33" viewBox="0 0 30 33" fill="none">
                <circle cx="15" cy="15" r="7" stroke="#3B436B" strokeWidth="1.32"/>
                <path d="M8 8L22 22" stroke="#4D5B97" strokeWidth="1.32"/>
                <path d="M22 8L8 22" stroke="#4D5B97" strokeWidth="1.32"/>
              </svg>
            </div>
            <span className="nav-text">MINES</span>
          </div>
          
          <div className={`nav-item ${currentPage === 'plinko' ? 'active' : ''}`} onClick={() => setCurrentPage('plinko')}>
            <div className="nav-icon">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="4" stroke="#2D3660" strokeWidth="1.625"/>
                <circle cx="9" cy="17" r="4" stroke="#4D5B97" strokeWidth="1.625"/>
                <circle cx="17" cy="17" r="4" stroke="#3B436B" strokeWidth="1.625"/>
              </svg>
            </div>
            <span className="nav-text">PLINKO</span>
          </div>
          
          
        </div>
        
        <div className="sidebar-footer">
          <div className="footer-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#3B436B" strokeWidth="1"/>
              <path d="M12 6L12 12L16 14" stroke="#3B436B" strokeWidth="1"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <div className="header-top-row">
            <div className="header-logo">
              <div className="logo-text">
                <span className="play-now">play now</span>
                <span className="casino-name">Mister Berg</span>
              </div>
            </div>
          
          <div className="header-nav">
            <div className="nav-icon">
              <img src="/images/header-nav-icon1.svg" alt="Nav Icon 1" />
            </div>
            <div className="nav-icon">
              <img src="/images/header-nav-icon2.svg" alt="Nav Icon 2" />
            </div>
            <div className="nav-icon">
              <img src="/images/header-nav-icon3.svg" alt="Nav Icon 3" />
            </div>
            <div className="nav-icon">
              <img src="/images/header-nav-icon4.svg" alt="Nav Icon 4" />
            </div>
          </div>
          
          <div className="header-actions">
            <div className="language-selector">
              <div className="flag-icon">
                <svg width="25" height="18" viewBox="0 0 25 18" fill="none">
                  <rect width="25" height="18" fill="#E6E7E8"/>
                  <rect y="15.77" width="25" height="1.32" fill="#DA2128"/>
                  <rect y="13.13" width="25" height="1.32" fill="#DA2128"/>
                  <rect y="10.5" width="25" height="1.32" fill="#DA2128"/>
                  <rect y="7.87" width="25" height="1.32" fill="#DA2128"/>
                  <rect y="5.24" width="25" height="1.32" fill="#DA2128"/>
                  <rect y="2.61" width="25" height="1.32" fill="#DA2128"/>
                  <rect y="0" width="25" height="1.32" fill="#DA2128"/>
                  <rect width="12.76" height="9.2" fill="#006BB5"/>
                </svg>
              </div>
              <span>EN</span>
              <svg width="7" height="13" viewBox="0 0 7 13" fill="none">
                <path d="M1 1L6 6.5L1 12" stroke="#48488B" strokeWidth="1"/>
              </svg>
            </div>
            <div className="auth-actions">
              {isAuthenticated ? (
                <div className="user-menu-container" ref={userMenuRef}>
                  <button 
                    className="user-email-btn" 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <span>{user?.email}</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </button>
                  {showUserMenu && (
                    <div className="user-dropdown-menu">
                      <div className="user-info">
                        <p className="user-email">{user?.email}</p>
                        <p className="user-status">{user?.isActivated ? 'Активирован' : 'Не активирован'}</p>
                      </div>
                      <button className="logout-btn" onClick={() => { logout(); setShowUserMenu(false); }}>
                        Выйти
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button className="auth-btn auth-btn-secondary" onClick={handleOpenLogin}>Login</button>
                  <button className="auth-btn auth-btn-primary" onClick={handleOpenRegister}>Register</button>
                </>
              )}
            </div>
            
            <div 
              className="hamburger-menu"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </div>
          </div>
          </div>
          
          {isAuthenticated && (
            <div className="user-balance">
              <div className="balance-label">Баланс</div>
              <div className="balance-amount">
                <span className="balance-value">0.0</span>
                <span className="balance-currency">BERG</span>
                <button 
                  className="balance-mini-btn balance-mini-btn-deposit" 
                  title="Пополнить"
                  onClick={() => setCurrentPage('deposit')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                </button>
                <button 
                  className="balance-mini-btn balance-mini-btn-withdraw" 
                  title="Вывести"
                  onClick={() => setCurrentPage('withdraw')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="content-body">
          {/* Mobile Menu */}
          <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <div className="mobile-menu-header">
              <h2>Games</h2>
              <button 
                className="close-menu-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <div className="mobile-menu-grid">
              <div className={`mobile-menu-item ${currentPage === 'main' ? 'active' : ''}`} onClick={() => {setCurrentPage('main'); setIsMobileMenuOpen(false);}}>
                <div className="mobile-menu-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="4" width="8" height="8" stroke="#EC981A" strokeWidth="2"/>
                    <rect x="4" y="20" width="8" height="8" stroke="#A96500" strokeWidth="2"/>
                    <rect x="20" y="4" width="8" height="8" stroke="#FFC701" strokeWidth="2"/>
                    <rect x="20" y="20" width="8" height="8" stroke="#FFC701" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="mobile-menu-text">MAIN</span>
              </div>
              
              <div className={`mobile-menu-item ${currentPage === 'jackpot' ? 'active' : ''}`} onClick={() => {setCurrentPage('jackpot'); setIsMobileMenuOpen(false);}}>
                <div className="mobile-menu-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M2 16L14 4L14 16L28 16" stroke="#3B436B" strokeWidth="2"/>
                    <path d="M2 4L14 16L2 16L2 28" stroke="#4D5B97" strokeWidth="2"/>
                    <path d="M16 4L28 16L16 16L16 28" stroke="#2D3660" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="mobile-menu-text">JACKPOT</span>
              </div>
              
              <div className={`mobile-menu-item ${currentPage === 'coinflip' ? 'active' : ''}`} onClick={() => {setCurrentPage('coinflip'); setIsMobileMenuOpen(false);}}>
                <div className="mobile-menu-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="6" stroke="#3B436B" strokeWidth="2"/>
                    <path d="M4 12L28 12" stroke="#4D5B97" strokeWidth="2"/>
                    <path d="M4 20L28 20" stroke="#2D3660" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="mobile-menu-text">COINFLIP</span>
                <span className="mobile-menu-value">$ 4094</span>
              </div>
              
              <div className={`mobile-menu-item ${currentPage === 'mines' ? 'active' : ''}`} onClick={() => {setCurrentPage('mines'); setIsMobileMenuOpen(false);}}>
                <div className="mobile-menu-icon">
                  <svg width="30" height="33" viewBox="0 0 30 33" fill="none">
                    <circle cx="15" cy="15" r="7" stroke="#3B436B" strokeWidth="1.32"/>
                    <path d="M8 8L22 22" stroke="#4D5B97" strokeWidth="1.32"/>
                    <path d="M22 8L8 22" stroke="#4D5B97" strokeWidth="1.32"/>
                  </svg>
                </div>
                <span className="mobile-menu-text">MINES</span>
              </div>
              
              <div className={`mobile-menu-item ${currentPage === 'plinko' ? 'active' : ''}`} onClick={() => {setCurrentPage('plinko'); setIsMobileMenuOpen(false);}}>
                <div className="mobile-menu-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="6" stroke="#2D3660" strokeWidth="2"/>
                    <circle cx="12" cy="20" r="6" stroke="#4D5B97" strokeWidth="2"/>
                    <circle cx="20" cy="20" r="6" stroke="#3B436B" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="mobile-menu-text">PLINKO</span>
              </div>
              
              
              <div className="mobile-menu-item">
                <div className="mobile-menu-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" stroke="#3B436B" strokeWidth="2"/>
                    <path d="M16 8L16 24" stroke="#4D5B97" strokeWidth="2"/>
                    <path d="M8 16L24 16" stroke="#3B436B" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="mobile-menu-text">WHEEL</span>
              </div>
              
              <div className="mobile-menu-item">
                <div className="mobile-menu-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4L26 10L26 22L16 28L6 22L6 10L16 4Z" stroke="#2D3660" strokeWidth="2"/>
                    <path d="M16 12L22 15L22 19L16 22L10 19L10 15L16 12Z" stroke="#4D5B97" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="mobile-menu-text">UPGRADER</span>
                <span className="mobile-menu-badge">NEW!</span>
              </div>
              
              <div className="mobile-menu-item">
                <div className="mobile-menu-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4L26 10L26 22L16 28L6 22L6 10L16 4Z" stroke="#2D3660" strokeWidth="2"/>
                    <path d="M16 10L22 13L22 17L16 20L10 17L10 13L16 10Z" stroke="#4D5B97" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="mobile-menu-text">PVP MINES</span>
                <span className="mobile-menu-value">$ 0</span>
                <span className="mobile-menu-badge">NEW!</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`main-content-area ${isMobileMenuOpen ? 'hidden' : ''}`}>
            {currentPage === 'main' ? (
              <>
                <div className="game-banner">
                  <div className="banner-content">
                    <div className="banner-text">
                      <h1>Mister Berg Casino</h1>
                      <p>Online strategy with unique games! Crash, mines, roulette, double, monopoly and other games! Daily bonuses and holiday events! Try and get a free bonus 🔥 Official website</p>
                    </div>
                    <div className="banner-actions">
                      <button className="register-btn" onClick={() => setIsRegisterModalOpen(true)}>Register</button>
                    </div>
                  </div>
                </div>
              
                <div className="games-grid">
                  <div className="game-card active" onClick={() => setCurrentPage('plinko')}>
                    <div className="game-image">
                      <img src="/images/plinko-game-56586a.png" alt="Plinko" />
                    </div>
                  </div>
                  
                  <div className="game-card">
                    <div className="game-image">
                      <img src="/images/wheel-game-56586a.png" alt="Wheel" />
                    </div>
                  </div>
                  
                  <div className="game-card" onClick={() => setCurrentPage('jackpot')}>
                    <div className="game-image">
                      <img src="/images/jackpot-game-56586a.png" alt="Jackpot" />
                    </div>
                  </div>
                  
                  <div className="game-card">
                    <div className="game-image">
                      <img src="/images/mines-game-56586a.png" alt="Mines" />
                    </div>
                  </div>
                  
                  <div className="game-card">
                    <div className="game-image">
                      <img src="/images/coinflip-game-56586a.png" alt="Coinflip" />
                    </div>
                  </div>
                  
                  <div className="game-card">
                    <div className="game-image">
                      <img src="/images/pvp-mines-game-56586a.png" alt="PVP Mines" />
                    </div>
                  </div>
                  
                </div>
              </>
            ) : currentPage === 'coinflip' ? (
              <CoinflipPage onRegisterModalOpen={() => setIsRegisterModalOpen(true)} />
            ) : currentPage === 'mines' ? (
              <MinesPage onRegisterModalOpen={() => setIsRegisterModalOpen(true)} />
            ) : currentPage === 'plinko' ? (
              <PlinkoPage onRegisterModalOpen={() => setIsRegisterModalOpen(true)} />
            ) : currentPage === 'deposit' ? (
              <DepositPage 
                onProceedToPayment={(amount) => {
                  setDepositAmount(amount);
                  setCurrentPage('payment-card');
                }}
              />
            ) : currentPage === 'withdraw' ? (
              <WithdrawPage />
            ) : currentPage === 'payment-card' ? (
              <PaymentCardPage 
                amount={depositAmount}
                onBack={() => setCurrentPage('deposit')}
              />
            ) : (
              <JackpotPage onRegisterModalOpen={() => setIsRegisterModalOpen(true)} />
            )}
          </div>
        </div>
      </div>

      {/* Right Chat Panel */}
      <div className="chat-panel">
        <div className="chat-header">
          <h3>LIVE CHAT</h3>
          <div className="online-indicator">
            <span>1112 online</span>
            <div className="status-dot"></div>
            <div className="status-dot"></div>
          </div>
        </div>
        
        <div className="chat-messages">
          {/* KYC Modal Overlay */}
          <div className="kyc-modal-overlay">
            <div className="kyc-modal">
              <div className="kyc-modal-header">
                <h4>KYC Verification Required</h4>
                <button className="kyc-close-btn">×</button>
              </div>
              <div className="kyc-modal-content">
                <p>To participate in chat, you need to complete KYC verification.</p>
                <div className="kyc-modal-actions">
                  <button className="kyc-btn kyc-btn-primary" onClick={handleStartKYC}>Start KYC</button>
                  <button className="kyc-btn kyc-btn-secondary">Later</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="message">
            <div className="user-avatar">
              <img src="/images/user-avatar1-56586a.jpg" alt="User" />
            </div>
            <div className="message-content">
              <div className="username">ZergsRustStakebanditcamp.com</div>
              <div className="message-text">Streak*</div>
            </div>
            <div className="user-badge">
              <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                <path d="M15.49 10.57L19.67 10.57L19.67 14.75L15.49 14.75L15.49 10.57Z" fill="url(#badgeGradient)"/>
                <path d="M13.64 11.55L18.56 11.55L18.56 16.28L13.64 16.28L13.64 11.55Z" fill="url(#badgeGradient2)"/>
                <defs>
                  <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4BBBFD"/>
                    <stop offset="100%" stopColor="#1D3C9E"/>
                  </linearGradient>
                  <linearGradient id="badgeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4BBBFD"/>
                    <stop offset="100%" stopColor="#1D3C9E"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <div className="message">
            <div className="user-avatar">
              <img src="/images/user-avatar2-56586a.jpg" alt="User" />
            </div>
            <div className="message-content">
              <div className="username">ZergsRustStakebanditcamp.com</div>
              <div className="message-text">And hopefully I end this 7 loss stream</div>
            </div>
            <div className="user-badge">
              <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                <path d="M15.49 10.57L19.67 10.57L19.67 14.75L15.49 14.75L15.49 10.57Z" fill="url(#badgeGradient)"/>
                <path d="M13.64 11.55L18.56 11.55L18.56 16.28L13.64 16.28L13.64 11.55Z" fill="url(#badgeGradient2)"/>
              </svg>
            </div>
          </div>
          
          <div className="message">
            <div className="user-avatar">
              <img src="/images/user-avatar3-56586a.jpg" alt="User" />
            </div>
            <div className="message-content">
              <div className="username">ZergsRustStakebanditcamp.com</div>
              <div className="message-text">Tomorrow I get to cf :)</div>
            </div>
            <div className="user-badge">
              <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                <path d="M15.49 10.57L19.67 10.57L19.67 14.75L15.49 14.75L15.49 10.57Z" fill="url(#badgeGradient)"/>
                <path d="M13.64 11.55L18.56 11.55L18.56 16.28L13.64 16.28L13.64 11.55Z" fill="url(#badgeGradient2)"/>
              </svg>
            </div>
          </div>
          
          <div className="message">
            <div className="user-avatar">
              <img src="/images/user-avatar4-56586a.jpg" alt="User" />
            </div>
            <div className="message-content">
              <div className="username">NotTerry</div>
              <div className="message-text">
                <img src="/images/pepe-emoji-56586a.png" alt="Pepe" style={{width: '28px', height: '28px'}} />
              </div>
            </div>
            <div className="user-badge">
              <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                <path d="M15.49 10.57L19.67 10.57L19.67 14.75L15.49 14.75L15.49 10.57Z" fill="url(#badgeGradient)"/>
                <path d="M13.64 11.55L18.56 11.55L18.56 16.28L13.64 16.28L13.64 11.55Z" fill="url(#badgeGradient2)"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="chat-rules-container">
          <div className="chat-rules-overlay"></div>
          <div className="chat-rules">
            <div className="rules-header">
              <span>Chat rules</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 7L7 13L1 7L7 1Z" fill="white"/>
                <path d="M4.4 2.9L9.69 2.9L9.69 8.37L4.4 8.37L4.4 2.9Z" fill="#161B2A" stroke="#161B2A" strokeWidth="0.2"/>
              </svg>
            </div>
        
            <div className="language-tabs">
              <div className="lang-tab active">
                <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                  <rect width="17" height="12" fill="#E6E7E8"/>
                  <rect y="10.88" width="17" height="0.89" fill="#DA2128"/>
                  <rect y="9.1" width="17" height="0.89" fill="#DA2128"/>
                  <rect y="7.32" width="17" height="0.89" fill="#DA2128"/>
                  <rect y="5.54" width="17" height="0.89" fill="#DA2128"/>
                  <rect y="3.77" width="17" height="0.89" fill="#DA2128"/>
                  <rect y="1.99" width="17" height="0.89" fill="#DA2128"/>
                  <rect y="0.23" width="17" height="0.89" fill="#DA2128"/>
                  <rect width="8.62" height="6.21" fill="#006BB5"/>
                </svg>
                <span>EN room</span>
              </div>
              
              <div className="lang-tab">
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                  <rect width="18" height="12" fill="#E6E7E8"/>
                  <rect y="7.66" width="18" height="4.18" fill="#DF3A3D"/>
                  <rect y="0" width="18" height="4.18" fill="white"/>
                  <rect y="4.18" width="18" height="3.48" fill="#05539D"/>
                </svg>
                <span>RU room</span>
              </div>
              
              <div className="lang-tab">
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                  <rect y="8.64" width="18" height="2.88" fill="#C60B1E"/>
                  <rect y="2.88" width="18" height="5.76" fill="#FFC400"/>
                  <rect y="0" width="18" height="2.88" fill="#C60B1E"/>
                </svg>
                <span>ES room</span>
              </div>
            </div>
            
            <div className="chat-actions">
            </div>
          </div>
        </div>
        
        <div className="chat-input">
          <div className="input-field">
            <input type="text" placeholder="Type your message..." />
            <button className="send-button">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 1L21 11L11 21L1 11L11 1Z" fill="white"/>
                <path d="M6.84 6.6L15.16 6.6L15.16 15.4L6.84 15.4L6.84 6.6Z" fill="#161B2A"/>
                <path d="M5.5 13.22L16.5 13.22L16.5 16.78L5.5 16.78L5.5 13.22Z" fill="#161B2A"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Footer */}
      <div className="mobile-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#" className="footer-link">Terms</a>
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Support</a>
          </div>
          <div className="footer-copyright">
            <span>© 2024 Mister Berg Casino. All rights reserved.</span>
          </div>
        </div>
      </div>
      
      {/* Auth Modals */}
      {isLoginModalOpen && (
        <LoginPage 
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToRegister={() => { setIsLoginModalOpen(false); setIsRegisterModalOpen(true); }}
        />
      )}
      {isRegisterModalOpen && (
        <RegisterPage onClose={() => setIsRegisterModalOpen(false)} />
      )}
    </div>
  );
};

export default HomePage;