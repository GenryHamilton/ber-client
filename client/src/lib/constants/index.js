// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    KYC: '/user/kyc',
  },
  WALLET: {
    BALANCE: '/wallet/balance',
    DEPOSIT: '/wallet/deposit',
    WITHDRAW: '/wallet/withdraw',
    TRANSACTIONS: '/wallet/transactions',
  },
};

// WebSocket Events
export const WS_EVENTS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  BALANCE_UPDATE: 'balance_update',
  TRANSACTION_UPDATE: 'transaction_update',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_CARD: 'bank_card',
  ALFA_CLICK: 'alfa_click',
  TPAY: 'tpay',
  SBER: 'sber',
  OZON: 'ozon',
  PSB: 'psb',
  VTB: 'vtb',
  CRYPTO: 'crypto',
  BANK_TRANSFER: 'bank_transfer',
  E_WALLET: 'e_wallet',
};

// KYC Status
export const KYC_STATUS = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  BET: 'bet',
  WIN: 'win',
  BONUS: 'bonus',
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  GAME_SETTINGS: 'game_settings',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  INVALID_CREDENTIALS: 'Неверный email или пароль.',
  SESSION_EXPIRED: 'Сессия истекла. Войдите в систему заново.',
  INSUFFICIENT_FUNDS: 'Недостаточно средств на счете.',
  KYC_REQUIRED: 'Требуется верификация документов.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Вход выполнен успешно',
  REGISTER_SUCCESS: 'Регистрация завершена успешно',
  DEPOSIT_SUCCESS: 'Пополнение счета выполнено',
  WITHDRAWAL_SUCCESS: 'Запрос на вывод средств отправлен',
  PROFILE_UPDATED: 'Профиль обновлен',
};


