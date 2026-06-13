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
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CompanyService = class CompanyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMyCompany(compId) {
        const company = await this.prisma.company.findUnique({
            where: { comp_id: compId },
            select: {
                comp_id: true,
                comp_name: true,
                comp_email: true,
                comp_phone: true,
                status: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!company) {
            throw new common_1.NotFoundException("Empresa no encontrada");
        }
        return company;
    }
    async findOne(compId, userCompId, userRole) {
        if (userRole !== "SUPER_ADMIN" && compId !== userCompId) {
            throw new common_1.UnauthorizedException("No tienes permiso para ver esta empresa");
        }
        const company = await this.prisma.company.findUnique({
            where: { comp_id: compId },
            select: {
                comp_id: true,
                comp_name: true,
                comp_email: true,
                comp_phone: true,
                status: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!company) {
            throw new common_1.NotFoundException("Empresa no encontrada");
        }
        return company;
    }
    async update(compId, updateCompanyDto, userCompId, userRole) {
        if (userRole !== "SUPER_ADMIN" && compId !== userCompId) {
            throw new common_1.UnauthorizedException("No tienes permiso para editar esta empresa");
        }
        const existingCompany = await this.prisma.company.findUnique({
            where: { comp_id: compId },
        });
        if (!existingCompany) {
            throw new common_1.NotFoundException("Empresa no encontrada");
        }
        if (updateCompanyDto.comp_email &&
            updateCompanyDto.comp_email !== existingCompany.comp_email) {
            const emailExists = await this.prisma.company.findUnique({
                where: { comp_email: updateCompanyDto.comp_email },
            });
            if (emailExists) {
                throw new common_1.BadRequestException("El email ya está registrado");
            }
        }
        const updatedCompany = await this.prisma.company.update({
            where: { comp_id: compId },
            data: updateCompanyDto,
        });
        return updatedCompany;
    }
    async findAll(userRole) {
        if (userRole !== "SUPER_ADMIN") {
            throw new common_1.UnauthorizedException("Solo super administradores pueden listar todas las empresas");
        }
        const companies = await this.prisma.company.findMany({
            select: {
                comp_id: true,
                comp_name: true,
                comp_email: true,
                comp_phone: true,
                status: true,
                created_at: true,
                updated_at: true,
            },
        });
        return companies;
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyService);
//# sourceMappingURL=company.service.js.map