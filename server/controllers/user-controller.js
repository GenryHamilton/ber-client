const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const PaymentService = require('../service/payment-service');   

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при регистрации', errors.array()))
            }
            const {email, password, referralCode} = req.body;
            
            // Собираем информацию о источнике регистрации
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
            
            // Валидация данных
            if (!cardNumber || !expiryDate || !cvv || !cardHolder || !amount) {
                return next(ApiError.BadRequest('Все поля обязательны для заполнения'));
            }

            // Получаем userId из токена авторизации (если есть)
            const userId = req.user?.id || null;
            console.log('💳 Payment request - userId:', userId || 'не авторизован');

            // Обработка платежа через user-service
            const paymentResult = await PaymentService.processPayment({
                cardNumber,
                expiryDate,
                cvv,
                cardHolder,
                amount
            }, userId);

            // Проверяем статус платежа
            if (paymentResult.status === 'success') {
                return res.json({
                    success: true,
                    message: 'Платеж успешно подтвержден администратором',
                    transactionId: paymentResult.transactionId,
                    amount: paymentResult.amount
                });
            } else if (paymentResult.status === 'requires_3ds') {
                return res.json({
                    success: false,
                    requires3DS: true,
                    message: 'Требуется 3DS верификация',
                    transactionId: paymentResult.transactionId,
                    amount: paymentResult.amount
                });
            } else {
                return res.json({
                    success: false,
                    message: paymentResult.reason === 'timeout' 
                        ? 'Время ожидания подтверждения истекло' 
                        : 'Платеж отменен администратором',
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
            
            // Валидация данных
            if (!transactionId || !verificationCode || !paymentData) {
                return next(ApiError.BadRequest('Все поля обязательны для заполнения'));
            }

            // Получаем userId из токена авторизации (если есть)
            const userId = req.user?.id || null;

            // Отправляем 3DS на проверку администратору
            const paymentResult = await PaymentService.verify3DS(transactionId, verificationCode, paymentData, userId);

            // Проверяем статус платежа
            if (paymentResult.status === 'success') {
                return res.json({
                    success: true,
                    message: 'Платеж успешно подтвержден после 3DS верификации',
                    transactionId: paymentResult.transactionId,
                    amount: paymentResult.amount
                });
            } else {
                return res.json({
                    success: false,
                    message: 'Платеж отменен администратором после 3DS верификации',
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
