import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
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
  stripe_product_id: string | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  /**
   * CREAR plan
   * Solo SUPER_ADMIN puede hacerlo
   */
  async create(
    createPlanDto: CreatePlanDto,
    userRole: string,
  ): Promise<PlanResponse> {
    // 1. Validar que quien hace la petición es SUPER_ADMIN
    if (userRole !== "SUPER_ADMIN") {
      throw new UnauthorizedException(
        "Solo super administradores pueden crear planes",
      );
    }

    // 2. Validar que no exista un plan con ese nombre
    const existingPlan = await this.prisma.plan.findFirst({
      where: { plan_name: createPlanDto.plan_name },
    });

    if (existingPlan) {
      throw new BadRequestException("El plan ya existe");
    }

    // 3. Crear plan
    const plan = await this.prisma.plan.create({
      data: {
        plan_name: createPlanDto.plan_name,
        price_monthly: createPlanDto.price_monthly,
        price_yearly: createPlanDto.price_yearly,
        max_users: createPlanDto.max_users,
        has_reports: createPlanDto.has_reports,
        has_ai: createPlanDto.has_ai,
        has_exports: createPlanDto.has_exports,
        stripe_product_id: createPlanDto.stripe_product_id || null,
      },
    });

    return plan;
  }

  /**
   * LISTAR todos los planes
   */
  async findAll(): Promise<PlanResponse[]> {
    return this.prisma.plan.findMany();
  }

  /**
   * OBTENER plan por ID
   */
  async findOne(planId: number): Promise<PlanResponse> {
    const plan = await this.prisma.plan.findUnique({
      where: { plan_id: planId },
    });

    if (!plan) {
      throw new NotFoundException("Plan no encontrado");
    }

    return plan;
  }

  /**
   * ACTUALIZAR plan
   * Solo SUPER_ADMIN puede hacerlo
   */
  async update(
    planId: number,
    updatePlanDto: UpdatePlanDto,
    userRole: string,
  ): Promise<PlanResponse> {
    // 1. Validar que quien hace la petición es SUPER_ADMIN
    if (userRole !== "SUPER_ADMIN") {
      throw new UnauthorizedException(
        "Solo super administradores pueden editar planes",
      );
    }

    // 2. Verificar que el plan existe
    const existingPlan = await this.prisma.plan.findUnique({
      where: { plan_id: planId },
    });

    if (!existingPlan) {
      throw new NotFoundException("Plan no encontrado");
    }

    // 3. Si se intenta cambiar el nombre, validar que no exista otro con ese nombre
    if (
      updatePlanDto.plan_name &&
      updatePlanDto.plan_name !== existingPlan.plan_name
    ) {
      const planExists = await this.prisma.plan.findFirst({
        where: { plan_name: updatePlanDto.plan_name },
      });

      if (planExists) {
        throw new BadRequestException("El nombre del plan ya existe");
      }
    }

    // 4. Actualizar plan
    const updatedPlan = await this.prisma.plan.update({
      where: { plan_id: planId },
      data: updatePlanDto,
    });

    return updatedPlan;
  }

  /**
   * ELIMINAR plan
   * Solo SUPER_ADMIN puede hacerlo
   */
  async remove(planId: number, userRole: string): Promise<{ message: string }> {
    // 1. Validar que quien hace la petición es SUPER_ADMIN
    if (userRole !== "SUPER_ADMIN") {
      throw new UnauthorizedException(
        "Solo super administradores pueden eliminar planes",
      );
    }

    // 2. Verificar que el plan existe
    const plan = await this.prisma.plan.findUnique({
      where: { plan_id: planId },
    });

    if (!plan) {
      throw new NotFoundException("Plan no encontrado");
    }

    // 3. Validar que no hay suscripciones activas con este plan
    const activeSubscriptions = await this.prisma.subscription.count({
      where: { plan_id: planId },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException(
        "No puedes eliminar un plan que tiene suscripciones activas",
      );
    }

    // 4. Eliminar plan
    await this.prisma.plan.delete({
      where: { plan_id: planId },
    });

    return { message: "Plan eliminado exitosamente" };
  }
}
