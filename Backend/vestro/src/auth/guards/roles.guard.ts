import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

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
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.get<string[]>("roles", context.getHandler()) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Usuario no encontrado en JWT");
    }

    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Rol '${user.role}' no tiene permiso. Roles permitidos: ${requiredRoles.join(", ")}`,
      );
    }

    return true;
  }
}
