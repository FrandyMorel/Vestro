import { IsEmail, IsString, MinLength, IsEnum } from "class-validator";

export class CreateUserDto {
  @IsString()
  user_name!: string;

  @IsEmail()
  user_email!: string;

  @IsString()
  @MinLength(6)
  user_password!: string;

  @IsEnum(["ADMIN", "EMPLOYEE"])
  user_role!: string;

  // comp_id se obtiene del JWT del usuario autenticado
  // No lo envía el cliente
}
