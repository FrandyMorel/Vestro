"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Iniciando seed de planes para Vestro...");
    await prisma.plan.deleteMany();
    console.log("✓ Planes anteriores eliminados");
    const freePlan = await prisma.plan.create({
        data: {
            plan_name: "Free",
            description: "Plan gratuito con funciones básicas. 1 usuario (ADMIN)",
            price_monthly: 0,
            price_yearly: 0,
            max_users: 1,
            has_reports: false,
            has_ai: false,
            has_exports: false,
            cardnet_product_id: null,
        },
    });
    const proPlan = await prisma.plan.create({
        data: {
            plan_name: "Pro",
            description: "Plan profesional con reportes. Hasta 2 usuarios (1 ADMIN + 1 EMPLOYEE)",
            price_monthly: 9.99,
            price_yearly: 99.99,
            max_users: 2,
            has_reports: true,
            has_ai: false,
            has_exports: false,
            cardnet_product_id: "PRO_PLAN_001",
        },
    });
    const premiumPlan = await prisma.plan.create({
        data: {
            plan_name: "Premium",
            description: "Plan premium con IA, reportes y exportaciones. Hasta 4 usuarios (1 ADMIN + 3 EMPLOYEE)",
            price_monthly: 29.99,
            price_yearly: 299.99,
            max_users: 4,
            has_reports: true,
            has_ai: true,
            has_exports: true,
            cardnet_product_id: "PREMIUM_PLAN_001",
        },
    });
    console.log("✓ Planes creados exitosamente:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📦 FREE:");
    console.log(`  • ID: ${freePlan.plan_id}`);
    console.log(`  • Usuarios: ${freePlan.max_users}`);
    console.log(`  • Reportes: ${freePlan.has_reports ? "✅" : "❌"}`);
    console.log(`  • IA: ${freePlan.has_ai ? "✅" : "❌"}`);
    console.log(`  • Exportaciones: ${freePlan.has_exports ? "✅" : "❌"}`);
    console.log();
    console.log("💼 PRO:");
    console.log(`  • ID: ${proPlan.plan_id}`);
    console.log(`  • Usuarios: ${proPlan.max_users}`);
    console.log(`  • Reportes: ${proPlan.has_reports ? "✅" : "❌"}`);
    console.log(`  • IA: ${proPlan.has_ai ? "✅" : "❌"}`);
    console.log(`  • Exportaciones: ${proPlan.has_exports ? "✅" : "❌"}`);
    console.log(`  • Precio: $${proPlan.price_monthly}/mes o $${proPlan.price_yearly}/año`);
    console.log();
    console.log("👑 PREMIUM:");
    console.log(`  • ID: ${premiumPlan.plan_id}`);
    console.log(`  • Usuarios: ${premiumPlan.max_users}`);
    console.log(`  • Reportes: ${premiumPlan.has_reports ? "✅" : "❌"}`);
    console.log(`  • IA: ${premiumPlan.has_ai ? "✅" : "❌"}`);
    console.log(`  • Exportaciones: ${premiumPlan.has_exports ? "✅" : "❌"}`);
    console.log(`  • Precio: $${premiumPlan.price_monthly}/mes o $${premiumPlan.price_yearly}/año`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}
main()
    .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map