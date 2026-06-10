import { IsString, IsOptional, IsBoolean } from "class-validator";

export class DeleteUserDto {
  @IsString()
  reason!: string; // Razón de eliminación

  @IsOptional()
  @IsString()
  notes?: string; // Notas adicionales

  @IsOptional()
  @IsBoolean()
  sendNotification?: boolean; // Enviar notificación al usuario
}
