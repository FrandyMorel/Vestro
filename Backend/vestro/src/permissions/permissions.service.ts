import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Types para features disponibles
 */
export type FeatureType = "reports" | "ai" | "exports";

/**
 * Service para validar permisos basados en features del plan
 * Valida si un usuario tiene acceso a una feature específica
 */
@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verificar si una compañía tiene acceso a una feature
   * @param compId - ID de la empresa
   * @param feature - Feature a validar ('reports', 'ai', 'exports')
   * @returns boolean - true si tiene acceso, false si no
   */
  async canAccessFeature(
    compId: number,
    feature: FeatureType,
  ): Promise<boolean> {
    // Obtener suscripción con plan
    const subscription = await this.prisma.subscription.findFirst({
      where: { comp_id: compId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException(
        "Suscripción no encontrada para esta empresa",
      );
    }

    if (!subscription.plan) {
      throw new NotFoundException("Plan no encontrado");
    }

    // ❌ Si suscripción no está activa, no hay acceso a features
    if (
      subscription.subs_status !== "active" &&
      subscription.subs_status !== "trial"
    ) {
      return false;
    }

    // Validar feature específica
    switch (feature) {
      case "reports":
        return subscription.plan.has_reports;
      case "ai":
        return subscription.plan.has_ai;
      case "exports":
        return subscription.plan.has_exports;
      default:
        return false;
    }
  }

  /**
   * Obtener las features disponibles del plan actual
   * @param compId - ID de la empresa
   * @returns Objeto con features disponibles
   */
  async getAvailableFeatures(compId: number): Promise<{
    plan_name: string;
    subs_status: string;
    features: {
      reports: boolean;
      ai: boolean;
      exports: boolean;
    };
  }> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { comp_id: compId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException(
        "Suscripción no encontrada para esta empresa",
      );
    }

    if (!subscription.plan) {
      throw new NotFoundException("Plan no encontrado");
    }

    return {
      plan_name: subscription.plan.plan_name,
      subs_status: subscription.subs_status,
      features: {
        reports: subscription.plan.has_reports,
        ai: subscription.plan.has_ai,
        exports: subscription.plan.has_exports,
      },
    };
  }
}
