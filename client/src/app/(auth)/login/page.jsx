import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LoginForm from '../../../components/auth/LoginForm';
import Loader from '../../../components/ui/Loader';
import './login.css';

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const { t } = useTranslation();
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setSubmitLoading(true);
    try {
      const result = await login(credentials.email, credentials.password);
      if (result.success) {
        window.location.href = '/casino';
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="login-page">
        <Loader overlay text={t('auth.loading')} />
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <h1>🎰 Axion Casino</h1>
          <p>{t('auth.premiumCasino')}</p>
        </div>
        
        <div className="login-form-container">
          <LoginForm 
            onSubmit={handleLogin} 
            isLoading={submitLoading}
          />
          
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}
        </div>
        
        <div className="login-footer">
          <p>© 2024 Axion Casino. {t('auth.allRightsReserved')}.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


