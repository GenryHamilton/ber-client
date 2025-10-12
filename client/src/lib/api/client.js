const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // User methods
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(data) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Wallet methods
  async getBalance() {
    return this.request('/wallet/balance');
  }

  async deposit(amount, paymentMethod) {
    return this.request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod }),
    });
  }

  async withdraw(amount, withdrawMethod) {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, withdrawMethod }),
    });
  }

  async getTransactions(page = 1, limit = 20) {
    return this.request(`/wallet/transactions?page=${page}&limit=${limit}`);
  }
}

export default new ApiClient();


