import { Module } from "@nestjs/common";
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { CompaniesController } from './companies/companies.controller';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [UserModule, CompaniesModule],
  controllers: [UserController, CompaniesController],
  providers: [UserService],
})
export class AppModule {}
