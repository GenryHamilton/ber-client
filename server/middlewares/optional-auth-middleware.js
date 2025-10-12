const tokenService = require('../service/token-service.js');

// Middleware который пытается авторизовать пользователя, но не выбрасывает ошибку если токена нет
module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        
        if (!authorizationHeader) {
            console.log('🔓 OptionalAuth: токен отсутствует');
            req.user = null;
            return next();
        }
        
        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            console.log('🔓 OptionalAuth: accessToken пустой');
            req.user = null;
            return next();
        }

        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            console.log('🔓 OptionalAuth: токен невалидный');
            req.user = null;
            return next();
        }

        console.log('🔐 OptionalAuth: пользователь авторизован -', userData.email, 'userId:', userData.id);
        req.user = userData;
        next();
    } catch (e) {
        console.log('🔓 OptionalAuth error:', e.message);
        req.user = null;
        next();
    }
}

