import { IsString, IsNumber, IsBoolean, IsOptional } from "class-validator";

export class CreatePlanDto {
  @IsString()
  plan_name!: string;

  @IsNumber()
  price_monthly!: number;

  @IsNumber()
  price_yearly!: number;

  @IsNumber()
  max_users!: number;

  @IsBoolean()
  has_reports!: boolean;

  @IsBoolean()
  has_ai!: boolean;

  @IsBoolean()
  has_exports!: boolean;

  @IsOptional()
  @IsString()
  cardnet_product_id?: string;
}
