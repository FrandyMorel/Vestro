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
exports.PlanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PlanService = class PlanService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPlanDto, userRole) {
        if (userRole !== "SUPER_ADMIN") {
            throw new common_1.UnauthorizedException("Solo super administradores pueden crear planes");
        }
        const existingPlan = await this.prisma.plan.findFirst({
            where: { plan_name: createPlanDto.plan_name },
        });
        if (existingPlan) {
            throw new common_1.BadRequestException("El plan ya existe");
        }
        const plan = await this.prisma.plan.create({
            data: {
                plan_name: createPlanDto.plan_name,
                price_monthly: createPlanDto.price_monthly,
                price_yearly: createPlanDto.price_yearly,
                max_users: createPlanDto.max_users,
                has_reports: createPlanDto.has_reports,
                has_ai: createPlanDto.has_ai,
                has_exports: createPlanDto.has_exports,
                cardnet_product_id: createPlanDto.cardnet_product_id || null,
            },
        });
        return plan;
    }
    async findAll() {
        return this.prisma.plan.findMany();
    }
    async findOne(planId) {
        const plan = await this.prisma.plan.findUnique({
            where: { plan_id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException("Plan no encontrado");
        }
        return plan;
    }
    async update(planId, updatePlanDto, userRole) {
        if (userRole !== "SUPER_ADMIN") {
            throw new common_1.UnauthorizedException("Solo super administradores pueden editar planes");
        }
        const existingPlan = await this.prisma.plan.findUnique({
            where: { plan_id: planId },
        });
        if (!existingPlan) {
            throw new common_1.NotFoundException("Plan no encontrado");
        }
        if (updatePlanDto.plan_name &&
            updatePlanDto.plan_name !== existingPlan.plan_name) {
            const planExists = await this.prisma.plan.findFirst({
                where: { plan_name: updatePlanDto.plan_name },
            });
            if (planExists) {
                throw new common_1.BadRequestException("El nombre del plan ya existe");
            }
        }
        const updatedPlan = await this.prisma.plan.update({
            where: { plan_id: planId },
            data: updatePlanDto,
        });
        return updatedPlan;
    }
    async remove(planId, userRole) {
        if (userRole !== "SUPER_ADMIN") {
            throw new common_1.UnauthorizedException("Solo super administradores pueden eliminar planes");
        }
        const plan = await this.prisma.plan.findUnique({
            where: { plan_id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException("Plan no encontrado");
        }
        const activeSubscriptions = await this.prisma.subscription.count({
            where: { plan_id: planId },
        });
        if (activeSubscriptions > 0) {
            throw new common_1.BadRequestException("No puedes eliminar un plan que tiene suscripciones activas");
        }
        await this.prisma.plan.delete({
            where: { plan_id: planId },
        });
        return { message: "Plan eliminado exitosamente" };
    }
};
exports.PlanService = PlanService;
exports.PlanService = PlanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlanService);
//# sourceMappingURL=plan.service.js.map