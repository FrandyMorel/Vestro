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
import { CreatePlanDto } from "./dto/create-plan.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

// Interface local
interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
  compId: number | null;
}

interface PlanResponse {
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

@Controller("plans")
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private planService: PlanService) {}

  /**
   * POST /plans
   * Crear nuevo plan
   * Solo SUPER_ADMIN
   */
  @Post()
  async create(
    @Body() createPlanDto: CreatePlanDto,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<PlanResponse> {
    return this.planService.create(createPlanDto, req.user.role);
  }

  /**
   * GET /plans
   * Listar todos los planes
   */
  @Get()
  async findAll(): Promise<PlanResponse[]> {
    return this.planService.findAll();
  }

  /**
   * GET /plans/:id
   * Obtener un plan específico
   */
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<PlanResponse> {
    return this.planService.findOne(id);
  }

  /**
   * PUT /plans/:id
   * Actualizar plan
   * Solo SUPER_ADMIN
   */
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePlanDto: UpdatePlanDto,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<PlanResponse> {
    return this.planService.update(id, updatePlanDto, req.user.role);
  }

  /**
   * DELETE /plans/:id
   * Eliminar plan
   * Solo SUPER_ADMIN
   */
  @Delete(":id")
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<{ message: string }> {
    return this.planService.remove(id, req.user.role);
  }
}
