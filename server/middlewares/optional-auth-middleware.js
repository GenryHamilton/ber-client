const tokenService = require('../service/token-service.js');

// Middleware that attempts to authorize user, but doesn't throw error if token is missing
module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        
        if (!authorizationHeader) {
            console.log('🔓 OptionalAuth: token is missing');
            req.user = null;
            return next();
        }
        
        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            console.log('🔓 OptionalAuth: accessToken is empty');
            req.user = null;
            return next();
        }

        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            console.log('🔓 OptionalAuth: token is invalid');
            req.user = null;
            return next();
        }

        console.log('🔐 OptionalAuth: user authorized -', userData.email, 'userId:', userData.id);
        req.user = userData;
        next();
    } catch (e) {
        console.log('🔓 OptionalAuth error:', e.message);
        req.user = null;
        next();
    }
}

