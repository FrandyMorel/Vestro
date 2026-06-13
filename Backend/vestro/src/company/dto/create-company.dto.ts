import { IsString, IsEmail, IsOptional } from "class-validator";

export class CreateCompanyDto {
  @IsString()
  comp_name!: string;

  @IsEmail()
  comp_email!: string;

  @IsOptional()
  @IsString()
  comp_phone?: string;
}
