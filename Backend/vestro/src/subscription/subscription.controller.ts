import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

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
  cardnet_subscription_id: string | null;
  created_at: Date;
  updated_at: Date;
  plan_id: number;
  comp_id: number | null;
}

@Controller("subscriptions")
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  /**
   * GET /subscriptions/me
   * Obtener mi suscripción
   */
  @Get("me")
  async findMySubscription(
    @Request() req: { user: AuthenticatedUser },
  ): Promise<SubscriptionResponse> {
    return await this.subscriptionService.findMySubscription(
      req.user.compId || 0,
    );
  }

  /**
   * GET /subscriptions
   * Listar todas las suscripciones (solo SUPER_ADMIN)
   */
  @Get("all")
  async findAll(
    @Request() req: { user: AuthenticatedUser },
  ): Promise<SubscriptionResponse[]> {
    return await this.subscriptionService.findAll(req.user.role);
  }

  /**
   * GET /subscriptions/:id
   * Obtener suscripción específica
   */
  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<SubscriptionResponse> {
    return await this.subscriptionService.findOne(
      id,
      req.user.compId || 0,
      req.user.role,
    );
  }

  /**
   * PUT /subscriptions/:id
   * Actualizar suscripción
   */
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<SubscriptionResponse> {
    return await this.subscriptionService.update(
      id,
      updateSubscriptionDto,
      req.user.compId || 0,
      req.user.role,
    );
  }

  /**
   * DELETE /subscriptions/:id
   * Cancelar suscripción
   */
  @Delete(":id")
  async cancel(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<{ message: string }> {
    return await this.subscriptionService.cancelSubscription(
      id,
      req.user.compId || 0,
      req.user.role,
    );
  }
}
