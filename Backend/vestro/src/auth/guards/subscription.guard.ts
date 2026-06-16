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
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    const user = request.user;

    // SUPER_ADMIN no necesita validar suscripción
    if (user.role === "SUPER_ADMIN") {
      return true;
    }

    // Si no tiene compId, algo está mal
    if (!user.compId) {
      throw new ForbiddenException("Company ID no encontrado en JWT");
    }

    // Obtener suscripción actual de la BD
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

    // Suscripción cancelada
    if (subscription.subs_status === "cancelled") {
      throw new ForbiddenException(
        "La suscripción ha sido cancelada. Contacta al administrador.",
      );
    }

    // Suscripción expirada
    if (subscription.subs_status === "expired") {
      if (user.role !== "ADMIN") {
        throw new ForbiddenException(
          "La suscripción ha expirado. Solo el administrador puede acceder para renovar.",
        );
      }

      return true;
    }

    // Activa o trial
    if (
      subscription.subs_status === "active" ||
      subscription.subs_status === "trial"
    ) {
      return true;
    }

    throw new ForbiddenException("Estado de suscripción desconocido");
  }
}
