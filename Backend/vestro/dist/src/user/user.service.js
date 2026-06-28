"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto, compId, userRole) {
        if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
            throw new common_1.UnauthorizedException("Solo administradores pueden crear usuarios");
        }
        const existingUser = await this.prisma.user.findFirst({
            where: {
                user_email: createUserDto.user_email,
            },
        });
        if (existingUser) {
            throw new common_1.BadRequestException("El email ya está registrado en el sistema");
        }
        const subscription = await this.prisma.subscription.findFirst({
            where: { comp_id: compId },
            include: { plan: true },
        });
        if (!subscription) {
            throw new common_1.NotFoundException("Suscripción no encontrada");
        }
        if (!subscription.plan) {
            throw new common_1.NotFoundException("Plan no encontrado");
        }
        const userCount = await this.prisma.user.count({
            where: {
                comp_id: compId,
                status: "active",
            },
        });
        if (userCount >= subscription.plan.max_users) {
            throw new common_1.BadRequestException(`Tu plan '${subscription.plan.plan_name}' permite máximo ${subscription.plan.max_users} usuario(s). ` +
                `Ya tienes ${userCount}. Upgrade tu suscripción para agregar más usuarios.`);
        }
        const hashedPassword = await bcrypt.hash(createUserDto.user_password, 10);
        const user = await this.prisma.user.create({
            data: {
                user_name: createUserDto.user_name,
                user_email: createUserDto.user_email,
                user_password: hashedPassword,
                user_role: "EMPLOYEE",
                status: "active",
                comp_id: compId,
            },
        });
        return this.sanitizeUser(user);
    }
    async findAll(compId) {
        return this.prisma.user.findMany({
            where: { comp_id: compId },
            select: {
                user_id: true,
                user_name: true,
                user_email: true,
                user_role: true,
                status: true,
                created_at: true,
                updated_at: true,
            },
        });
    }
    async findOne(userId, compId) {
        const user = await this.prisma.user.findFirst({
            where: {
                user_id: userId,
                comp_id: compId,
            },
            select: {
                user_id: true,
                user_name: true,
                user_email: true,
                user_role: true,
                status: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException("Usuario no encontrado");
        }
        return user;
    }
    async update(userId, updateUserDto, compId, userRole) {
        if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
            throw new common_1.UnauthorizedException("Solo administradores pueden editar usuarios");
        }
        const existingUser = await this.prisma.user.findFirst({
            where: {
                user_id: userId,
                comp_id: compId,
            },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException("Usuario no encontrado");
        }
        if (updateUserDto.user_email &&
            updateUserDto.user_email !== existingUser.user_email) {
            throw new common_1.BadRequestException("No puedes cambiar el email de un usuario. Contacta a soporte.");
        }
        const dataToUpdate = {};
        if (updateUserDto.user_name) {
            dataToUpdate.user_name = updateUserDto.user_name;
        }
        if (updateUserDto.user_password) {
            dataToUpdate.user_password = await bcrypt.hash(updateUserDto.user_password, 10);
        }
        if (updateUserDto.status) {
            dataToUpdate.status = updateUserDto.status;
        }
        const updatedUser = await this.prisma.user.update({
            where: { user_id: userId },
            data: dataToUpdate,
        });
        return this.sanitizeUser(updatedUser);
    }
    async remove(userId, deleteUserDto, compId, userRole) {
        if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
            throw new common_1.UnauthorizedException("Solo administradores pueden eliminar usuarios");
        }
        const user = await this.prisma.user.findFirst({
            where: {
                user_id: userId,
                comp_id: compId,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException("Usuario no encontrado");
        }
        if (user.user_role === "ADMIN") {
            throw new common_1.BadRequestException("No puedes eliminar la cuenta del administrador. Contacta a soporte.");
        }
        await this.prisma.user.update({
            where: { user_id: userId },
            data: {
                status: "deleted",
                user_email: `${user.user_email}.deleted.${Date.now()}`,
            },
        });
        console.log(`[AUDITORÍA] Usuario ${userId} eliminado. Razón: ${deleteUserDto.reason}`);
        return {
            message: `Usuario '${user.user_name}' eliminado correctamente`,
            reason: deleteUserDto.reason,
            userId: userId,
            freed_slot: true,
        };
    }
    async getUserStats(compId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { comp_id: compId },
            include: { plan: true },
        });
        if (!subscription) {
            throw new common_1.NotFoundException("Suscripción no encontrada");
        }
        if (!subscription.plan) {
            throw new common_1.NotFoundException("Plan no encontrado");
        }
        const adminCount = await this.prisma.user.count({
            where: { comp_id: compId, user_role: "ADMIN", status: "active" },
        });
        const employeeCount = await this.prisma.user.count({
            where: { comp_id: compId, user_role: "EMPLOYEE", status: "active" },
        });
        const totalUsers = adminCount + employeeCount;
        const availableSlots = Math.max(0, subscription.plan.max_users - totalUsers);
        return {
            plan_name: subscription.plan.plan_name,
            max_users: subscription.plan.max_users,
            current_users: totalUsers,
            available_slots: availableSlots,
            can_create_more: availableSlots > 0,
            users_by_role: {
                admin: adminCount,
                employee: employeeCount,
            },
        };
    }
    async getAvailableEmployeeSlots(compId) {
        const stats = await this.getUserStats(compId);
        return {
            available_slots: stats.available_slots,
            can_create_more: stats.can_create_more,
            plan_name: stats.plan_name,
        };
    }
    sanitizeUser(user) {
        const { user_password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map