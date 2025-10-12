import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './RegisterPage.css';

const RegisterPage = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const { register, loading, error } = useAuth();

  useEffect(() => {
    // Проверяем URL параметр ref
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('ref');
    
    if (refFromUrl) {
      // Сохраняем в localStorage
      localStorage.setItem('referralCode', refFromUrl.toUpperCase());
      setReferralCode(refFromUrl.toUpperCase());
    } else {
      // Проверяем localStorage
      const savedRef = localStorage.getItem('referralCode');
      if (savedRef) {
        setReferralCode(savedRef);
      }
    }
  }, []);

  const handleRegister = async () => {
    if (email.trim() && password.trim()) {
      const result = await register(email, password, referralCode || null);
      if (result.success) {
        // Очищаем реферальный код после успешной регистрации
        localStorage.removeItem('referralCode');
        onClose();
      }
    }
  };

  const handleDailyCaseOpen = () => {
    console.log('Opening daily case');
    // Здесь будет логика для открытия ежедневного кейса
  };

  return (
    <div className="register-modal-overlay" onClick={onClose}>
      <div className="register-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-background">
          <img src="/images/free-coins-rain.png" alt="Free Coins Rain" />
        </div>
        
        <div className="modal-header">
          <div className="header-content">
            <h2 className="header-title">Register</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="7" fill="#8C98A9"/>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          <div className="form-section">
            <div className="form-input-group">
              <div className="form-header">
                <label className="form-label">Name</label>
              </div>
              
              <div className="input-container">
                <div className="input-background"></div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-input-group">
              <div className="form-header">
                <label className="form-label">Email</label>
              </div>
              
              <div className="input-container">
                <div className="input-background"></div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-input-group">
              <div className="form-header">
                <label className="form-label">Password</label>
              </div>
              
              <div className="input-container">
                <div className="input-background"></div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                />
              </div>
            </div>

            <button className="register-button" onClick={handleRegister} disabled={loading}>
              <span className="register-text">{loading ? 'Loading...' : 'Register'}</span>
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="features-section">
            <div className="feature-card daily-cases" onClick={handleDailyCaseOpen}>
              <div className="feature-content">
                <div className="feature-text">
                  <h3 className="feature-title">DAILY CASES</h3>
                  <p className="feature-description">Click here to open your daily free case</p>
                </div>
                <div className="feature-image">
                  <img src="/images/free-daily-case.png" alt="Daily Case" />
                </div>
              </div>
            </div>

            <div className="feature-card flash-codes">
              <div className="feature-content">
                <div className="feature-text">
                  <h3 className="feature-title">FLASH CODES</h3>
                  <p className="feature-description">On our social media</p>
                </div>
                <div className="social-media">
                  <div className="social-icon">
                    <img src="/images/social-media-1.png" alt="Social Media 1" />
                  </div>
                  <div className="social-icon">
                    <img src="/images/social-media-2.png" alt="Social Media 2" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
