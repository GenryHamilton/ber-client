import React, { useState } from 'react';
import { useBalance } from '../../hooks/useBalance';
import Loader from '../../components/ui/Loader';
import { formatCurrency } from '../../lib/utils/format';
import { PAYMENT_METHODS } from '../../lib/constants';
import './withdraw.css';

const WithdrawPage = () => {
  const { 
    balance, 
    loading, 
    withdraw
  } = useBalance();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [operationLoading, setOperationLoading] = useState(false);

  const paymentMethods = [
    {
      id: PAYMENT_METHODS.CARD,
      title: 'Bank Card',
      icon: '💳',
      commission: '0%'
    }
  ];

  const quickAmounts = [305, 310, 315, 325, 335, 350];

  const handleWithdraw = async () => {
    if (!amount || !selectedPaymentMethod) return;
    
    setOperationLoading(true);
    const result = await withdraw(parseFloat(amount), selectedPaymentMethod);
    setOperationLoading(false);
    
    if (result.success) {
      setAmount('');
      setSelectedPaymentMethod('');
    }
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  if (loading) {
    return <Loader overlay text="Loading..." />;
  }

  return (
    <div className="withdraw-page">
      <div className="withdraw-container">
        {/* Left Panel - Payment Methods */}
        <div className="payment-methods-panel">
          <h2 className="panel-title">Payment Method</h2>
          <div className="payment-methods-list">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`payment-method-item ${selectedPaymentMethod === method.id ? 'active' : ''}`}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <div className="method-icon">{method.icon}</div>
                <div className="method-name">{method.title}</div>
                <div className="method-commission">{method.commission}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Withdraw Form */}
        <div className="withdraw-form-panel">
          <div className="form-header">
            <div className="selected-method">
              <span className="label">Payment method:</span>
              <div className="method-display">
                <div className="method-icon-small">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon || '💳'}
                </div>
                <span className="method-name-small">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.title || 'Not selected'}
                </span>
              </div>
            </div>
            <button className="history-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 2V6M13 2V6M3 8H17" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              History
            </button>
          </div>

          <div className="amount-section">
            <h3 className="section-title">Withdrawal amount</h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="300"
              className="amount-input-large"
              min="300"
              max={balance}
            />

            <div className="quick-amounts-row">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  className={`quick-btn ${amount === quickAmount.toString() ? 'active' : ''}`}
                  onClick={() => handleQuickAmount(quickAmount)}
                >
                  {quickAmount}
                </button>
              ))}
            </div>
          </div>

          <div className="withdraw-info-box">
            <div className="info-icon">💰</div>
            <div className="info-text">
              <div>Minimum withdrawal amount - 300 AXION</div>
              <div>Maximum withdrawal amount - {balance.toFixed(2)} AXION</div>
              <div>Available balance: {balance.toFixed(2)} AXION</div>
            </div>
          </div>

          <button
            className="submit-btn"
            onClick={handleWithdraw}
            disabled={!amount || !selectedPaymentMethod || operationLoading || parseFloat(amount) < 300 || parseFloat(amount) > balance}
          >
            {operationLoading ? 'Processing...' : 'Proceed to withdrawal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;

