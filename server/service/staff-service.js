const StaffModel = require('../models/staff-model');
const StaffActivityModel = require('../models/staff-activity-model');
const ApiError = require('../exceptions/api-error');

class StaffService {
    // Проверка прав доступа сотрудника
    async checkStaffAccess(telegramId, requiredRole = 'staff', action = null) {
        try {
            const staff = await StaffModel.findOne({ 
                telegramId, 
                isActive: true 
            });

            if (!staff) {
                await this.logActivity(telegramId, 'access_denied', `Access denied for Telegram ID: ${telegramId}`, 'system', 'private');
                throw ApiError.Forbidden('Access denied: Staff not found or inactive');
            }

            // Проверка роли
            if (requiredRole === 'admin' && staff.role !== 'admin') {
                await this.logActivity(telegramId, 'access_denied', `Admin access required for action: ${action}`, 'system', 'private');
                throw ApiError.Forbidden('Access denied: Admin role required');
            }

            // Проверка специфических разрешений
            if (action && staff.permissions) {
                switch (action) {
                    case 'create_promocode':
                        if (!staff.permissions.canCreatePromoCodes) {
                            await this.logActivity(telegramId, 'access_denied', 'Cannot create promo codes', 'promocode', 'private');
                            throw ApiError.Forbidden('Access denied: Cannot create promo codes');
                        }
                        break;
                    case 'view_stats':
                        if (!staff.permissions.canViewStats) {
                            await this.logActivity(telegramId, 'access_denied', 'Cannot view statistics', 'system', 'private');
                            throw ApiError.Forbidden('Access denied: Cannot view statistics');
                        }
                        break;
                    case 'manage_users':
                        if (!staff.permissions.canManageUsers) {
                            await this.logActivity(telegramId, 'access_denied', 'Cannot manage users', 'user', 'private');
                            throw ApiError.Forbidden('Access denied: Cannot manage users');
                        }
                        break;
                }
            }

            // Обновляем время последней активности
            await StaffModel.updateOne(
                { telegramId },
                { lastActiveAt: new Date() }
            );

            return staff;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error checking staff access:', error);
            throw ApiError.Internal('Error checking staff access');
        }
    }

    // Получение информации о сотруднике
    async getStaffInfo(telegramId) {
        try {
            const staff = await StaffModel.findOne({ telegramId });
            return staff;
        } catch (error) {
            console.error('Error getting staff info:', error);
            throw ApiError.Internal('Error getting staff info');
        }
    }

    // Добавление нового сотрудника (только для админов)
    async addStaff(telegramId, username, firstName, lastName, role = 'staff', permissions = {}) {
        try {
            const existingStaff = await StaffModel.findOne({ telegramId });
            if (existingStaff) {
                throw ApiError.BadRequest('Staff member already exists');
            }

            const defaultPermissions = {
                canCreatePromoCodes: true,
                canViewStats: true,
                canManageUsers: false,
                ...permissions
            };

            const staff = await StaffModel.create({
                telegramId,
                username,
                firstName,
                lastName,
                role,
                permissions: defaultPermissions
            });

            await this.logActivity(
                telegramId, 
                'login', 
                `New staff member added: ${firstName} ${lastName} (${role})`, 
                'system', 
                'admin_chat'
            );

            return staff;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error adding staff:', error);
            throw ApiError.Internal('Error adding staff');
        }
    }

    // Обновление разрешений сотрудника
    async updateStaffPermissions(telegramId, permissions) {
        try {
            const staff = await StaffModel.findOneAndUpdate(
                { telegramId },
                { 
                    permissions: { ...staff.permissions, ...permissions },
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!staff) {
                throw ApiError.NotFound('Staff member not found');
            }

            await this.logActivity(
                telegramId, 
                'manage_user', 
                `Permissions updated for staff member`, 
                'user', 
                'admin_chat'
            );

            return staff;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error updating staff permissions:', error);
            throw ApiError.Internal('Error updating staff permissions');
        }
    }

    // Активация/деактивация сотрудника
    async toggleStaffStatus(telegramId, isActive) {
        try {
            const staff = await StaffModel.findOneAndUpdate(
                { telegramId },
                { isActive },
                { new: true }
            );

            if (!staff) {
                throw ApiError.NotFound('Staff member not found');
            }

            await this.logActivity(
                telegramId, 
                'manage_user', 
                `Staff status changed to: ${isActive ? 'active' : 'inactive'}`, 
                'user', 
                'admin_chat'
            );

            return staff;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error toggling staff status:', error);
            throw ApiError.Internal('Error toggling staff status');
        }
    }

    // Получение списка всех сотрудников
    async getAllStaff() {
        try {
            const staff = await StaffModel.find({}).sort({ createdAt: -1 });
            return staff;
        } catch (error) {
            console.error('Error getting all staff:', error);
            throw ApiError.Internal('Error getting staff list');
        }
    }

    // Логирование активности сотрудника
    async logActivity(telegramId, action, details, targetType, chatType, chatId = null, success = true, errorMessage = null) {
        try {
            const staff = await StaffModel.findOne({ telegramId });
            const staffName = staff ? `${staff.firstName || ''} ${staff.lastName || ''}`.trim() : 'Unknown';

            await StaffActivityModel.create({
                staffId: telegramId,
                staffName,
                action,
                details,
                targetType,
                chatType,
                chatId,
                success,
                errorMessage,
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Error logging staff activity:', error);
            // Не выбрасываем ошибку, чтобы не нарушить основной процесс
        }
    }

    // Получение статистики активности сотрудника
    async getStaffActivityStats(telegramId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const activities = await StaffActivityModel.find({
                staffId: telegramId,
                createdAt: { $gte: startDate }
            }).sort({ createdAt: -1 });

            const stats = {
                totalActions: activities.length,
                actionsByType: {},
                successRate: 0,
                recentActivities: activities.slice(0, 10)
            };

            activities.forEach(activity => {
                stats.actionsByType[activity.action] = (stats.actionsByType[activity.action] || 0) + 1;
            });

            const successfulActions = activities.filter(a => a.success).length;
            stats.successRate = activities.length > 0 ? (successfulActions / activities.length * 100).toFixed(1) : 0;

            return stats;
        } catch (error) {
            console.error('Error getting staff activity stats:', error);
            throw ApiError.Internal('Error getting staff activity stats');
        }
    }

    // Получение статистики всех сотрудников
    async getAllStaffStats(days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const activities = await StaffActivityModel.find({
                createdAt: { $gte: startDate }
            }).sort({ createdAt: -1 });

            const staffStats = new Map();

            activities.forEach(activity => {
                if (!staffStats.has(activity.staffId)) {
                    staffStats.set(activity.staffId, {
                        staffId: activity.staffId,
                        staffName: activity.staffName,
                        totalActions: 0,
                        actionsByType: {},
                        successCount: 0,
                        lastActivity: activity.createdAt
                    });
                }

                const stats = staffStats.get(activity.staffId);
                stats.totalActions++;
                stats.actionsByType[activity.action] = (stats.actionsByType[activity.action] || 0) + 1;
                
                if (activity.success) {
                    stats.successCount++;
                }
            });

            return Array.from(staffStats.values());
        } catch (error) {
            console.error('Error getting all staff stats:', error);
            throw ApiError.Internal('Error getting all staff stats');
        }
    }
}

module.exports = new StaffService();


