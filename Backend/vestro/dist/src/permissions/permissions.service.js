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
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PermissionService = class PermissionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canAccessFeature(compId, feature) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { comp_id: compId },
            include: { plan: true },
        });
        if (!subscription) {
            throw new common_1.NotFoundException("Suscripción no encontrada para esta empresa");
        }
        if (!subscription.plan) {
            throw new common_1.NotFoundException("Plan no encontrado");
        }
        if (subscription.subs_status !== "active" &&
            subscription.subs_status !== "trial") {
            return false;
        }
        switch (feature) {
            case "reports":
                return subscription.plan.has_reports;
            case "ai":
                return subscription.plan.has_ai;
            case "exports":
                return subscription.plan.has_exports;
            default:
                return false;
        }
    }
    async getAvailableFeatures(compId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { comp_id: compId },
            include: { plan: true },
        });
        if (!subscription) {
            throw new common_1.NotFoundException("Suscripción no encontrada para esta empresa");
        }
        if (!subscription.plan) {
            throw new common_1.NotFoundException("Plan no encontrado");
        }
        return {
            plan_name: subscription.plan.plan_name,
            subs_status: subscription.subs_status,
            features: {
                reports: subscription.plan.has_reports,
                ai: subscription.plan.has_ai,
                exports: subscription.plan.has_exports,
            },
        };
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionService);
//# sourceMappingURL=permissions.service.js.map