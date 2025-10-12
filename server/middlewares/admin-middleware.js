const ApiError = require('../exceptions/api-error');

// Список email адресов администраторов
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

module.exports = function(req, res, next) {
    try {
        if (!req.user) {
            return next(ApiError.UnauthorizedError());
        }

        // Проверяем является ли пользователь администратором
        if (!ADMIN_EMAILS.includes(req.user.email)) {
            return next(ApiError.Forbidden());
        }

        next();
    } catch (e) {
        return next(ApiError.UnauthorizedError());
    }
}



