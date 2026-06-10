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
}

interface UserWithPassword {
  user_password: string;
  [key: string]: unknown;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserDto,
    compId: number,
    userRole: string,
  ): Promise<UserResponse> {
    if (userRole !== "ADMIN") {
      throw new UnauthorizedException(
        "Solo administradores pueden crear usuarios",
      );
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        user_email: createUserDto.user_email,
        comp_id: compId,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        "El email ya está registrado en la empresa",
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.user_password, 10);

    const user = await this.prisma.user.create({
      data: {
        user_name: createUserDto.user_name,
        user_email: createUserDto.user_email,
        user_password: hashedPassword,
        user_role: createUserDto.user_role,
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
    if (userRole !== "ADMIN") {
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

    if (
      updateUserDto.user_email &&
      updateUserDto.user_email !== existingUser.user_email
    ) {
      const emailExists = await this.prisma.user.findFirst({
        where: {
          user_email: updateUserDto.user_email,
          comp_id: compId,
        },
      });

      if (emailExists) {
        throw new BadRequestException(
          "El email ya está registrado en la empresa",
        );
      }
    }

    const dataToUpdate: Record<string, unknown> = { ...updateUserDto };
    if (updateUserDto.user_password) {
      dataToUpdate.user_password = await bcrypt.hash(
        updateUserDto.user_password,
        10,
      );
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
    if (userRole !== "ADMIN") {
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

    if (user.user_role === "ADMIN") {
      const adminCount = await this.prisma.user.count({
        where: {
          comp_id: compId,
          user_role: "ADMIN",
        },
      });

      if (adminCount === 1) {
        throw new BadRequestException(
          "No puedes eliminar el único administrador de la empresa",
        );
      }
    }

    console.log(
      `[AUDITORÍA] Usuario ${userId} eliminado. Razón: ${deleteUserDto.reason}. Notas: ${deleteUserDto.notes || "N/A"}`,
    );

    await this.prisma.user.delete({
      where: { user_id: userId },
    });

    return {
      message: "Usuario eliminado exitosamente",
      reason: deleteUserDto.reason,
      userId: userId,
    };
  }

  private sanitizeUser(user: UserWithPassword): UserResponse {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_password, ...userWithoutPassword } = user;
    return userWithoutPassword as unknown as UserResponse;
  }
}
