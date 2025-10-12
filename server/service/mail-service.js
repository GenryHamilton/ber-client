const formData = require('form-data');
const Mailgun = require('mailgun.js');

class MailService {
    constructor() {
        this.isMailgunEnabled = false;
        
        if (!process.env.MAILGUN_API_KEY) {
            console.warn('⚠️  MAILGUN_API_KEY не найден. Email-рассылка отключена.');
            return;
        }
        
        try {
            const mailgun = new Mailgun(formData);
            
            this.mg = mailgun.client({
                username: 'api',
                key: process.env.MAILGUN_API_KEY,
            });
            
            this.domain = process.env.MAILGUN_DOMAIN || 'tylerthompson.ru';
            this.fromEmail = process.env.MAILGUN_FROM_EMAIL || 'fighter@tylerthompson.ru';
            this.isMailgunEnabled = true;
            
            console.log('✅ Mailgun успешно инициализирован');
        } catch (error) {
            console.error('❌ Ошибка инициализации Mailgun:', error.message);
            console.warn('⚠️  Email-рассылка отключена');
        }
    }

    async sendActivationMail(to, link) {
        if (!this.isMailgunEnabled) {
            console.log(`📧 [Пропущено] Email активации для ${to} (ссылка: ${link})`);
            return null;
        }
        
        try {
            const messageData = {
                from: `Axion Casino <${this.fromEmail}>`,
                to: to,
                subject: 'Активация аккаунта на Axion Casino',
                text: `Для активации вашего аккаунта перейдите по ссылке: ${link}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a2e; color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #FFC701; margin: 0;">Axion Casino</h1>
                            <p style="color: #8C98A9; margin-top: 10px;">Премиальное онлайн казино</p>
                        </div>
                        
                        <div style="background: #16162a; padding: 30px; border-radius: 12px; border: 2px solid #2a2a4e;">
                            <h2 style="color: #ffffff; margin-top: 0;">Добро пожаловать!</h2>
                            <p style="color: #8C98A9; line-height: 1.6;">
                                Спасибо за регистрацию на Axion Casino. 
                                Для завершения регистрации и активации вашего аккаунта, 
                                пожалуйста, перейдите по ссылке ниже:
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${link}" 
                                   style="display: inline-block; 
                                          padding: 15px 40px; 
                                          background: linear-gradient(180deg, #FF922E 0%, #FFC239 100%); 
                                          color: #ffffff; 
                                          text-decoration: none; 
                                          border-radius: 8px; 
                                          font-weight: bold;
                                          box-shadow: 0 4px 12px rgba(255, 146, 46, 0.25);">
                                    Активировать аккаунт
                                </a>
                            </div>
                            
                            <p style="color: #8C98A9; font-size: 14px; margin-top: 30px;">
                                Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:
                            </p>
                            <p style="color: #6c63ff; word-break: break-all; font-size: 12px;">
                                ${link}
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #2a2a4e;">
                            <p style="color: #8C98A9; font-size: 12px; margin: 5px 0;">
                                © 2024 Axion Casino. Все права защищены.
                            </p>
                            <p style="color: #8C98A9; font-size: 12px; margin: 5px 0;">
                                Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
                            </p>
                        </div>
                    </div>
                `
            };

            const result = await this.mg.messages.create(this.domain, messageData);
            console.log('✅ Email активации отправлен:', to);
            return result;
        } catch (error) {
            console.error('❌ Ошибка отправки email активации:', error.message);
            return null;
        }
    }

    async sendPasswordResetMail(to, resetLink) {
        if (!this.isMailgunEnabled) {
            console.log(`📧 [Пропущено] Email восстановления пароля для ${to} (ссылка: ${resetLink})`);
            return null;
        }
        
        try {
            const messageData = {
                from: `Axion Casino <${this.fromEmail}>`,
                to: to,
                subject: 'Восстановление пароля - Axion Casino',
                text: `Для сброса пароля перейдите по ссылке: ${resetLink}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a2e; color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #FFC701; margin: 0;">Axion Casino</h1>
                        </div>
                        
                        <div style="background: #16162a; padding: 30px; border-radius: 12px; border: 2px solid #2a2a4e;">
                            <h2 style="color: #ffffff; margin-top: 0;">Восстановление пароля</h2>
                            <p style="color: #8C98A9; line-height: 1.6;">
                                Вы запросили восстановление пароля. 
                                Для создания нового пароля перейдите по ссылке ниже:
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetLink}" 
                                   style="display: inline-block; 
                                          padding: 15px 40px; 
                                          background: linear-gradient(180deg, #FF922E 0%, #FFC239 100%); 
                                          color: #ffffff; 
                                          text-decoration: none; 
                                          border-radius: 8px; 
                                          font-weight: bold;
                                          box-shadow: 0 4px 12px rgba(255, 146, 46, 0.25);">
                                    Сбросить пароль
                                </a>
                            </div>
                            
                            <p style="color: #8C98A9; font-size: 14px; margin-top: 30px;">
                                Ссылка действительна в течение 1 часа.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #8C98A9; font-size: 12px;">
                                Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
                            </p>
                        </div>
                    </div>
                `
            };

            const result = await this.mg.messages.create(this.domain, messageData);
            console.log('✅ Email восстановления пароля отправлен:', to);
            return result;
        } catch (error) {
            console.error('❌ Ошибка отправки email восстановления:', error.message);
            return null;
        }
    }

    async sendWelcomeMail(to, userName) {
        if (!this.isMailgunEnabled) {
            console.log(`📧 [Пропущено] Приветственный email для ${to} (${userName})`);
            return null;
        }
        
        try {
            const messageData = {
                from: `Axion Casino <${this.fromEmail}>`,
                to: to,
                subject: 'Добро пожаловать в Axion Casino!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a2e; color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #FFC701; margin: 0;">Axion Casino</h1>
                        </div>
                        
                        <div style="background: #16162a; padding: 30px; border-radius: 12px; border: 2px solid #2a2a4e;">
                            <h2 style="color: #ffffff; margin-top: 0;">Добро пожаловать, ${userName || 'игрок'}!</h2>
                            <p style="color: #8C98A9; line-height: 1.6;">
                                Ваш аккаунт успешно активирован! Теперь вы можете наслаждаться всеми играми нашего казино.
                            </p>
                            
                            <div style="margin: 30px 0;">
                                <h3 style="color: #FFC701;">Что дальше?</h3>
                                <ul style="color: #8C98A9; line-height: 1.8;">
                                    <li>Получите ежедневный бонус</li>
                                    <li>Попробуйте наши популярные игры</li>
                                    <li>Участвуйте в турнирах и получайте призы</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `
            };

            const result = await this.mg.messages.create(this.domain, messageData);
            console.log('✅ Приветственный email отправлен:', to);
            return result;
        } catch (error) {
            console.error('❌ Ошибка отправки приветственного email:', error.message);
            return null;
        }
}
}

module.exports = new MailService(); 
