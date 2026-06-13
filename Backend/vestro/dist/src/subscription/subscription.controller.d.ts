import { SubscriptionService } from "./subscription.service";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
interface AuthenticatedUser {
    userId: number;
    email: string;
    role: string;
    compId: number | null;
}
interface SubscriptionResponse {
    subs_id: number;
    subs_status: string;
    start_date: Date | null;
    end_date: Date | null;
    trial_ends_at: Date | null;
    cardnet_customer_id: string | null;
    cardnet_transaction_id: string | null;
    created_at: Date;
    updated_at: Date;
    plan_id: number;
    comp_id: number | null;
}
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    findMySubscription(req: {
        user: AuthenticatedUser;
    }): Promise<SubscriptionResponse>;
    findAll(req: {
        user: AuthenticatedUser;
    }): Promise<SubscriptionResponse[]>;
    findOne(id: number, req: {
        user: AuthenticatedUser;
    }): Promise<SubscriptionResponse>;
    update(id: number, updateSubscriptionDto: UpdateSubscriptionDto, req: {
        user: AuthenticatedUser;
    }): Promise<SubscriptionResponse>;
    cancel(id: number, req: {
        user: AuthenticatedUser;
    }): Promise<{
        message: string;
    }>;
}
export {};
