import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DeleteUserDto } from "./dto/delete-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { SubscriptionGuard } from "../auth/guards/subscription.guard";
import { MaxUsersGuard } from "../auth/guards/max-users.guard";

// Interfaces locales
interface IAuthenticatedUser {
  userId: number;
  email: string;
  role: string;
  compId: number;
}

interface IUserResponse {
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

interface IDeleteResponse {
  message: string;
  reason: string;
  userId: number;
  freed_slot: boolean;
}

interface IUserStats {
  plan_name: string;
  max_users: number;
  current_users: number;
  available_slots: number;
  can_create_more: boolean;
  users_by_role: {
    admin: number;
    employee: number;
  };
}

interface IAvailableSlots {
  available_slots: number;
  can_create_more: boolean;
  plan_name: string;
}

@Controller("users")
@UseGuards(JwtAuthGuard, SubscriptionGuard)
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * POST /users
   * Crear nuevo usuario (EMPLOYEE)
   * Solo ADMIN puede crear usuarios
   * MaxUsersGuard valida que no excedas el límite
   */
  @Post()
  @UseGuards(RolesGuard, MaxUsersGuard)
  @Roles("ADMIN")
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: { user: IAuthenticatedUser },
  ): Promise<IUserResponse> {
    return this.userService.create(
      createUserDto,
      req.user.compId,
      req.user.role,
    );
  }

  /**
   * GET /users/all
   * Listar todos los usuarios de la empresa
   * Cualquier usuario autenticado puede ver
   */
  @Get("all")
  async findAll(
    @Request() req: { user: IAuthenticatedUser },
  ): Promise<IUserResponse[]> {
    return this.userService.findAll(req.user.compId);
  }

  /**
   * GET /users/stats
   * Obtener estadísticas de usuarios del plan
   *
   * Respuesta incluye:
   * - plan_name: nombre del plan actual
   * - max_users: usuarios máximos permitidos
   * - current_users: usuarios activos actualmente
   * - available_slots: espacios disponibles
   * - can_create_more: booleano si puedo crear más
   * - users_by_role: desglose por ADMIN y EMPLOYEE
   */
  @Get("stats")
  async getUserStats(
    @Request() req: { user: IAuthenticatedUser },
  ): Promise<IUserStats> {
    return this.userService.getUserStats(req.user.compId);
  }

  /**
   * GET /users/available-slots
   * Obtener cuántos slots disponibles para crear empleados
   *
   * Respuesta más simple que /stats
   * Útil para mostrar en el UI
   */
  @Get("available-slots")
  async getAvailableSlots(
    @Request() req: { user: IAuthenticatedUser },
  ): Promise<IAvailableSlots> {
    return this.userService.getAvailableEmployeeSlots(req.user.compId);
  }

  /**
   * GET /users/:id
   * Obtener usuario específico
   */
  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: IAuthenticatedUser },
  ): Promise<IUserResponse> {
    return this.userService.findOne(id, req.user.compId);
  }

  /**
   * PUT /users/:id
   * Actualizar usuario
   * Solo ADMIN puede actualizar
   *
   * Permitido cambiar:
   * - user_name (nombre)
   * - user_password (contraseña)
   * - status (activo/inactivo)
   *
   * NO permitido cambiar:
   * - user_email (para integridad)
   * - user_role (debe ser EMPLOYEE)
   */
  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: IAuthenticatedUser },
  ): Promise<IUserResponse> {
    return this.userService.update(
      id,
      updateUserDto,
      req.user.compId,
      req.user.role,
    );
  }

  /**
   * DELETE /users/:id
   * Eliminar usuario (marcar como deleted)
   * Solo ADMIN puede eliminar
   *
   * Flujo:
   * 1. Marca usuario como deleted
   * 2. Cambia email para liberar el original
   * 3. Libera plaza en el plan
   * 4. Mantiene historial (no borra datos)
   */
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @Body() deleteUserDto: DeleteUserDto,
    @Request() req: { user: IAuthenticatedUser },
  ): Promise<IDeleteResponse> {
    return this.userService.remove(
      id,
      deleteUserDto,
      req.user.compId,
      req.user.role,
    );
  }
}
