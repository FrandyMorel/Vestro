import { IsNumber, IsOptional, IsEnum } from "class-validator";

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsNumber()
  plan_id?: number;

  @IsOptional()
  @IsEnum(["trial", "active", "expired", "cancelled"])
  subs_status?: string;
}
