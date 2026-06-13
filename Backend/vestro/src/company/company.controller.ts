import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from "@nestjs/common";
import { CompanyService } from "./company.service";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
  compId: number | null;
}

interface CompanyResponse {
  comp_id: number;
  comp_name: string;
  comp_email: string;
  comp_phone: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

@Controller("companies")
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  /**
   * GET /companies/me
   * Obtener mi empresa
   */
  @Get("me")
  async findMyCompany(
    @Request() req: { user: AuthenticatedUser },
  ): Promise<CompanyResponse> {
    return await this.companyService.findMyCompany(req.user.compId || 0);
  }

  /**
   * GET /companies
   * Listar todas las empresas (solo SUPER_ADMIN)
   */
  @Get()
  async findAll(
    @Request() req: { user: AuthenticatedUser },
  ): Promise<CompanyResponse[]> {
    return await this.companyService.findAll(req.user.role);
  }

  /**
   * GET /companies/:id
   * Obtener empresa específica
   */
  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<CompanyResponse> {
    return await this.companyService.findOne(
      id,
      req.user.compId || 0,
      req.user.role,
    );
  }

  /**
   * PUT /companies/:id
   * Editar empresa
   */
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<CompanyResponse> {
    return await this.companyService.update(
      id,
      updateCompanyDto,
      req.user.compId || 0,
      req.user.role,
    );
  }
}
