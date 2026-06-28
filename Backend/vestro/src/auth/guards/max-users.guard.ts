import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Request } from "express";

import { PrismaService } from "../../prisma/prisma.service";

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  compId?: number;
}

interface AuthRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class MaxUsersGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    const user = request.user;

    // SUPER_ADMIN no tiene límite
    if (user.role === "SUPER_ADMIN") {
      return true;
    }

    if (!user.compId) {
      throw new ForbiddenException("Company ID no encontrado en JWT");
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
      throw new ForbiddenException("Suscripción no encontrada");
    }

    const userCount = await this.prisma.user.count({
      where: {
        comp_id: user.compId,
      },
    });

    const maxAllowed = subscription.plan.max_users;

    if (userCount >= maxAllowed) {
      throw new ForbiddenException(
        `Tu plan '${subscription.plan.plan_name}' permite máximo ${maxAllowed} usuario(s). Ya tienes ${userCount}. Mejora tu plan para obtener mas usuaraios.`,
      );
    }

    return true;
  }
}
