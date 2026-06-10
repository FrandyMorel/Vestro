import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        company: {
            comp_id: number;
            comp_name: string;
            comp_email: string;
        };
        subscription: {
            subs_id: number;
            subs_status: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            user_id: any;
            user_name: any;
            user_email: any;
            user_role: any;
            comp_id: number | null;
        };
    }>;
}
