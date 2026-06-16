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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
const common_1 = require("@nestjs/common");
const plan_service_1 = require("./plan.service");
const permissions_service_1 = require("../permissions/permissions.service");
const create_plan_dto_1 = require("./dto/create-plan.dto");
const update_plan_dto_1 = require("./dto/update-plan.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const roles_decorator_1 = require("../auth/decorator/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
let PlanController = class PlanController {
    planService;
    permissionService;
    constructor(planService, permissionService) {
        this.planService = planService;
        this.permissionService = permissionService;
    }
    async create(createPlanDto, req) {
        return this.planService.create(createPlanDto, req.user.role);
    }
    async findAll() {
        return this.planService.findAll();
    }
    async getMyFeatures(req) {
        return this.permissionService.getAvailableFeatures(req.user.compId || 0);
    }
    async findOne(id) {
        return this.planService.findOne(id);
    }
    async update(id, updatePlanDto, req) {
        return this.planService.update(id, updatePlanDto, req.user.role);
    }
    async remove(id, req) {
        return this.planService.remove(id, req.user.role);
    }
};
exports.PlanController = PlanController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_plan_dto_1.CreatePlanDto, Object]),
    __metadata("design:returntype", Promise)
], PlanController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("features"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlanController.prototype, "getMyFeatures", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PlanController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_plan_dto_1.UpdatePlanDto, Object]),
    __metadata("design:returntype", Promise)
], PlanController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("SUPER_ADMIN"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PlanController.prototype, "remove", null);
exports.PlanController = PlanController = __decorate([
    (0, common_1.Controller)("plans"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [plan_service_1.PlanService,
        permissions_service_1.PermissionService])
], PlanController);
//# sourceMappingURL=plan.controller.js.map