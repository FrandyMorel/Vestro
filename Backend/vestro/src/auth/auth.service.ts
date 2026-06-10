import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";

// Interfaces locales
interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_password: string;
  user_role: string;
  status: string;
  comp_id: number | null;
  company?: {
    comp_id: number;
    comp_name: string;
    comp_email: string;
    status: string;
    subscription: {
      subs_id: number;
      subs_status: string;
      plan: {
        plan_id: number;
        plan_name: string;
      };
    } | null;
  } | null;
}

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  compId: number | null;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    user_id: number;
    user_name: string;
    user_email: string;
    user_role: string;
    comp_id: number | null;
  };
}

interface RegisterResponse {
  message: string;
  company: {
    comp_id: number;
    comp_name: string;
    comp_email: string;
  };
  subscription: {
    subs_id: number;
    subs_status: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * REGISTRO: Crear empresa + admin + suscripción free
   */
  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    // 1. Validar que las contraseñas coincidan
    if (registerDto.user_password !== registerDto.user_password_confirm) {
      throw new BadRequestException("Las contraseñas no coinciden");
    }

    // 2. Validar que no exista una empresa con ese email
    const existingCompany = await this.prisma.company.findUnique({
      where: { comp_email: registerDto.comp_email },
    });

    if (existingCompany) {
      throw new BadRequestException("La empresa ya está registrada");
    }

    // 3. Validar que no exista un usuario con ese email
    const existingUser = await this.prisma.user.findFirst({
      where: { user_email: registerDto.user_email },
    });

    if (existingUser) {
      throw new BadRequestException("El email ya está registrado");
    }

    // 4. Hashear contraseña
    const hashedPassword = await bcrypt.hash(registerDto.user_password, 10);

    // 5. Obtener el plan Free
    const freePlan = await this.prisma.plan.findUnique({
      where: { plan_name: "Free" },
    });

    if (!freePlan) {
      throw new BadRequestException("Plan Free no existe");
    }

    // 6. Crear empresa, usuario y suscripción en una transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear empresa
      const company = await tx.company.create({
        data: {
          comp_name: registerDto.comp_name,
          comp_email: registerDto.comp_email,
          comp_phone: registerDto.comp_phone,
          status: "active",
        },
      });
      // eslint-disable-next-line prettier/prettier
 
      // Crear usuario (admin)
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

      // Crear suscripción (Free)
      const subscription = await tx.subscription.create({
        data: {
          subs_status: "trial",
          plan_id: freePlan.plan_id,
          comp_id: company.comp_id,
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
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

  /**
   * LOGIN: Validar credenciales y generar JWT
   */
  async login(loginDto: LoginDto): Promise<TokenResponse> {
    // 1. Buscar usuario
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
      throw new UnauthorizedException("Email o contraseña incorrectos");
    }

    // 2. Validar contraseña
    const isPasswordValid = await bcrypt.compare(
      loginDto.user_password,
      user.user_password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Email o contraseña incorrectos");
    }

    // 3. Validar estado del usuario
    if (user.status !== "active") {
      throw new UnauthorizedException("El usuario está inactivo");
    }

    // 4. Si es SUPER_ADMIN, no validar suscripción
    if (user.user_role === "SUPER_ADMIN") {
      return this.generateTokens(user, null);
    }

    // 5. Validar empresa y suscripción
    if (!user.company) {
      throw new UnauthorizedException("La empresa no existe");
    }

    if (user.company.status !== "active") {
      throw new UnauthorizedException("La empresa está desactivada");
    }

    const subscription = user.company.subscription;

    if (!subscription) {
      throw new UnauthorizedException("La empresa no tiene suscripción");
    }

    // 6. Validar estado de la suscripción
    if (subscription.subs_status === "cancelled") {
      throw new UnauthorizedException("La suscripción ha sido cancelada");
    }

    if (subscription.subs_status === "expired") {
      // Si es ADMIN, permiso limitado
      if (user.user_role !== "ADMIN") {
        throw new UnauthorizedException(
          "La suscripción ha expirado. Solo el admin puede acceder para renovar.",
        );
      }
    }

    // 7. Generar tokens
    return this.generateTokens(user, user.company.comp_id);
  }

  /**
   * Generar JWT tokens (access + refresh)
   */
  private generateTokens(user: User, compId: number | null): TokenResponse {
    const payload: JwtPayload = {
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
}
