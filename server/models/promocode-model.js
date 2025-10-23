const { Schema, model } = require('mongoose');

const PromoCodeSchema = new Schema({
    code: { type: String, unique: true, required: true, uppercase: true },
    name: { type: String, required: true },
    description: { type: String },
    type: { 
        type: String, 
        enum: ['discount', 'bonus', 'referral'], 
        default: 'discount',
        required: true 
    },
    value: { type: Number, required: true }, // процент скидки или сумма бонуса
    currency: { type: String, default: 'AXION' },
    
    // Ограничения использования
    usageLimit: { type: Number }, // общий лимит использований
    usageLimitPerUser: { type: Number, default: 1 }, // лимит на пользователя
    usedCount: { type: Number, default: 0 },
    
    // Временные ограничения
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date },
    
    // Статус и создатель
    isActive: { type: Boolean, default: true },
    createdBy: { type: Number, required: true }, // Telegram ID создателя
    createdByName: { type: String }, // имя создателя для удобства
    
    // Статистика
    totalUsed: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }, // общая сумма скидок/бонусов
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Индексы для быстрого поиска
PromoCodeSchema.index({ code: 1 });
PromoCodeSchema.index({ isActive: 1 });
PromoCodeSchema.index({ createdBy: 1 });
PromoCodeSchema.index({ validFrom: 1, validUntil: 1 });

// Middleware для обновления updatedAt
PromoCodeSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = model('PromoCode', PromoCodeSchema);


