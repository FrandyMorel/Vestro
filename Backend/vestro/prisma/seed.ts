import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de planes para CardNet...");

  // Limpiar planes existentes (opcional)
  await prisma.plan.deleteMany();
  console.log("✓ Planes anteriores eliminados");

  // Crear planes
  const freePlan = await prisma.plan.create({
    data: {
      plan_name: "Free",
      price_monthly: 0,
      price_yearly: 0,
      max_users: 1,
      has_reports: false,
      has_ai: false,
      has_exports: false,
      cardnet_product_id: null, // Free no necesita CardNet
    },
  });

  const proPlan = await prisma.plan.create({
    data: {
      plan_name: "Pro",
      price_monthly: 9.99,
      price_yearly: 99.99,
      max_users: 2,
      has_reports: true,
      has_ai: false,
      has_exports: false,
      cardnet_product_id: "PRO_PLAN_001", // ID del producto en CardNet
    },
  });

  const premiumPlan = await prisma.plan.create({
    data: {
      plan_name: "Premium",
      price_monthly: 29.99,
      price_yearly: 299.99,
      max_users: 5,
      has_reports: true,
      has_ai: true,
      has_exports: true,
      cardnet_product_id: "PREMIUM_PLAN_001", // ID del producto en CardNet
    },
  });

  console.log("✓ Planes creados:");
  console.log("  - Free:", freePlan);
  console.log("  - Pro:", proPlan);
  console.log("  - Premium:", premiumPlan);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
