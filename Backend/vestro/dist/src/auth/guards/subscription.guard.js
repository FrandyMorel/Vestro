"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SubscriptionGuard = class SubscriptionGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user.role === "SUPER_ADMIN") {
            return true;
        }
        if (!user.compId) {
            throw new common_1.ForbiddenException("Company ID no encontrado en JWT");
        }
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                comp_id: user.compId,
            },
            include: {
                plan: true,
            },
        });
        if (!subscription) {
            throw new common_1.ForbiddenException("Suscripción no encontrada");
        }
        if (subscription.subs_status === "cancelled") {
            throw new common_1.ForbiddenException("La suscripción ha sido cancelada. Contacta al administrador.");
        }
        if (subscription.subs_status === "expired") {
            if (user.role !== "ADMIN") {
                throw new common_1.ForbiddenException("La suscripción ha expirado. Solo el administrador puede acceder para renovar.");
            }
            return true;
        }
        if (subscription.subs_status === "active" ||
            subscription.subs_status === "trial") {
            return true;
        }
        throw new common_1.ForbiddenException("Estado de suscripción desconocido");
    }
};
exports.SubscriptionGuard = SubscriptionGuard;
exports.SubscriptionGuard = SubscriptionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionGuard);
//# sourceMappingURL=subscription.guard.js.map