import { CompanyService } from "./company.service";
import { UpdateCompanyDto } from "./dto/update-company.dto";
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
export declare class CompanyController {
    private companyService;
    constructor(companyService: CompanyService);
    findMyCompany(req: {
        user: AuthenticatedUser;
    }): Promise<CompanyResponse>;
    findAll(req: {
        user: AuthenticatedUser;
    }): Promise<CompanyResponse[]>;
    findOne(id: number, req: {
        user: AuthenticatedUser;
    }): Promise<CompanyResponse>;
    update(id: number, updateCompanyDto: UpdateCompanyDto, req: {
        user: AuthenticatedUser;
    }): Promise<CompanyResponse>;
}
export {};
