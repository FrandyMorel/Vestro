import { PrismaService } from "../prisma/prisma.service";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";
interface PlanResponse {
    plan_id: number;
    plan_name: string;
    price_monthly: number;
    price_yearly: number;
    max_users: number;
    has_reports: boolean;
    has_ai: boolean;
    has_exports: boolean;
    cardnet_product_id: string | null;
    created_at: Date;
    updated_at: Date;
}
export declare class PlanService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPlanDto: CreatePlanDto, userRole: string): Promise<PlanResponse>;
    findAll(): Promise<PlanResponse[]>;
    findOne(planId: number): Promise<PlanResponse>;
    update(planId: number, updatePlanDto: UpdatePlanDto, userRole: string): Promise<PlanResponse>;
    remove(planId: number, userRole: string): Promise<{
        message: string;
    }>;
}
export {};
