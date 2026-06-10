import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DeleteUserDto } from "./dto/delete-user.dto";
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
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto, req: {
        user: AuthenticatedUser;
    }): Promise<UserResponse>;
    findAll(req: {
        user: AuthenticatedUser;
    }): Promise<UserResponse[]>;
    findOne(id: number, req: {
        user: AuthenticatedUser;
    }): Promise<UserResponse>;
    update(id: number, updateUserDto: UpdateUserDto, req: {
        user: AuthenticatedUser;
    }): Promise<UserResponse>;
    remove(id: number, deleteUserDto: DeleteUserDto, req: {
        user: AuthenticatedUser;
    }): Promise<DeleteResponse>;
}
export {};
