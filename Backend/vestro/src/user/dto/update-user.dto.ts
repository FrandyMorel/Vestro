import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsEmail()
  user_email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  user_password?: string;

  @IsOptional()
  @IsEnum(["ADMIN", "EMPLOYEE"])
  user_role?: string;

  @IsOptional()
  @IsEnum(["active", "inactive"])
  status?: string;
}
