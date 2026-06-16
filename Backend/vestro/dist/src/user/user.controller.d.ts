import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DeleteUserDto } from "./dto/delete-user.dto";
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
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto, req: {
        user: IAuthenticatedUser;
    }): Promise<IUserResponse>;
    findAll(req: {
        user: IAuthenticatedUser;
    }): Promise<IUserResponse[]>;
    findOne(id: number, req: {
        user: IAuthenticatedUser;
    }): Promise<IUserResponse>;
    update(id: number, updateUserDto: UpdateUserDto, req: {
        user: IAuthenticatedUser;
    }): Promise<IUserResponse>;
    remove(id: number, deleteUserDto: DeleteUserDto, req: {
        user: IAuthenticatedUser;
    }): Promise<IDeleteResponse>;
}
export {};
