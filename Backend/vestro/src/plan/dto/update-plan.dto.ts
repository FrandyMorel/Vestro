import { IsString, IsNumber, IsBoolean, IsOptional } from "class-validator";

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  plan_name?: string;

  @IsOptional()
  @IsNumber()
  price_monthly?: number;

  @IsOptional()
  @IsNumber()
  price_yearly?: number;

  @IsOptional()
  @IsNumber()
  max_users?: number;

  @IsOptional()
  @IsBoolean()
  has_reports?: boolean;

  @IsOptional()
  @IsBoolean()
  has_ai?: boolean;

  @IsOptional()
  @IsBoolean()
  has_exports?: boolean;

  @IsOptional()
  @IsString()
  cardnet_product_id?: string;
}
