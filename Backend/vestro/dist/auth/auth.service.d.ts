import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
    private generateTokens;
}
