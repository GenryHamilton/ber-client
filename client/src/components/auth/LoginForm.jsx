import React, { useState } from 'react';
import Button from '../ui/Button';
import './AuthForms.css';

const LoginForm = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        <h2>Вход в казино</h2>
        <p>Добро пожаловать обратно!</p>
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="your@email.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Пароль</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="••••••••"
        />
      </div>

      <div className="form-actions">
        <Button 
          type="submit" 
          variant="primary" 
          size="large"
          disabled={isLoading}
          className="auth-submit-btn"
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </Button>
      </div>

      <div className="auth-links">
        <a href="/register" className="auth-link">
          Нет аккаунта? Зарегистрироваться
        </a>
      </div>
    </form>
  );
};

export default LoginForm;


