# Настройка переменных окружения

## Обязательные переменные

```env
# Основные настройки
PORT=5000
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5000

# База данных
DB_URL=mongodb://localhost:27017/your-database-name

# JWT токены
JWT_ACCESS_SECRET=your-jwt-access-secret-key-here
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-here

# Telegram бот для платежей
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

## Опциональные переменные

### Mailgun (Email рассылка)
Если эти переменные не указаны, email рассылка будет отключена, но приложение продолжит работать.

```env
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.com
MAILGUN_FROM_EMAIL=noreply@your-domain.com
```

### Логирование в Telegram чат
Если эта переменная не указана, логирование регистраций и пополнений в чат будет отключено.

```env
# Один чат
LOG_CHAT_ID=your-telegram-chat-id

# Или несколько чатов через запятую
LOG_CHAT_ID=-1001234567890,-1009876543210,123456789
```

**Что логируется:**
- 🎉 Новые регистрации (email, реферальный код, время, IP, User-Agent)
- 💰 Пополнения баланса (email, сумма, ID транзакции, реферальный код, время)

**Несколько чатов:**
- Можно указать несколько ID через запятую
- Логи будут отправляться во все указанные чаты одновременно
- Если отправка в один чат не удалась, остальные чаты все равно получат сообщение

**Как получить LOG_CHAT_ID:**
1. Создайте канал или группу в Telegram
2. Добавьте туда своего бота (с токеном TELEGRAM_BOT_TOKEN)
3. Отправьте сообщение в канал/группу
4. Используйте API Telegram для получения chat_id: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`

## Пример полного .env файла

```env
PORT=5000
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5000

DB_URL=mongodb://localhost:27017/casino-db

JWT_ACCESS_SECRET=my-super-secret-access-key-change-this
JWT_REFRESH_SECRET=my-super-secret-refresh-key-change-this

MAILGUN_API_KEY=key-1234567890abcdef
MAILGUN_DOMAIN=mg.example.com
MAILGUN_FROM_EMAIL=noreply@example.com

TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Один чат для логов
LOG_CHAT_ID=-1001234567890

# Или несколько чатов для логов (через запятую)
# LOG_CHAT_ID=-1001234567890,-1009876543210,123456789
```

