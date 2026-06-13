import { IsString, IsEmail, IsOptional } from "class-validator";

export class UpdateCompanyDto {
  @IsString()
  comp_name!: string;

  @IsEmail()
  comp_email!: string;

  @IsOptional()
  @IsString()
  comp_phone?: string;
}
