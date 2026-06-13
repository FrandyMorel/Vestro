import { PrismaService } from "../prisma/prisma.service";
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
export declare class CompanyService {
    private prisma;
    constructor(prisma: PrismaService);
    findMyCompany(compId: number): Promise<CompanyResponse>;
    findOne(compId: number, userCompId: number, userRole: string): Promise<CompanyResponse>;
    update(compId: number, updateCompanyDto: UpdateCompanyDto, userCompId: number, userRole: string): Promise<CompanyResponse>;
    findAll(userRole: string): Promise<CompanyResponse[]>;
}
export {};
