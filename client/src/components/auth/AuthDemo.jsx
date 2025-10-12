import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import UserService from '../../services/UserService';
import './AuthDemo.css';

const AuthDemo = () => {
  const { user, loading, error, isAuthenticated, login, register, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await register(email, password);
  };

  const getUsers = async () => {
    try {
      const response = await UserService.fetchUsers();
      setUsers(response.data);
    } catch (error) {
      console.log(error.response?.data?.message);
    }
  };

  if (loading) {
    return <div className="auth-demo-loading">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-demo">
        <h1>Аутентификация</h1>
        <form className="auth-demo-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-demo-input"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-demo-input"
          />
          <div className="auth-demo-buttons">
            <button onClick={handleLogin} className="auth-demo-button">
              Войти
            </button>
            <button onClick={handleRegister} className="auth-demo-button">
              Регистрация
            </button>
          </div>
        </form>
        {error && <div className="auth-demo-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="auth-demo">
      <h1>Добро пожаловать!</h1>
      <div className="auth-demo-user">
        <p>Пользователь авторизован: {user.email}</p>
        <p>ID: {user.id}</p>
        <p>Активирован: {user.isActivated ? 'Да' : 'Нет'}</p>
      </div>
      <button onClick={logout} className="auth-demo-button">
        Выйти
      </button>
      <div className="auth-demo-users">
        <button onClick={getUsers} className="auth-demo-button">
          Получить список пользователей
        </button>
        {users.length > 0 && (
          <div className="auth-demo-users-list">
            <h3>Список пользователей:</h3>
            {users.map((u) => (
              <div key={u.id} className="auth-demo-user-item">
                {u.email}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDemo;

