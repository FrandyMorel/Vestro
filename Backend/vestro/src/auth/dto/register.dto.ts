import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
  // Datos de la Empresa
  @IsString()
  comp_name!: string;

  @IsEmail()
  comp_email!: string;

  @IsString()
  comp_phone?: string;

  // Datos del Admin (primer usuario)
  @IsString()
  user_name!: string;

  @IsEmail()
  user_email!: string;

  @IsString()
  @MinLength(6)
  user_password!: string;

  @IsString()
  user_password_confirm!: string;
}
