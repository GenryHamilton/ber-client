const ApiError = require('../exceptions/api-error');

// List of admin email addresses
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

module.exports = function(req, res, next) {
    try {
        if (!req.user) {
            return next(ApiError.UnauthorizedError());
        }

        // Check if user is an administrator
        if (!ADMIN_EMAILS.includes(req.user.email)) {
            return next(ApiError.Forbidden());
        }

        next();
    } catch (e) {
        return next(ApiError.UnauthorizedError());
    }
}



