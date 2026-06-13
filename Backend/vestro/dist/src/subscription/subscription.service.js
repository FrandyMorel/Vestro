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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubscriptionService = class SubscriptionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMySubscription(compId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { comp_id: compId },
        });
        if (!subscription) {
            throw new common_1.NotFoundException("Suscripción no encontrada");
        }
        return subscription;
    }
    async findOne(subsId, userCompId, userRole) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { subs_id: subsId },
        });
        if (!subscription) {
            throw new common_1.NotFoundException("Suscripción no encontrada");
        }
        if (userRole !== "SUPER_ADMIN" && subscription.comp_id !== userCompId) {
            throw new common_1.UnauthorizedException("No tienes permiso para ver esta suscripción");
        }
        return subscription;
    }
    async findByCompany(compId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { comp_id: compId },
        });
        if (!subscription) {
            throw new common_1.NotFoundException("Suscripción no encontrada");
        }
        return subscription;
    }
    async update(subsId, updateSubscriptionDto, userCompId, userRole) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { subs_id: subsId },
        });
        if (!subscription) {
            throw new common_1.NotFoundException("Suscripción no encontrada");
        }
        if (userRole !== "SUPER_ADMIN" && subscription.comp_id !== userCompId) {
            throw new common_1.UnauthorizedException("No tienes permiso para editar esta suscripción");
        }
        if (updateSubscriptionDto.plan_id) {
            const planExists = await this.prisma.plan.findUnique({
                where: { plan_id: updateSubscriptionDto.plan_id },
            });
            if (!planExists) {
                throw new common_1.BadRequestException("El plan no existe");
            }
        }
        const updatedSubscription = await this.prisma.subscription.update({
            where: { subs_id: subsId },
            data: updateSubscriptionDto,
        });
        return updatedSubscription;
    }
    async findAll(userRole) {
        if (userRole !== "SUPER_ADMIN") {
            throw new common_1.UnauthorizedException("Solo super administradores pueden listar todas las suscripciones");
        }
        const subscriptions = await this.prisma.subscription.findMany();
        return subscriptions;
    }
    async activateSubscription(subsId, cardnetCustomerId, cardnetSubscriptionId) {
        const subscription = await this.prisma.subscription.update({
            where: { subs_id: subsId },
            data: {
                subs_status: "active",
                cardnet_customer_id: cardnetCustomerId,
                cardnet_subscription_id: cardnetSubscriptionId,
                start_date: new Date(),
            },
        });
        return subscription;
    }
    async cancelSubscription(subsId, userCompId, userRole) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { subs_id: subsId },
        });
        if (!subscription) {
            throw new common_1.NotFoundException("Suscripción no encontrada");
        }
        if (userRole !== "SUPER_ADMIN" && subscription.comp_id !== userCompId) {
            throw new common_1.UnauthorizedException("No tienes permiso para cancelar esta suscripción");
        }
        await this.prisma.subscription.update({
            where: { subs_id: subsId },
            data: {
                subs_status: "cancelled",
                end_date: new Date(),
            },
        });
        return { message: "Suscripción cancelada exitosamente" };
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map