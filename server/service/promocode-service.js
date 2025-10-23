const PromoCodeModel = require('../models/promocode-model');
const StaffService = require('./staff-service');
const ApiError = require('../exceptions/api-error');

class PromoCodeService {
    // Создание нового промокода
    async createPromoCode(createdBy, promoData) {
        try {
            const {
                code,
                name,
                description,
                type = 'discount',
                value,
                currency = 'AXION',
                usageLimit,
                usageLimitPerUser = 1,
                validUntil
            } = promoData;

            // Проверяем права доступа
            const staff = await StaffService.checkStaffAccess(createdBy, 'staff', 'create_promocode');

            // Проверяем уникальность кода
            const existingCode = await PromoCodeModel.findOne({ code: code.toUpperCase() });
            if (existingCode) {
                throw ApiError.BadRequest(`Promo code ${code} already exists`);
            }

            // Валидация данных
            if (!code || !name || !value) {
                throw ApiError.BadRequest('Code, name and value are required');
            }

            if (value <= 0) {
                throw ApiError.BadRequest('Value must be greater than 0');
            }

            if (type === 'discount' && value > 100) {
                throw ApiError.BadRequest('Discount percentage cannot exceed 100%');
            }

            // Создаем промокод
            const promoCode = await PromoCodeModel.create({
                code: code.toUpperCase(),
                name,
                description,
                type,
                value,
                currency,
                usageLimit,
                usageLimitPerUser,
                validUntil: validUntil ? new Date(validUntil) : null,
                createdBy,
                createdByName: `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || staff.username || 'Unknown'
            });

            // Логируем активность
            await StaffService.logActivity(
                createdBy,
                'create_promocode',
                `Created promo code: ${code} (${type}, value: ${value}${type === 'discount' ? '%' : ' ' + currency})`,
                'promocode',
                'private',
                null,
                true
            );

            return promoCode;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error creating promo code:', error);
            throw ApiError.Internal('Error creating promo code');
        }
    }

    // Получение промокода по коду
    async getPromoCode(code) {
        try {
            const promoCode = await PromoCodeModel.findOne({ 
                code: code.toUpperCase(),
                isActive: true 
            });

            if (!promoCode) {
                throw ApiError.NotFound('Promo code not found or inactive');
            }

            // Проверяем срок действия
            const now = new Date();
            if (promoCode.validUntil && promoCode.validUntil < now) {
                throw ApiError.BadRequest('Promo code has expired');
            }

            if (promoCode.validFrom && promoCode.validFrom > now) {
                throw ApiError.BadRequest('Promo code is not yet active');
            }

            return promoCode;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error getting promo code:', error);
            throw ApiError.Internal('Error getting promo code');
        }
    }

    // Использование промокода
    async usePromoCode(code, userId) {
        try {
            const promoCode = await this.getPromoCode(code);

            // Проверяем общий лимит использований
            if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
                throw ApiError.BadRequest('Promo code usage limit exceeded');
            }

            // TODO: Добавить проверку лимита на пользователя
            // Это потребует создания модели PromoCodeUsage для отслеживания использований

            // Обновляем счетчик использований
            await PromoCodeModel.updateOne(
                { _id: promoCode._id },
                { 
                    $inc: { usedCount: 1 },
                    updatedAt: new Date()
                }
            );

            return promoCode;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error using promo code:', error);
            throw ApiError.Internal('Error using promo code');
        }
    }

    // Активация/деактивация промокода
    async togglePromoCode(code, createdBy) {
        try {
            const promoCode = await PromoCodeModel.findOne({ code: code.toUpperCase() });
            
            if (!promoCode) {
                throw ApiError.NotFound('Promo code not found');
            }

            // Проверяем права (только создатель или админ)
            const staff = await StaffService.checkStaffAccess(createdBy, 'staff');
            if (promoCode.createdBy !== createdBy && staff.role !== 'admin') {
                throw ApiError.Forbidden('Only the creator or admin can toggle this promo code');
            }

            promoCode.isActive = !promoCode.isActive;
            promoCode.updatedAt = new Date();
            await promoCode.save();

            // Логируем активность
            await StaffService.logActivity(
                createdBy,
                'toggle_promocode',
                `Promo code ${code} ${promoCode.isActive ? 'activated' : 'deactivated'}`,
                'promocode',
                'private',
                null,
                true
            );

            return promoCode;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error toggling promo code:', error);
            throw ApiError.Internal('Error toggling promo code');
        }
    }

    // Получение всех промокодов создателя
    async getStaffPromoCodes(createdBy) {
        try {
            const promoCodes = await PromoCodeModel.find({ createdBy })
                .sort({ createdAt: -1 });

            return promoCodes;
        } catch (error) {
            console.error('Error getting staff promo codes:', error);
            throw ApiError.Internal('Error getting staff promo codes');
        }
    }

    // Получение всех промокодов (для админов)
    async getAllPromoCodes(requesterId) {
        try {
            await StaffService.checkStaffAccess(requesterId, 'admin');

            const promoCodes = await PromoCodeModel.find({})
                .sort({ createdAt: -1 });

            return promoCodes;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error getting all promo codes:', error);
            throw ApiError.Internal('Error getting all promo codes');
        }
    }

    // Статистика промокода
    async getPromoCodeStats(code, requesterId) {
        try {
            const promoCode = await PromoCodeModel.findOne({ code: code.toUpperCase() });
            
            if (!promoCode) {
                throw ApiError.NotFound('Promo code not found');
            }

            // Проверяем права доступа
            const staff = await StaffService.checkStaffAccess(requesterId, 'staff');
            if (promoCode.createdBy !== requesterId && staff.role !== 'admin') {
                throw ApiError.Forbidden('Access denied to promo code stats');
            }

            const stats = {
                code: promoCode.code,
                name: promoCode.name,
                type: promoCode.type,
                value: promoCode.value,
                currency: promoCode.currency,
                isActive: promoCode.isActive,
                createdBy: promoCode.createdByName,
                createdAt: promoCode.createdAt,
                validFrom: promoCode.validFrom,
                validUntil: promoCode.validUntil,
                usageLimit: promoCode.usageLimit,
                usageLimitPerUser: promoCode.usageLimitPerUser,
                usedCount: promoCode.usedCount,
                totalUsed: promoCode.totalUsed,
                totalAmount: promoCode.totalAmount,
                remainingUses: promoCode.usageLimit ? promoCode.usageLimit - promoCode.usedCount : 'Unlimited'
            };

            // Логируем просмотр статистики
            await StaffService.logActivity(
                requesterId,
                'view_stats',
                `Viewed stats for promo code: ${code}`,
                'promocode',
                'private',
                null,
                true
            );

            return stats;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error getting promo code stats:', error);
            throw ApiError.Internal('Error getting promo code stats');
        }
    }

    // Удаление промокода (мягкое удаление)
    async deletePromoCode(code, requesterId) {
        try {
            const promoCode = await PromoCodeModel.findOne({ code: code.toUpperCase() });
            
            if (!promoCode) {
                throw ApiError.NotFound('Promo code not found');
            }

            // Проверяем права (только создатель или админ)
            const staff = await StaffService.checkStaffAccess(requesterId, 'staff');
            if (promoCode.createdBy !== requesterId && staff.role !== 'admin') {
                throw ApiError.Forbidden('Only the creator or admin can delete this promo code');
            }

            // Мягкое удаление - деактивируем
            promoCode.isActive = false;
            promoCode.updatedAt = new Date();
            await promoCode.save();

            // Логируем активность
            await StaffService.logActivity(
                requesterId,
                'toggle_promocode',
                `Promo code ${code} deleted (deactivated)`,
                'promocode',
                'private',
                null,
                true
            );

            return { success: true, message: 'Promo code deleted successfully' };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error deleting promo code:', error);
            throw ApiError.Internal('Error deleting promo code');
        }
    }

    // Форматирование статистики для бота
    formatPromoCodeStats(stats) {
        const status = stats.isActive ? '✅ Active' : '❌ Inactive';
        const type = stats.type === 'discount' ? 'Discount' : stats.type === 'bonus' ? 'Bonus' : 'Referral';
        const value = stats.type === 'discount' ? `${stats.value}%` : `${stats.value} ${stats.currency}`;
        
        let message = `🎫 <b>Promo Code: ${stats.code}</b>\n\n`;
        message += `📌 <b>Name:</b> ${stats.name}\n`;
        message += `🏷️ <b>Type:</b> ${type}\n`;
        message += `💰 <b>Value:</b> ${value}\n`;
        message += `${status} <b>Status:</b> ${stats.isActive ? 'Active' : 'Inactive'}\n`;
        message += `👤 <b>Created by:</b> ${stats.createdBy}\n`;
        message += `📅 <b>Created:</b> ${stats.createdAt.toLocaleDateString()}\n\n`;
        
        message += `<b>📊 Usage Statistics:</b>\n`;
        message += `🔢 <b>Used:</b> ${stats.usedCount}`;
        if (stats.usageLimit) {
            message += ` / ${stats.usageLimit}`;
        }
        message += `\n📈 <b>Remaining:</b> ${stats.remainingUses}\n`;
        message += `💰 <b>Total Amount:</b> ${stats.totalAmount} ${stats.currency}\n\n`;
        
        if (stats.validUntil) {
            const isValid = new Date(stats.validUntil) > new Date();
            message += `${isValid ? '⏰' : '⏳'} <b>Valid until:</b> ${new Date(stats.validUntil).toLocaleDateString()}\n`;
        }
        
        return message;
    }
}

module.exports = new PromoCodeService();


