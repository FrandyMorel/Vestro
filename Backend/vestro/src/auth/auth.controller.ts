import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { TokenResponse, RegisterResponse } from "../auth.interfaces";
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register
   * Registrar nueva empresa + admin
   */
  @Post("register")
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Login con email y contraseña
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(loginDto);
  }
}
