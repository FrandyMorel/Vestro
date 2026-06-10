import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { CompaniesModule } from "./companies/companies.module";
import { SubscriptionModule } from "./subscription/subscription.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    CompaniesModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
