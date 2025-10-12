import React, { useState } from 'react';
import { useBalance } from '../../hooks/useBalance';
import Loader from '../../components/ui/Loader';
import { formatCurrency } from '../../lib/utils/format';
import { PAYMENT_METHODS } from '../../lib/constants';
import './deposit.css';

const DepositPage = ({ onProceedToPayment }) => {
  const { 
    balance, 
    loading, 
    deposit
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

  const handleDeposit = async () => {
    if (!amount || !selectedPaymentMethod) return;
    
    // If onProceedToPayment is provided, go to payment page
    if (onProceedToPayment) {
      onProceedToPayment(amount);
      return;
    }
    
    setOperationLoading(true);
    const result = await deposit(parseFloat(amount), selectedPaymentMethod);
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
    <div className="deposit-page">
      <div className="deposit-container">
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

        {/* Right Panel - Deposit Form */}
        <div className="deposit-form-panel">
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
            <h3 className="section-title">Deposit amount</h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="300"
              className="amount-input-large"
              min="300"
              max="300000"
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

          <div className="deposit-info-box">
            <div className="info-icon">💰</div>
            <div className="info-text">
              <div>Minimum deposit amount - 300 AXION</div>
              <div>Maximum deposit amount - 300 000 AXION</div>
            </div>
          </div>

          <button
            className="submit-btn"
            onClick={handleDeposit}
            disabled={!amount || !selectedPaymentMethod || operationLoading || parseFloat(amount) < 300}
          >
            {operationLoading ? 'Processing...' : 'Proceed to payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositPage;

