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
    freed_slot: boolean;
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
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto, compId: number, userRole: string): Promise<UserResponse>;
    findAll(compId: number): Promise<UserResponse[]>;
    findOne(userId: number, compId: number): Promise<UserResponse>;
    update(userId: number, updateUserDto: UpdateUserDto, compId: number, userRole: string): Promise<UserResponse>;
    remove(userId: number, deleteUserDto: DeleteUserDto, compId: number, userRole: string): Promise<DeleteResponse>;
    getUserStats(compId: number): Promise<UserStats>;
    getAvailableEmployeeSlots(compId: number): Promise<AvailableSlots>;
    private sanitizeUser;
}
export {};
