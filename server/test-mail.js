require('dotenv').config();
const mailService = require('./service/mail-service');

async function testMail() {
    console.log('🚀 Тестирование Mailgun...\n');
    
    const testEmail = 'your-test-email@example.com'; // Замените на ваш email
    
    console.log('📧 Отправка письма активации...');
    try {
        const activationResult = await mailService.sendActivationMail(
            testEmail,
            'http://localhost:3001/api/activate/test-link-12345'
        );
        console.log('✅ Письмо активации отправлено!');
        console.log('   Message ID:', activationResult.id);
    } catch (error) {
        console.error('❌ Ошибка отправки письма активации:', error.message);
    }
    
    console.log('\n📧 Отправка приветственного письма...');
    try {
        const welcomeResult = await mailService.sendWelcomeMail(
            testEmail,
            'Тестовый пользователь'
        );
        console.log('✅ Приветственное письмо отправлено!');
        console.log('   Message ID:', welcomeResult.id);
    } catch (error) {
        console.error('❌ Ошибка отправки приветственного письма:', error.message);
    }
    
    console.log('\n📧 Отправка письма восстановления пароля...');
    try {
        const resetResult = await mailService.sendPasswordResetMail(
            testEmail,
            'http://localhost:5173/reset-password/test-token-67890'
        );
        console.log('✅ Письмо восстановления отправлено!');
        console.log('   Message ID:', resetResult.id);
    } catch (error) {
        console.error('❌ Ошибка отправки письма восстановления:', error.message);
    }
    
    console.log('\n✨ Тестирование завершено!');
    console.log('📬 Проверьте почтовый ящик:', testEmail);
    console.log('📊 Mailgun Dashboard: https://app.mailgun.com/');
}

testMail().catch(console.error);

