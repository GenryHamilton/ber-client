const { Schema, model } = require('mongoose');

const ReferralCodeSchema = new Schema({
    code: { type: String, unique: true, required: true, uppercase: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: 'admin' }
});

module.exports = model('ReferralCode', ReferralCodeSchema);

