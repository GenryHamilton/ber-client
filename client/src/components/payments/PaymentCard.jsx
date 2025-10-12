import React from 'react';
import Button from '../ui/Button';
import './PaymentCard.css';

const PaymentCard = ({ 
  title, 
  description, 
  icon, 
  onSelect, 
  isSelected = false,
  disabled = false 
}) => {
  return (
    <div 
      className={`payment-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onSelect : undefined}
    >
      <div className="payment-card-icon">
        {icon}
      </div>
      <div className="payment-card-content">
        <h3 className="payment-card-title">{title}</h3>
        <p className="payment-card-description">{description}</p>
      </div>
      <div className="payment-card-action">
        <Button 
          variant={isSelected ? "primary" : "secondary"} 
          size="small"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? 'Выбрано' : 'Выбрать'}
        </Button>
      </div>
    </div>
  );
};

export default PaymentCard;


