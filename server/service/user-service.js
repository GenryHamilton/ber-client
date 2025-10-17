const UserModel = require('../models/user-model');

const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const referralService = require('./referral-service');
const logChatService = require('./log-chat-service');
const ApiError = require('../exceptions/api-error');
const UserDto = require('../dtos/user-dto');


class UserService {
    async registration(email, password, referralCode = null, registrationSource = null) {
        const candidate = await UserModel.findOne({email});
        if (candidate) {
            throw ApiError.BadRequest(`User with email ${email} already exists`);
        }

        // Validate referral code if provided
        if (referralCode) {
            await referralService.validateReferralCode(referralCode);
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await UserModel.create({
            email, 
            password: hashPassword, 
            activationLink,
            referralCode: referralCode ? referralCode.toUpperCase() : null,
            registrationSource,
            registrationDate: new Date()
        });
        
        // Send email without waiting to avoid timeout
        try {
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
        } catch (emailError) {
            console.warn('Error sending activation email:', emailError.message);
            // Continue even if email fails to send
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        // Log registration to chat
        try {
            await logChatService.logRegistration(email, referralCode, registrationSource);
        } catch (logError) {
            console.warn('Error logging registration to chat:', logError.message);
        }

        return {...tokens, user: userDto}

    }
    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink});
        if (!user) {
            throw new Error('User not found');
        }
        user.isActivated = true;
        await user.save();
        
        // Send welcome email after activation
        try {
            await mailService.sendWelcomeMail(user.email, user.email.split('@')[0]);
        } catch (emailError) {
            console.warn('Error sending welcome email:', emailError.message);
        }
    }
    async login(email, password) {
        const user = await UserModel.findOne({email});
        if (!user) {
            throw ApiError.BadRequest('User with this email not found');
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            throw ApiError.BadRequest('Incorrect password');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }
    
    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
      if(!refreshToken) {
        throw ApiError.UnauthorizedError();
      }
      const userData = tokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = await tokenService.findToken(refreshToken);
      if(!userData || !tokenFromDb) {
        throw ApiError.UnauthorizedError();
      }
      const user = await UserModel.findById(userData.id);
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({...userDto});
      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return {...tokens, user: userDto}
  }
  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }

//   async processPayment(paymentData) {
//     // Здесь будет интеграция с платежным провайдером
//     // Сейчас делаем симуляцию обработки платежа
    
//     const { cardNumber, expiryDate, cvv, cardHolder, amount } = paymentData;

//     // Маскируем номер карты (показываем только последние 4 цифры)
//     const maskedCardNumber = cardNumber.replace(/\s/g, '').slice(-4);
    
//     // Генерируем ID транзакции
//     const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
//     // Логируем для отладки (не храним полные данные карты!)
//     console.log('Payment processed:', {
//       transactionId,
//       amount,
//       cardLastDigits: maskedCardNumber,
//       cardHolder,
//       timestamp: new Date().toISOString()
//     });

//     // Симуляция задержки обработки
//     await new Promise(resolve => setTimeout(resolve, 1000));

//     // В реальном приложении здесь будет запрос к платежному API
//     // Например: Stripe, PayPal, или другой платежный шлюз

//     return {
//       transactionId,
//       amount,
//       status: 'success',
//       timestamp: new Date().toISOString()
//     };
//   }
}

module.exports = new UserService();
