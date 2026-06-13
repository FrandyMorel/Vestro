import { PrismaService } from "../prisma/prisma.service";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
interface SubscriptionResponse {
    subs_id: number;
    subs_status: string;
    start_date: Date | null;
    end_date: Date | null;
    trial_ends_at: Date | null;
    cardnet_customer_id: string | null;
    cardnet_subscription_id: string | null;
    created_at: Date;
    updated_at: Date;
    plan_id: number;
    comp_id: number | null;
}
export declare class SubscriptionService {
    private prisma;
    constructor(prisma: PrismaService);
    findMySubscription(compId: number): Promise<SubscriptionResponse>;
    findOne(subsId: number, userCompId: number, userRole: string): Promise<SubscriptionResponse>;
    findByCompany(compId: number): Promise<SubscriptionResponse>;
    update(subsId: number, updateSubscriptionDto: UpdateSubscriptionDto, userCompId: number, userRole: string): Promise<SubscriptionResponse>;
    findAll(userRole: string): Promise<SubscriptionResponse[]>;
    activateSubscription(subsId: number, cardnetCustomerId: string, cardnetSubscriptionId: string): Promise<SubscriptionResponse>;
    cancelSubscription(subsId: number, userCompId: number, userRole: string): Promise<{
        message: string;
    }>;
}
export {};
