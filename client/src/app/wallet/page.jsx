import React, { useState } from 'react';
import { useBalance } from '../../hooks/useBalance';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PaymentCard from '../../components/payments/PaymentCard';
import Loader from '../../components/ui/Loader';
import { formatCurrency, formatDateTime } from '../../lib/utils/format';
import { PAYMENT_METHODS } from '../../lib/constants';
import './wallet.css';

const WalletPage = () => {
  const { 
    balance, 
    loading, 
    transactions, 
    transactionsLoading,
    deposit, 
    withdraw,
    refreshBalance 
  } = useBalance();
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [operationLoading, setOperationLoading] = useState(false);

  const paymentMethods = [
    {
      id: PAYMENT_METHODS.CARD,
      title: 'Банковская карта',
      description: 'Visa, MasterCard, МИР',
      icon: '💳'
    },
    {
      id: PAYMENT_METHODS.CRYPTO,
      title: 'Криптовалюта',
      description: 'Bitcoin, Ethereum, USDT',
      icon: '₿'
    },
    {
      id: PAYMENT_METHODS.E_WALLET,
      title: 'Электронный кошелек',
      description: 'Qiwi, WebMoney, ЮMoney',
      icon: '💰'
    }
  ];

  const handleDeposit = async () => {
    if (!amount || !selectedPaymentMethod) return;
    
    setOperationLoading(true);
    const result = await deposit(parseFloat(amount), selectedPaymentMethod);
    setOperationLoading(false);
    
    if (result.success) {
      setShowDepositModal(false);
      setAmount('');
      setSelectedPaymentMethod('');
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !selectedPaymentMethod) return;
    
    setOperationLoading(true);
    const result = await withdraw(parseFloat(amount), selectedPaymentMethod);
    setOperationLoading(false);
    
    if (result.success) {
      setShowWithdrawModal(false);
      setAmount('');
      setSelectedPaymentMethod('');
    }
  };

  if (loading) {
    return <Loader overlay text="Загрузка кошелька..." />;
  }

  return (
    <div className="wallet-page">
      <div className="container">
        <div className="wallet-header">
          <h1>Кошелек</h1>
          <Button onClick={refreshBalance} variant="secondary" size="small">
            Обновить
          </Button>
        </div>

        <div className="wallet-balance-card">
          <div className="balance-info">
            <h2>Баланс</h2>
            <div className="balance-amount">
              {formatCurrency(balance)}
            </div>
          </div>
          <div className="balance-actions">
            <Button 
              onClick={() => setShowDepositModal(true)}
              variant="primary"
              size="large"
            >
              Пополнить
            </Button>
            <Button 
              onClick={() => setShowWithdrawModal(true)}
              variant="secondary"
              size="large"
            >
              Вывести
            </Button>
          </div>
        </div>

        <div className="wallet-transactions">
          <h3>История транзакций</h3>
          
          {transactionsLoading ? (
            <Loader text="Загрузка транзакций..." />
          ) : transactions.length > 0 ? (
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-type">
                      {transaction.type === 'deposit' ? '↗️' : '↙️'} 
                      {transaction.type === 'deposit' ? 'Пополнение' : 'Вывод'}
                    </div>
                    <div className="transaction-date">
                      {formatDateTime(transaction.createdAt)}
                    </div>
                  </div>
                  <div className="transaction-amount">
                    <span className={transaction.type === 'deposit' ? 'positive' : 'negative'}>
                      {transaction.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <div className="transaction-status">
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-transactions">
              <p>История транзакций пуста</p>
            </div>
          )}
        </div>

        {/* Deposit Modal */}
        <Modal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          title="Пополнение счета"
          size="medium"
        >
          <div className="payment-modal">
            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <PaymentCard
                  key={method.id}
                  title={method.title}
                  description={method.description}
                  icon={method.icon}
                  isSelected={selectedPaymentMethod === method.id}
                  onSelect={() => setSelectedPaymentMethod(method.id)}
                />
              ))}
            </div>
            
            <div className="amount-input">
              <label>Сумма пополнения</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="form-input"
                min="10"
                max="100000"
              />
            </div>
            
            <div className="modal-actions">
              <Button
                onClick={handleDeposit}
                disabled={!amount || !selectedPaymentMethod || operationLoading}
                variant="primary"
                size="large"
                className="w-full"
              >
                {operationLoading ? 'Обработка...' : 'Пополнить'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Withdraw Modal */}
        <Modal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          title="Вывод средств"
          size="medium"
        >
          <div className="payment-modal">
            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <PaymentCard
                  key={method.id}
                  title={method.title}
                  description={method.description}
                  icon={method.icon}
                  isSelected={selectedPaymentMethod === method.id}
                  onSelect={() => setSelectedPaymentMethod(method.id)}
                />
              ))}
            </div>
            
            <div className="amount-input">
              <label>Сумма вывода</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="form-input"
                min="10"
                max={balance}
              />
              <div className="available-balance">
                Доступно: {formatCurrency(balance)}
              </div>
            </div>
            
            <div className="modal-actions">
              <Button
                onClick={handleWithdraw}
                disabled={!amount || !selectedPaymentMethod || operationLoading || parseFloat(amount) > balance}
                variant="primary"
                size="large"
                className="w-full"
              >
                {operationLoading ? 'Обработка...' : 'Вывести'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WalletPage;


