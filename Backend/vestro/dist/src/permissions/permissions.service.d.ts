import { PrismaService } from "../prisma/prisma.service";
export type FeatureType = "reports" | "ai" | "exports";
export declare class PermissionService {
    private prisma;
    constructor(prisma: PrismaService);
    canAccessFeature(compId: number, feature: FeatureType): Promise<boolean>;
    getAvailableFeatures(compId: number): Promise<{
        plan_name: string;
        subs_status: string;
        features: {
            reports: boolean;
            ai: boolean;
            exports: boolean;
        };
    }>;
}
