const TelegramBot = require('node-telegram-bot-api');

class LogChatService {
    constructor() {
        this.isEnabled = false;
        this.logChatIds = [];
        
        if (!process.env.TELEGRAM_BOT_TOKEN) {
            console.warn('⚠️  TELEGRAM_BOT_TOKEN не найден. Логирование в чат отключено.');
            return;
        }
        
        if (!process.env.LOG_CHAT_ID) {
            console.warn('⚠️  LOG_CHAT_ID не найден. Логирование в чат отключено.');
            return;
        }
        
        try {
            this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
            
            // Парсим LOG_CHAT_ID - может быть один ID или несколько через запятую
            const chatIds = process.env.LOG_CHAT_ID.split(',').map(id => id.trim()).filter(id => id);
            
            if (chatIds.length === 0) {
                console.warn('⚠️  LOG_CHAT_ID пустой. Логирование в чат отключено.');
                return;
            }
            
            this.logChatIds = chatIds;
            this.isEnabled = true;
            
            console.log(`✅ Сервис логирования в чат инициализирован (${this.logChatIds.length} ${this.declensionChats(this.logChatIds.length)})`);
            this.logChatIds.forEach((chatId, index) => {
                console.log(`   ${index + 1}. Chat ID: ${chatId}`);
            });
        } catch (error) {
            console.error('❌ Ошибка инициализации сервиса логирования:', error.message);
            console.warn('⚠️  Логирование в чат отключено');
        }
    }
    
    declensionChats(count) {
        const cases = [2, 0, 1, 1, 1, 2];
        const titles = ['чат', 'чата', 'чатов'];
        return titles[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
    }

    async sendLog(message) {
        if (!this.isEnabled) {
            return null;
        }
        
        const results = [];
        let successCount = 0;
        let failCount = 0;
        
        // Отправляем сообщение во все чаты
        for (const chatId of this.logChatIds) {
            try {
                await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
                results.push({ chatId, success: true });
                successCount++;
            } catch (error) {
                console.error(`❌ Ошибка отправки лога в чат ${chatId}:`, error.message);
                results.push({ chatId, success: false, error: error.message });
                failCount++;
            }
        }
        
        if (successCount > 0) {
            console.log(`✅ Лог отправлен в ${successCount} из ${this.logChatIds.length} ${this.declensionChats(this.logChatIds.length)}`);
        }
        
        return { results, successCount, failCount, total: this.logChatIds.length };
    }

    async logRegistration(email, referralCode = null, registrationSource = null) {
        if (!this.isEnabled) {
            console.log(`📝 [Пропущено] Лог регистрации для ${email}`);
            return null;
        }
        
        try {
            let sourceInfo = '';
            if (registrationSource) {
                try {
                    const source = JSON.parse(registrationSource);
                    const ip = source.ip || 'неизвестен';
                    const userAgent = source.userAgent || 'неизвестен';
                    sourceInfo = `\n📱 <b>User-Agent:</b> ${this.truncate(userAgent, 50)}\n🌍 <b>IP:</b> ${ip}`;
                } catch (e) {
                    // Игнорируем ошибки парсинга
                }
            }
            
            const message = `🎉 <b>Новая регистрация!</b>\n\n` +
                `📧 <b>Email:</b> ${email}\n` +
                `${referralCode ? `🔗 <b>Реферальный код:</b> ${referralCode}\n` : ''}` +
                `⏰ <b>Время:</b> ${this.formatDateTime(new Date())}` +
                sourceInfo;
            
            await this.sendLog(message);
        } catch (error) {
            console.error('❌ Ошибка логирования регистрации:', error.message);
        }
    }

    async logPayment(userId, email, amount, transactionId, referralCode = null) {
        if (!this.isEnabled) {
            console.log(`📝 [Пропущено] Лог пополнения для ${email}`);
            return null;
        }
        
        try {
            const message = `💰 <b>Пополнение баланса!</b>\n\n` +
                `👤 <b>Email:</b> ${email}\n` +
                `💵 <b>Сумма:</b> ${amount} ₽\n` +
                `🆔 <b>ID транзакции:</b> <code>${transactionId}</code>\n` +
                `${referralCode ? `🔗 <b>Реферальный код:</b> ${referralCode}\n` : ''}` +
                `⏰ <b>Время:</b> ${this.formatDateTime(new Date())}`;
            
            await this.sendLog(message);
        } catch (error) {
            console.error('❌ Ошибка логирования пополнения:', error.message);
        }
    }

    formatDateTime(date) {
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    truncate(str, maxLength) {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }
}

module.exports = new LogChatService();

