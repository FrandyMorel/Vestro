import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { PlanModule } from "./plan/plan.module";
import { CompanyModule } from "./company/company.module";

@Module({
  imports: [PrismaModule, AuthModule, UserModule, PlanModule, CompanyModule],
})
export class AppModule {}
