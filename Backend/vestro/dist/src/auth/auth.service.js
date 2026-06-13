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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        if (registerDto.user_password !== registerDto.user_password_confirm) {
            throw new common_1.BadRequestException("Las contraseñas no coinciden");
        }
        const existingCompany = await this.prisma.company.findUnique({
            where: { comp_email: registerDto.comp_email },
        });
        if (existingCompany) {
            throw new common_1.BadRequestException("La empresa ya está registrada");
        }
        const existingUser = await this.prisma.user.findFirst({
            where: { user_email: registerDto.user_email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException("El email ya está registrado");
        }
        const hashedPassword = await bcrypt.hash(registerDto.user_password, 10);
        const freePlan = await this.prisma.plan.findUnique({
            where: { plan_name: "Free" },
        });
        if (!freePlan) {
            throw new common_1.BadRequestException("Plan Free no existe");
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const company = await tx.company.create({
                data: {
                    comp_name: registerDto.comp_name,
                    comp_email: registerDto.comp_email,
                    comp_phone: registerDto.comp_phone,
                    status: "active",
                },
            });
            const user = await tx.user.create({
                data: {
                    user_name: registerDto.user_name,
                    user_email: registerDto.user_email,
                    user_password: hashedPassword,
                    user_role: "ADMIN",
                    status: "active",
                    comp_id: company.comp_id,
                },
            });
            const subscription = await tx.subscription.create({
                data: {
                    subs_status: "trial",
                    plan_id: freePlan.plan_id,
                    comp_id: company.comp_id,
                    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                },
            });
            return { company, user, subscription };
        });
        return {
            message: "Empresa registrada exitosamente",
            company: {
                comp_id: result.company.comp_id,
                comp_name: result.company.comp_name,
                comp_email: result.company.comp_email,
            },
            subscription: {
                subs_id: result.subscription.subs_id,
                subs_status: result.subscription.subs_status,
            },
        };
    }
    async login(loginDto) {
        const user = await this.prisma.user.findFirst({
            where: { user_email: loginDto.user_email },
            include: {
                company: {
                    include: {
                        subscription: {
                            include: {
                                plan: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("Email o contraseña incorrectos");
        }
        const isPasswordValid = await bcrypt.compare(loginDto.user_password, user.user_password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException("Email o contraseña incorrectos");
        }
        if (user.status !== "active") {
            throw new common_1.UnauthorizedException("El usuario está inactivo");
        }
        if (user.user_role === "SUPER_ADMIN") {
            return this.generateTokens(user, null);
        }
        if (!user.company) {
            throw new common_1.UnauthorizedException("La empresa no existe");
        }
        if (user.company.status !== "active") {
            throw new common_1.UnauthorizedException("La empresa está desactivada");
        }
        const subscription = user.company.subscription;
        if (!subscription) {
            throw new common_1.UnauthorizedException("La empresa no tiene suscripción");
        }
        if (subscription.subs_status === "cancelled") {
            throw new common_1.UnauthorizedException("La suscripción ha sido cancelada");
        }
        if (subscription.subs_status === "expired") {
            if (user.user_role !== "ADMIN") {
                throw new common_1.UnauthorizedException("La suscripción ha expirado. Solo el admin puede acceder para renovar.");
            }
        }
        return this.generateTokens(user, user.company.comp_id);
    }
    generateTokens(user, compId) {
        const payload = {
            sub: user.user_id,
            email: user.user_email,
            role: user.user_role,
            compId: compId,
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });
        return {
            accessToken,
            refreshToken,
            user: {
                user_id: user.user_id,
                user_name: user.user_name,
                user_email: user.user_email,
                user_role: user.user_role,
                comp_id: compId,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map