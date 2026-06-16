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
   * Eliminar usuario
   * Solo ADMIN puede eliminar
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
