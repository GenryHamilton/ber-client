// User types
export const UserRoles = {
  PLAYER: 'player',
  VIP: 'vip',
  ADMIN: 'admin',
};

export const UserStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
};

// Transaction types
export const TransactionTypes = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  BET: 'bet',
  WIN: 'win',
  BONUS: 'bonus',
  REFUND: 'refund',
};

export const TransactionStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// Payment types
export const PaymentMethods = {
  CARD: 'card',
  CRYPTO: 'crypto',
  BANK_TRANSFER: 'bank_transfer',
  E_WALLET: 'e_wallet',
  MOBILE_PAYMENT: 'mobile_payment',
};

export const CryptoCurrencies = {
  BITCOIN: 'BTC',
  ETHEREUM: 'ETH',
  LITECOIN: 'LTC',
  USDT: 'USDT',
};

// KYC types
export const KYCStatus = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

export const DocumentTypes = {
  PASSPORT: 'passport',
  DRIVERS_LICENSE: 'drivers_license',
  ID_CARD: 'id_card',
  UTILITY_BILL: 'utility_bill',
  BANK_STATEMENT: 'bank_statement',
};

// Notification types
export const NotificationTypes = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// Modal types
export const ModalSizes = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  FULL: 'full',
};

// Button variants
export const ButtonVariants = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  GHOST: 'ghost',
};

export const ButtonSizes = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

// API Response types
export const ApiStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
};

// Validation patterns
export const ValidationPatterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
};


