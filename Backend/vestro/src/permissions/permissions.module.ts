import { Module } from "@nestjs/common";
import { PermissionService } from "./permissions.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionsModule {}
