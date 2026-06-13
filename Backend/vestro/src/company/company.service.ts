import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

interface CompanyResponse {
  comp_id: number;
  comp_name: string;
  comp_email: string;
  comp_phone: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  /**
   * OBTENER empresa del usuario autenticado
   */
  async findMyCompany(compId: number): Promise<CompanyResponse> {
    const company = await this.prisma.company.findUnique({
      where: { comp_id: compId },
      select: {
        comp_id: true,
        comp_name: true,
        comp_email: true,
        comp_phone: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!company) {
      throw new NotFoundException("Empresa no encontrada");
    }

    return company as CompanyResponse;
  }

  /**
   * OBTENER empresa por ID
   * Solo SUPER_ADMIN o ADMIN de la empresa pueden verla
   */
  async findOne(compId: number, userCompId: number, userRole: string): Promise<CompanyResponse> {
    // Validar acceso: SUPER_ADMIN ve todo, ADMIN solo su empresa
    if (userRole !== "SUPER_ADMIN" && compId !== userCompId) {
      throw new UnauthorizedException(
        "No tienes permiso para ver esta empresa",
      );
    }

    const company = await this.prisma.company.findUnique({
      where: { comp_id: compId },
      select: {
        comp_id: true,
        comp_name: true,
        comp_email: true,
        comp_phone: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!company) {
      throw new NotFoundException("Empresa no encontrada");
    }

    return company as CompanyResponse;
  }

  /**
   * ACTUALIZAR empresa
   * Solo SUPER_ADMIN o ADMIN de la empresa
   */
  async update(
    compId: number,
    updateCompanyDto: UpdateCompanyDto,
    userCompId: number,
    userRole: string,
  ): Promise<CompanyResponse> {
    // Validar acceso
    if (userRole !== "SUPER_ADMIN" && compId !== userCompId) {
      throw new UnauthorizedException(
        "No tienes permiso para editar esta empresa",
      );
    }

    // Verificar que la empresa existe
    const existingCompany = await this.prisma.company.findUnique({
      where: { comp_id: compId },
    });

    if (!existingCompany) {
      throw new NotFoundException("Empresa no encontrada");
    }

    // Si intenta cambiar email, validar que no exista otro
    if (
      updateCompanyDto.comp_email &&
      updateCompanyDto.comp_email !== existingCompany.comp_email
    ) {
      const emailExists = await this.prisma.company.findUnique({
        where: { comp_email: updateCompanyDto.comp_email },
      });

      if (emailExists) {
        throw new BadRequestException("El email ya está registrado");
      }
    }

    // Actualizar
    const updatedCompany = await this.prisma.company.update({
      where: { comp_id: compId },
      data: updateCompanyDto,
    });

    return updatedCompany as CompanyResponse;
  }

  /**
   * OBTENER todas las empresas (solo SUPER_ADMIN)
   */
  async findAll(userRole: string): Promise<CompanyResponse[]> {
    if (userRole !== "SUPER_ADMIN") {
      throw new UnauthorizedException(
        "Solo super administradores pueden listar todas las empresas",
      );
    }

    const companies = await this.prisma.company.findMany({
      select: {
        comp_id: true,
        comp_name: true,
        comp_email: true,
        comp_phone: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return companies as CompanyResponse[];
  }
}