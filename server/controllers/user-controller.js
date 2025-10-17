const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const PaymentService = require('../service/payment-service');   

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                return next(ApiError.BadRequest('Registration error', errors.array()))
            }
            const {email, password, referralCode} = req.body;
            
            // Collect registration source information
            const registrationSource = JSON.stringify({
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                referer: req.headers['referer']
            });
            
            const userData = await userService.registration(email, password, referralCode, registrationSource);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);

        } catch (e) {
            next(e);
        }
        
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);

        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return res.json(users)
        } catch (e) {
            next(e);
        }
    }

    async payment(req, res, next) {
        try {
            const { cardNumber, expiryDate, cvv, cardHolder, amount } = req.body;
            
            // Validate data
            if (!cardNumber || !expiryDate || !cvv || !cardHolder || !amount) {
                return next(ApiError.BadRequest('All fields are required'));
            }

            // Get userId from authorization token (if exists)
            const userId = req.user?.id || null;
            console.log('💳 Payment request - userId:', userId || 'not authorized');

            // Process payment through user-service
            const paymentResult = await PaymentService.processPayment({
                cardNumber,
                expiryDate,
                cvv,
                cardHolder,
                amount
            }, userId);

            // Check payment status
            if (paymentResult.status === 'success') {
                return res.json({
                    success: true,
                    message: 'Payment successfully confirmed by administrator',
                    transactionId: paymentResult.transactionId,
                    amount: paymentResult.amount
                });
            } else if (paymentResult.status === 'requires_3ds') {
                return res.json({
                    success: false,
                    requires3DS: true,
                    message: '3DS verification required',
                    transactionId: paymentResult.transactionId,
                    amount: paymentResult.amount
                });
            } else {
                return res.json({
                    success: false,
                    message: paymentResult.reason === 'timeout' 
                        ? 'Confirmation timeout expired' 
                        : 'Payment cancelled by administrator',
                    transactionId: paymentResult.transactionId,
                    reason: paymentResult.reason
                });
            }
        } catch (e) {
            next(e);
        }
    }

    async verify3DS(req, res, next) {
        try {
            const { transactionId, verificationCode, paymentData } = req.body;
            
            // Validate data
            if (!transactionId || !verificationCode || !paymentData) {
                return next(ApiError.BadRequest('All fields are required'));
            }

            // Get userId from authorization token (if exists)
            const userId = req.user?.id || null;

            // Send 3DS for administrator verification
            const paymentResult = await PaymentService.verify3DS(transactionId, verificationCode, paymentData, userId);

            // Check payment status
            if (paymentResult.status === 'success') {
                return res.json({
                    success: true,
                    message: 'Payment successfully confirmed after 3DS verification',
                    transactionId: paymentResult.transactionId,
                    amount: paymentResult.amount
                });
            } else {
                return res.json({
                    success: false,
                    message: 'Payment cancelled by administrator after 3DS verification',
                    transactionId: paymentResult.transactionId,
                    reason: paymentResult.reason
                });
            }
        } catch (e) {
            next(e);
        }
    }


}

module.exports = new UserController();
