const referralService = require('../service/referral-service');
const ApiError = require('../exceptions/api-error');

class ReferralController {
    async createCode(req, res, next) {
        try {
            const { code, name } = req.body;
            
            if (!code || !name) {
                return next(ApiError.BadRequest('Код и название обязательны'));
            }

            const referralCode = await referralService.createReferralCode(code, name);
            return res.json({
                success: true,
                message: 'Реферальный код создан',
                code: referralCode
            });
        } catch (e) {
            next(e);
        }
    }

    async getList(req, res, next) {
        try {
            const codes = await referralService.getReferralCodes();
            return res.json({
                success: true,
                codes
            });
        } catch (e) {
            next(e);
        }
    }

    async toggleCode(req, res, next) {
        try {
            const { code, isActive } = req.body;
            
            if (!code || isActive === undefined) {
                return next(ApiError.BadRequest('Код и статус обязательны'));
            }

            const referralCode = await referralService.toggleReferralCode(code, isActive);
            return res.json({
                success: true,
                message: `Код ${isActive ? 'активирован' : 'деактивирован'}`,
                code: referralCode
            });
        } catch (e) {
            next(e);
        }
    }

    async getStats(req, res, next) {
        try {
            const { code } = req.params;
            
            if (!code) {
                // Если код не указан, возвращаем статистику по всем кодам
                const stats = await referralService.getAllStats();
                return res.json({
                    success: true,
                    stats
                });
            }

            const stats = await referralService.getReferralStats(code);
            return res.json({
                success: true,
                stats
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new ReferralController();



