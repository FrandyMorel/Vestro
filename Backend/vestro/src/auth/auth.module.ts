import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { RolesGuard } from "./guards/roles.guard";
import { SubscriptionGuard } from "./guards/subscription.guard";
import { MaxUsersGuard } from "./guards/max-users.guard";
import { PermissionsModule } from "../permissions/permissions.module";

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    PermissionsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: "15m" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    SubscriptionGuard,
    MaxUsersGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    JwtAuthGuard,
    RolesGuard,
    SubscriptionGuard,
    MaxUsersGuard,
  ],
})
export class AuthModule {}
