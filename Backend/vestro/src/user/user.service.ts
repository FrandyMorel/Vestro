import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DeleteUserDto } from "./dto/delete-user.dto";
import * as bcrypt from "bcrypt";

interface UserResponse {
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

interface DeleteResponse {
  message: string;
  reason: string;
  userId: number;
  freed_slot: boolean;
}

interface UserWithPassword {
  user_password: string;
  [key: string]: unknown;
}

interface UserStats {
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

interface AvailableSlots {
  available_slots: number;
  can_create_more: boolean;
  plan_name: string;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserDto,
    compId: number,
    userRole: string,
  ): Promise<UserResponse> {
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      throw new UnauthorizedException(
        "Solo administradores pueden crear usuarios",
      );
    }

    // Validar que no exista usuario con ese email
    const existingUser = await this.prisma.user.findFirst({
      where: {
        user_email: createUserDto.user_email,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        "El email ya está registrado en el sistema",
      );
    }

    // Obtener suscripción y plan
    const subscription = await this.prisma.subscription.findFirst({
      where: { comp_id: compId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException("Suscripción no encontrada");
    }

    if (!subscription.plan) {
      throw new NotFoundException("Plan no encontrado");
    }

    // Contar usuarios actuales (solo activos)
    const userCount = await this.prisma.user.count({
      where: {
        comp_id: compId,
        status: "active",
      },
    });

    // Validar que no exceda el límite
    if (userCount >= subscription.plan.max_users) {
      throw new BadRequestException(
        `Tu plan '${subscription.plan.plan_name}' permite máximo ${subscription.plan.max_users} usuario(s). ` +
          `Ya tienes ${userCount}. Upgrade tu suscripción para agregar más usuarios.`,
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.user_password, 10);

    // Siempre crear como EMPLOYEE
    const user = await this.prisma.user.create({
      data: {
        user_name: createUserDto.user_name,
        user_email: createUserDto.user_email,
        user_password: hashedPassword,
        user_role: "EMPLOYEE", // Siempre EMPLOYEE
        status: "active",
        comp_id: compId,
      },
    });

    return this.sanitizeUser(user);
  }

  async findAll(compId: number): Promise<UserResponse[]> {
    return this.prisma.user.findMany({
      where: { comp_id: compId },
      select: {
        user_id: true,
        user_name: true,
        user_email: true,
        user_role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findOne(userId: number, compId: number): Promise<UserResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        user_id: userId,
        comp_id: compId,
      },
      select: {
        user_id: true,
        user_name: true,
        user_email: true,
        user_role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    return user;
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
    compId: number,
    userRole: string,
  ): Promise<UserResponse> {
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      throw new UnauthorizedException(
        "Solo administradores pueden editar usuarios",
      );
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        user_id: userId,
        comp_id: compId,
      },
    });

    if (!existingUser) {
      throw new NotFoundException("Usuario no encontrado");
    }

    // No permitir cambiar email
    if (
      updateUserDto.user_email &&
      updateUserDto.user_email !== existingUser.user_email
    ) {
      throw new BadRequestException(
        "No puedes cambiar el email de un usuario. Contacta a soporte.",
      );
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (updateUserDto.user_name) {
      dataToUpdate.user_name = updateUserDto.user_name;
    }

    if (updateUserDto.user_password) {
      dataToUpdate.user_password = await bcrypt.hash(
        updateUserDto.user_password,
        10,
      );
    }

    if (updateUserDto.status) {
      dataToUpdate.status = updateUserDto.status;
    }

    const updatedUser = await this.prisma.user.update({
      where: { user_id: userId },
      data: dataToUpdate,
    });

    return this.sanitizeUser(updatedUser);
  }

  async remove(
    userId: number,
    deleteUserDto: DeleteUserDto,
    compId: number,
    userRole: string,
  ): Promise<DeleteResponse> {
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      throw new UnauthorizedException(
        "Solo administradores pueden eliminar usuarios",
      );
    }

    const user = await this.prisma.user.findFirst({
      where: {
        user_id: userId,
        comp_id: compId,
      },
    });

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    // No permitir eliminar ADMIN
    if (user.user_role === "ADMIN") {
      throw new BadRequestException(
        "No puedes eliminar la cuenta del administrador. Contacta a soporte.",
      );
    }

    // Marcar como deleted (no eliminar completamente)
    await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        status: "deleted",
        user_email: `${user.user_email}.deleted.${Date.now()}`, // Liberar email
      },
    });

    console.log(
      `[AUDITORÍA] Usuario ${userId} eliminado. Razón: ${deleteUserDto.reason}`,
    );

    return {
      message: `Usuario '${user.user_name}' eliminado correctamente`,
      reason: deleteUserDto.reason,
      userId: userId,
      freed_slot: true,
    };
  }

  /**
   * Obtener estadísticas de usuarios del plan
   */
  async getUserStats(compId: number): Promise<UserStats> {
    // Obtener suscripción con plan
    const subscription = await this.prisma.subscription.findFirst({
      where: { comp_id: compId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException("Suscripción no encontrada");
    }

    if (!subscription.plan) {
      throw new NotFoundException("Plan no encontrado");
    }

    // Contar usuarios por rol (solo activos)
    const adminCount = await this.prisma.user.count({
      where: { comp_id: compId, user_role: "ADMIN", status: "active" },
    });

    const employeeCount = await this.prisma.user.count({
      where: { comp_id: compId, user_role: "EMPLOYEE", status: "active" },
    });

    const totalUsers = adminCount + employeeCount;
    const availableSlots = Math.max(
      0,
      subscription.plan.max_users - totalUsers,
    );

    return {
      plan_name: subscription.plan.plan_name,
      max_users: subscription.plan.max_users,
      current_users: totalUsers,
      available_slots: availableSlots,
      can_create_more: availableSlots > 0,
      users_by_role: {
        admin: adminCount,
        employee: employeeCount,
      },
    };
  }

  /**
   * Obtener cuántos slots disponibles para empleados
   */
  async getAvailableEmployeeSlots(compId: number): Promise<AvailableSlots> {
    const stats = await this.getUserStats(compId);

    return {
      available_slots: stats.available_slots,
      can_create_more: stats.can_create_more,
      plan_name: stats.plan_name,
    };
  }

  private sanitizeUser(user: UserWithPassword): UserResponse {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_password, ...userWithoutPassword } = user;
    return userWithoutPassword as unknown as UserResponse;
  }
}
