import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        user_id: number;
        user_name: string;
        user_email: string;
        user_role: string;
        comp_id: number | null;
    };
}
interface RegisterResponse {
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
}
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<RegisterResponse>;
    login(loginDto: LoginDto): Promise<TokenResponse>;
    private generateTokens;
}
export {};
