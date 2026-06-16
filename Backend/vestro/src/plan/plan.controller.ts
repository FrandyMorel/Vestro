import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from "@nestjs/common";
import { PlanService } from "./plan.service";
import { PermissionService } from "../permissions/permissions.service";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";

// Interface local
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

@Controller("plans")
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(
    private planService: PlanService,
    private permissionService: PermissionService,
  ) {}

  /**
   * POST /plans
   * Crear nuevo plan
   * Solo SUPER_ADMIN
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN")
  async create(
    @Body() createPlanDto: CreatePlanDto,
    @Request() req: { user: IAuthenticatedUser },
  ): Promise<IPlanResponse> {
    return this.planService.create(createPlanDto, req.user.role);
  }

  /**
   * GET /plans
   * Listar todos los planes
   */
  @Get()
  async findAll(): Promise<IPlanResponse[]> {
    return this.planService.findAll();
  }

  /**
   * GET /plans/features
   * Obtener las features disponibles de MI plan
   * Responde qué features tiene tu suscripción actual
   */
  @Get("features")
  async getMyFeatures(
    @Request() req: { user: IAuthenticatedUser },
  ): Promise<IAvailableFeatures> {
    return this.permissionService.getAvailableFeatures(req.user.compId || 0);
  }

  /**
   * GET /plans/:id
   * Obtener un plan específico
   */
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<IPlanResponse> {
    return this.planService.findOne(id);
  }

  /**
   * PUT /plans/:id
   * Actualizar plan
   * Solo SUPER_ADMIN
   */
  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePlanDto: UpdatePlanDto,
    @Request() req: { user: IAuthenticatedUser },
  ): Promise<IPlanResponse> {
    return this.planService.update(id, updatePlanDto, req.user.role);
  }

  /**
   * DELETE /plans/:id
   * Eliminar plan
   * Solo SUPER_ADMIN
   */
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN")
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: IAuthenticatedUser },
  ): Promise<{ message: string }> {
    return this.planService.remove(id, req.user.role);
  }
}
