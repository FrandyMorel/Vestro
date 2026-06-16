import { SetMetadata } from "@nestjs/common";

/**
 * Decorator para especificar los roles permitidos en un endpoint
 * Uso:
 * @Roles('ADMIN')
 * @Roles('ADMIN', 'EMPLOYEE')
 * @Roles('SUPER_ADMIN')
 */
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
