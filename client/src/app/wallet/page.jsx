import React, { useState } from 'react';
import { useBalance } from '../../hooks/useBalance';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [operationLoading, setOperationLoading] = useState(false);

  const paymentMethods = [
    {
      id: PAYMENT_METHODS.CARD,
      title: t('payment.bankCard'),
      description: 'Visa, MasterCard, MIR',
      icon: '💳'
    },
    {
      id: PAYMENT_METHODS.CRYPTO,
      title: t('payment.cryptocurrency'),
      description: 'Bitcoin, Ethereum, USDT',
      icon: '₿'
    },
    {
      id: PAYMENT_METHODS.E_WALLET,
      title: t('payment.eWallet'),
      description: 'Qiwi, WebMoney, YuMoney',
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
    return <Loader overlay text={t('auth.loading')} />;
  }

  return (
    <div className="wallet-page">
      <div className="container">
        <div className="wallet-header">
          <h1>{t('wallet.wallet')}</h1>
          <Button onClick={refreshBalance} variant="secondary" size="small">
            {t('balance.refresh')}
          </Button>
        </div>

        <div className="wallet-balance-card">
          <div className="balance-info">
            <h2>{t('balance.balance')}</h2>
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
              {t('balance.deposit')}
            </Button>
            <Button 
              onClick={() => setShowWithdrawModal(true)}
              variant="secondary"
              size="large"
            >
              {t('balance.withdraw')}
            </Button>
          </div>
        </div>

        <div className="wallet-transactions">
          <h3>{t('wallet.transactionHistory')}</h3>
          
          {transactionsLoading ? (
            <Loader text={t('wallet.loadingTransactions')} />
          ) : transactions.length > 0 ? (
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-type">
                      {transaction.type === 'deposit' ? '↗️' : '↙️'} 
                      {transaction.type === 'deposit' ? t('balance.deposit') : t('wallet.withdrawal')}
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
              <p>{t('wallet.emptyHistory')}</p>
            </div>
          )}
        </div>

        {/* Deposit Modal */}
        <Modal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          title={t('wallet.depositFunds')}
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
              <label>{t('wallet.depositAmount')}</label>
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
                {operationLoading ? t('wallet.processing') : t('balance.deposit')}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Withdraw Modal */}
        <Modal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          title={t('wallet.withdrawFunds')}
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
              <label>{t('wallet.withdrawalAmount')}</label>
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
                {t('balance.available')}: {formatCurrency(balance)}
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
                {operationLoading ? t('wallet.processing') : t('balance.withdraw')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WalletPage;


