import { PlanService } from "./plan.service";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";
interface AuthenticatedUser {
    userId: number;
    email: string;
    role: string;
    compId: number | null;
}
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
export declare class PlanController {
    private planService;
    constructor(planService: PlanService);
    create(createPlanDto: CreatePlanDto, req: {
        user: AuthenticatedUser;
    }): Promise<PlanResponse>;
    findAll(): Promise<PlanResponse[]>;
    findOne(id: number): Promise<PlanResponse>;
    update(id: number, updatePlanDto: UpdatePlanDto, req: {
        user: AuthenticatedUser;
    }): Promise<PlanResponse>;
    remove(id: number, req: {
        user: AuthenticatedUser;
    }): Promise<{
        message: string;
    }>;
}
export {};
