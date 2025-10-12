const { Schema, model } = require('mongoose');

const PaymentTrackingSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true },
    referralCode: { type: String },
    status: { type: String, enum: ['success', 'cancelled'], required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = model('PaymentTracking', PaymentTrackingSchema);

