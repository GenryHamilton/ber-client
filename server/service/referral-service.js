const ReferralCodeModel = require('../models/referral-code-model');
const UserModel = require('../models/user-model');
const PaymentTrackingModel = require('../models/payment-tracking-model');
const ApiError = require('../exceptions/api-error');

class ReferralService {
    async createReferralCode(code, name) {
        const existingCode = await ReferralCodeModel.findOne({ code: code.toUpperCase() });
        if (existingCode) {
            throw ApiError.BadRequest(`Referral code ${code} already exists`);
        }

        const referralCode = await ReferralCodeModel.create({
            code: code.toUpperCase(),
            name,
            isActive: true
        });

        return referralCode;
    }

    async getReferralCodes() {
        const codes = await ReferralCodeModel.find().sort({ createdAt: -1 });
        return codes;
    }

    async toggleReferralCode(code, isActive) {
        const referralCode = await ReferralCodeModel.findOne({ code: code.toUpperCase() });
        if (!referralCode) {
            throw ApiError.BadRequest(`Referral code ${code} not found`);
        }

        referralCode.isActive = isActive;
        await referralCode.save();

        return referralCode;
    }

    async validateReferralCode(code) {
        if (!code) return true; // Code is optional
        
        const referralCode = await ReferralCodeModel.findOne({ 
            code: code.toUpperCase(),
            isActive: true 
        });

        if (!referralCode) {
            throw ApiError.BadRequest(`Referral code ${code} is invalid or not active`);
        }

        return true;
    }

    async getReferralStats(code) {
        const referralCode = await ReferralCodeModel.findOne({ code: code.toUpperCase() });
        if (!referralCode) {
            throw ApiError.BadRequest(`Referral code ${code} not found`);
        }

        // Number of registrations
        const registrations = await UserModel.countDocuments({ 
            referralCode: code.toUpperCase() 
        });

        // List of users
        const users = await UserModel.find({ 
            referralCode: code.toUpperCase() 
        }).select('email registrationDate isActivated');

        // Number of payments
        const payments = await PaymentTrackingModel.find({ 
            referralCode: code.toUpperCase() 
        });

        const successfulPayments = payments.filter(p => p.status === 'success');
        const totalAmount = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // First deposit conversion
        const usersWithPayments = new Set(payments.map(p => p.userId.toString()));
        const conversionRate = registrations > 0 
            ? ((usersWithPayments.size / registrations) * 100).toFixed(2) 
            : 0;

        return {
            code: referralCode.code,
            name: referralCode.name,
            isActive: referralCode.isActive,
            stats: {
                totalRegistrations: registrations,
                totalPayments: successfulPayments.length,
                totalAmount,
                conversionRate: `${conversionRate}%`,
                usersWithPayments: usersWithPayments.size
            },
            users: users.map(u => ({
                email: u.email,
                registrationDate: u.registrationDate,
                isActivated: u.isActivated
            }))
        };
    }

    async getAllStats() {
        const codes = await ReferralCodeModel.find();
        const stats = [];

        for (const code of codes) {
            try {
                const codeStat = await this.getReferralStats(code.code);
                stats.push(codeStat);
            } catch (e) {
                console.error(`Error getting statistics for ${code.code}:`, e.message);
            }
        }

        return stats;
    }
}

module.exports = new ReferralService();


