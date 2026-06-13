import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";

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

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  /**
   * OBTENER suscripción de la empresa del usuario
   */
  async findMySubscription(compId: number): Promise<SubscriptionResponse> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { comp_id: compId },
    });

    if (!subscription) {
      throw new NotFoundException("Suscripción no encontrada");
    }

    return subscription as unknown as SubscriptionResponse;
  }

  /**
   * OBTENER suscripción por ID
   * Solo SUPER_ADMIN o ADMIN de la empresa
   */
  async findOne(
    subsId: number,
    userCompId: number,
    userRole: string,
  ): Promise<SubscriptionResponse> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { subs_id: subsId },
    });

    if (!subscription) {
      throw new NotFoundException("Suscripción no encontrada");
    }

    // Validar acceso
    if (userRole !== "SUPER_ADMIN" && subscription.comp_id !== userCompId) {
      throw new UnauthorizedException(
        "No tienes permiso para ver esta suscripción",
      );
    }

    return subscription as unknown as SubscriptionResponse;
  }

  /**
   * OBTENER suscripción por empresa
   */
  async findByCompany(compId: number): Promise<SubscriptionResponse> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { comp_id: compId },
    });

    if (!subscription) {
      throw new NotFoundException("Suscripción no encontrada");
    }

    return subscription as unknown as SubscriptionResponse;
  }

  /**
   * ACTUALIZAR suscripción (cambiar plan, estado, etc)
   * Solo SUPER_ADMIN o ADMIN de la empresa
   */
  async update(
    subsId: number,
    updateSubscriptionDto: UpdateSubscriptionDto,
    userCompId: number,
    userRole: string,
  ): Promise<SubscriptionResponse> {
    // Obtener suscripción actual
    const subscription = await this.prisma.subscription.findUnique({
      where: { subs_id: subsId },
    });

    if (!subscription) {
      throw new NotFoundException("Suscripción no encontrada");
    }

    // Validar acceso
    if (userRole !== "SUPER_ADMIN" && subscription.comp_id !== userCompId) {
      throw new UnauthorizedException(
        "No tienes permiso para editar esta suscripción",
      );
    }

    // Si intenta cambiar plan, validar que existe
    if (updateSubscriptionDto.plan_id) {
      const planExists = await this.prisma.plan.findUnique({
        where: { plan_id: updateSubscriptionDto.plan_id },
      });

      if (!planExists) {
        throw new BadRequestException("El plan no existe");
      }
    }

    // Actualizar
    const updatedSubscription = await this.prisma.subscription.update({
      where: { subs_id: subsId },
      data: updateSubscriptionDto,
    });

    return updatedSubscription as unknown as SubscriptionResponse;
  }

  /**
   * OBTENER todas las suscripciones (solo SUPER_ADMIN)
   */
  async findAll(userRole: string): Promise<SubscriptionResponse[]> {
    if (userRole !== "SUPER_ADMIN") {
      throw new UnauthorizedException(
        "Solo super administradores pueden listar todas las suscripciones",
      );
    }

    const subscriptions = await this.prisma.subscription.findMany();

    return subscriptions as unknown as SubscriptionResponse[];
  }

  /**
   * ACTIVAR suscripción (cuando se paga con CardNet)
   * Interno - usado por el módulo de pagos
   */
  async activateSubscription(
    subsId: number,
    cardnetCustomerId: string,
    cardnetTransactionId: string,
  ): Promise<SubscriptionResponse> {
    const subscription = await this.prisma.subscription.update({
      where: { subs_id: subsId },
      data: {
        subs_status: "active",
        cardnet_customer_id: cardnetCustomerId,
        cardnet_transaction_id: cardnetTransactionId,
        start_date: new Date(),
      },
    });

    return subscription as unknown as SubscriptionResponse;
  }

  /**
   * CANCELAR suscripción
   */
  async cancelSubscription(
    subsId: number,
    userCompId: number,
    userRole: string,
  ): Promise<{ message: string }> {
    // Obtener suscripción
    const subscription = await this.prisma.subscription.findUnique({
      where: { subs_id: subsId },
    });

    if (!subscription) {
      throw new NotFoundException("Suscripción no encontrada");
    }

    // Validar acceso
    if (userRole !== "SUPER_ADMIN" && subscription.comp_id !== userCompId) {
      throw new UnauthorizedException(
        "No tienes permiso para cancelar esta suscripción",
      );
    }

    // Cancelar
    await this.prisma.subscription.update({
      where: { subs_id: subsId },
      data: {
        subs_status: "cancelled",
        end_date: new Date(),
      },
    });

    return { message: "Suscripción cancelada exitosamente" };
  }
}
