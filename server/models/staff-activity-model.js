const { Schema, model } = require('mongoose');

const StaffActivitySchema = new Schema({
    staffId: { type: Number, required: true }, // Telegram ID сотрудника
    staffName: { type: String }, // имя сотрудника для удобства
    action: { 
        type: String, 
        enum: [
            'create_promocode',
            'toggle_promocode', 
            'view_stats',
            'manage_user',
            'send_notification',
            'access_denied',
            'login'
        ],
        required: true 
    },
    details: { type: String }, // дополнительные детали действия
    targetId: { type: String }, // ID объекта действия (промокод, пользователь и т.д.)
    targetType: { 
        type: String, 
        enum: ['promocode', 'user', 'referral_code', 'system'] 
    },
    
    // Контекст действия
    chatType: { 
        type: String, 
        enum: ['admin_chat', 'staff_chat', 'private'], 
        required: true 
    },
    chatId: { type: Number }, // ID чата где произошло действие
    
    // Метаданные
    ipAddress: { type: String },
    userAgent: { type: String },
    
    // Результат действия
    success: { type: Boolean, default: true },
    errorMessage: { type: String },
    
    createdAt: { type: Date, default: Date.now }
});

// Индексы для быстрого поиска и аналитики
StaffActivitySchema.index({ staffId: 1, createdAt: -1 });
StaffActivitySchema.index({ action: 1 });
StaffActivitySchema.index({ chatType: 1 });
StaffActivitySchema.index({ createdAt: -1 });
StaffActivitySchema.index({ success: 1 });

module.exports = model('StaffActivity', StaffActivitySchema);


