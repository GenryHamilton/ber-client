import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './payment-card.css';
import UserService from '../../services/UserService';
import Modal from '../../components/ui/Modal/Modal';
import PaymentNotification from '../../components/ui/PaymentNotification';

const PaymentCardPage = ({ amount, onBack }) => {
  const { t } = useTranslation();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [show3DS, setShow3DS] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingPaymentData, setPendingPaymentData] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ success: false, message: '', transactionId: '' });

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.replace(/\//g, '').length <= 4) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cardNumber || !expiryDate || !cvv || !cardHolder) {
      alert(t('payment.fillAllFields'));
      return;
    }

    setIsProcessing(true);
    
    const paymentData = {
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiryDate,
      cvv,
      cardHolder,
      amount: amount || 0
    };

    try {
      // Check authorization
      const token = localStorage.getItem('token');
      console.log('💳 Sending payment. Token:', token ? 'yes' : 'NO');
      
      // Send payment to server
      const response = await UserService.processPayment(paymentData);

      // If 3DS verification required
      if (response.data.requires3DS) {
        console.log('3DS verification required');
        setPendingPaymentData({
          ...paymentData,
          transactionId: response.data.transactionId
        });
        setShow3DS(true);
        setIsProcessing(false);
        return;
      }

      // Show result (confirmed or cancelled)
      setNotificationData({
        success: response.data.success,
        message: response.data.message,
        transactionId: response.data.transactionId
      });
      setShowNotification(true);

      // Clear form on success
      if (response.data.success) {
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
        setCardHolder('');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setNotificationData({
        success: false,
        message: error.response?.data?.message || 'Payment processing error',
        transactionId: ''
      });
      setShowNotification(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handle3DSVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert(t('payment.enter6DigitCode'));
      return;
    }

    setIsProcessing(true);
    
    try {
      // Send 3DS code to server for administrator verification
      const response = await UserService.verify3DS({
        transactionId: pendingPaymentData.transactionId,
        verificationCode,
        paymentData: pendingPaymentData
      });

      // Close 3DS modal
      setShow3DS(false);
      
      // Show result notification
      setNotificationData({
        success: response.data.success,
        message: response.data.message,
        transactionId: response.data.transactionId
      });
      setShowNotification(true);

      // Clear form only on success
      if (response.data.success) {
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
        setCardHolder('');
        setVerificationCode('');
        setPendingPaymentData(null);
      }
    } catch (error) {
      // Error handling
      console.error('3DS verification error:', error);
      setShow3DS(false);
      
      setNotificationData({
        success: false,
        message: error.response?.data?.message || '3DS verification error',
        transactionId: pendingPaymentData?.transactionId || ''
      });
      setShowNotification(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel3DS = () => {
    setShow3DS(false);
    setVerificationCode('');
    setPendingPaymentData(null);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    // If payment successful, go back
    if (notificationData.success && onBack) {
      onBack();
    }
  };

  return (
    <>
      <div className="payment-card-page">
        <div className="payment-card-wrapper">
          <div className="payment-card-header">
            <h1>Payment Details</h1>
            {onBack && (
              <button className="back-btn" onClick={onBack}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 10H5M5 10L10 5M5 10L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>

        <div className="payment-card-content">
          {/* Amount Display */}
          <div className="amount-display-card">
            <div className="amount-label">Amount to pay:</div>
            <div className="amount-value">{amount || '0'} AXION</div>
          </div>

          {/* Card Form */}
          <form className="card-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2 className="section-title">Card Information</h2>
              
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Card Holder Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="JOHN DOE"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className="payment-info-box">
              <div className="info-icon">🔒</div>
              <div className="info-text">
                <div>Your payment information is secure and encrypted</div>
                <div>We do not store your card details</div>
              </div>
            </div>

            <button
              type="submit"
              className="submit-payment-btn"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ${amount || '0'} AXION`}
            </button>
          </form>
        </div>
      </div>
      </div>

      {/* 3DS Verification Modal */}
      <Modal 
        isOpen={show3DS} 
        onClose={handleCancel3DS}
        title="3D Secure Verification"
        size="small"
        showCloseButton={false}
      >
        <div className="three-ds-modal">
          <div className="three-ds-logo">
            <div className="secure-badge">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" 
                      stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#4CAF50" fillOpacity="0.1"/>
                <path d="M9 12L11 14L15 10" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div className="three-ds-content">
            <h3>{t('payment.paymentConfirmation')}</h3>
            <p>{t('payment.enterCode')}</p>
            
            <div className="three-ds-amount">
              <span>{t('balance.amount')}:</span>
              <strong>{amount || '0'} AXION</strong>
            </div>

            <div className="verification-code-input">
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="code-input"
              />
            </div>

            <div className="three-ds-buttons">
              <button 
                className="btn-verify"
                onClick={handle3DSVerification}
                disabled={isProcessing || verificationCode.length !== 6}
              >
                {isProcessing ? t('payment.checking') : t('payment.confirm')}
              </button>
              <button 
                className="btn-cancel"
                onClick={handleCancel3DS}
                disabled={isProcessing}
              >
                {t('payment.cancel')}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Payment Notification Modal */}
      <PaymentNotification
        isOpen={showNotification}
        onClose={handleCloseNotification}
        success={notificationData.success}
        message={notificationData.message}
        transactionId={notificationData.transactionId}
      />
    </>
  );
};

export default PaymentCardPage;

