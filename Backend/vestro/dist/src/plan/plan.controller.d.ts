import { PlanService } from "./plan.service";
import { PermissionService } from "../permissions/permissions.service";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";
interface IAuthenticatedUser {
    userId: number;
    email: string;
    role: string;
    compId: number | null;
}
interface IPlanResponse {
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
interface IAvailableFeatures {
    plan_name: string;
    subs_status: string;
    features: {
        reports: boolean;
        ai: boolean;
        exports: boolean;
    };
}
export declare class PlanController {
    private planService;
    private permissionService;
    constructor(planService: PlanService, permissionService: PermissionService);
    create(createPlanDto: CreatePlanDto, req: {
        user: IAuthenticatedUser;
    }): Promise<IPlanResponse>;
    findAll(): Promise<IPlanResponse[]>;
    getMyFeatures(req: {
        user: IAuthenticatedUser;
    }): Promise<IAvailableFeatures>;
    findOne(id: number): Promise<IPlanResponse>;
    update(id: number, updatePlanDto: UpdatePlanDto, req: {
        user: IAuthenticatedUser;
    }): Promise<IPlanResponse>;
    remove(id: number, req: {
        user: IAuthenticatedUser;
    }): Promise<{
        message: string;
    }>;
}
export {};
