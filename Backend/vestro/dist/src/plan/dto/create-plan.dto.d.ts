export declare class CreatePlanDto {
    plan_name: string;
    price_monthly: number;
    price_yearly: number;
    max_users: number;
    has_reports: boolean;
    has_ai: boolean;
    has_exports: boolean;
    cardnet_product_id?: string;
}
