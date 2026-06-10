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

// Interfaces locales
interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
  compId: number;
}

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

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<UserResponse> {
    return this.userService.create(
      createUserDto,
      req.user.compId,
      req.user.role,
    );
  }

  @Get()
  async findAll(
    @Request() req: { user: AuthenticatedUser },
  ): Promise<UserResponse[]> {
    return this.userService.findAll(req.user.compId);
  }

  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<UserResponse> {
    return this.userService.findOne(id, req.user.compId);
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<UserResponse> {
    return this.userService.update(
      id,
      updateUserDto,
      req.user.compId,
      req.user.role,
    );
  }

  @Delete(":id")
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @Body() deleteUserDto: DeleteUserDto,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<DeleteResponse> {
    return this.userService.remove(
      id,
      deleteUserDto,
      req.user.compId,
      req.user.role,
    );
  }
}
