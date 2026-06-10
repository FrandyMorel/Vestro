import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  user_email!: string;

  @IsString()
  @MinLength(6)
  user_password!: string;
}
