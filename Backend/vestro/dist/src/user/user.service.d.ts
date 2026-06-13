import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DeleteUserDto } from "./dto/delete-user.dto";
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
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto, compId: number, userRole: string): Promise<UserResponse>;
    findAll(compId: number): Promise<UserResponse[]>;
    findOne(userId: number, compId: number): Promise<UserResponse>;
    update(userId: number, updateUserDto: UpdateUserDto, compId: number, userRole: string): Promise<UserResponse>;
    remove(userId: number, deleteUserDto: DeleteUserDto, compId: number, userRole: string): Promise<DeleteResponse>;
    private sanitizeUser;
}
export {};
