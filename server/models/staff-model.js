const { Schema, model } = require('mongoose');

const StaffSchema = new Schema({
    telegramId: { type: Number, unique: true, required: true },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    role: { 
        type: String, 
        enum: ['admin', 'staff'], 
        default: 'staff',
        required: true 
    },
    isActive: { type: Boolean, default: true },
    permissions: {
        canCreatePromoCodes: { type: Boolean, default: true },
        canViewStats: { type: Boolean, default: true },
        canManageUsers: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: 'system' }
});

// Index for faster queries
StaffSchema.index({ telegramId: 1 });
StaffSchema.index({ role: 1 });
StaffSchema.index({ isActive: 1 });

module.exports = model('Staff', StaffSchema);


