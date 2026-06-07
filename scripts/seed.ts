import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding RYZENPANEL database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin@@@@";
  const adminUsername = process.env.ADMIN_USERNAME || "admin";

  const password = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password, role: "ADMIN", emailVerified: true },
    create: {
      email: adminEmail,
      username: adminUsername,
      password,
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log(`  ✓ Admin user: ${admin.email} / ${adminPassword}`);

  const plans = [
    { name: "FREE" as const, ram: 1024, cpu: 100, disk: 5120, backups: 1, databases: 1, price: 0 },
    { name: "STARTER" as const, ram: 4096, cpu: 200, disk: 20480, backups: 3, databases: 2, price: 4.99 },
    { name: "PRO" as const, ram: 16384, cpu: 400, disk: 51200, backups: 10, databases: 5, price: 14.99 },
    { name: "ENTERPRISE" as const, ram: 65536, cpu: 800, disk: 204800, backups: 50, databases: 20, price: 49.99 },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({ where: { name: plan.name }, update: plan, create: plan });
  }
  console.log(`  ✓ ${plans.length} plans created`);

  const nest = await prisma.nest.upsert({
    where: { id: "minecraft-nest" },
    update: { name: "Minecraft", description: "Minecraft server software" },
    create: { id: "minecraft-nest", name: "Minecraft", description: "Minecraft server software" },
  });

  const eggs = [
    { id: "egg-paper", name: "Paper", description: "High performance Spigot fork", dockerImage: "itzg/minecraft-server:latest", startup: "" },
    { id: "egg-purpur", name: "Purpur", description: "Optimized with extra features", dockerImage: "itzg/minecraft-server:latest", startup: "" },
    { id: "egg-spigot", name: "Spigot", description: "Most widely used server software", dockerImage: "itzg/minecraft-server:latest", startup: "" },
    { id: "egg-vanilla", name: "Vanilla", description: "Official Minecraft server", dockerImage: "itzg/minecraft-server:latest", startup: "" },
    { id: "egg-fabric", name: "Fabric", description: "Lightweight mod loader", dockerImage: "itzg/minecraft-server:latest", startup: "" },
    { id: "egg-forge", name: "Forge", description: "Popular modding platform", dockerImage: "itzg/minecraft-server:latest", startup: "" },
    { id: "egg-neoforge", name: "NeoForge", description: "Next-gen Forge fork", dockerImage: "itzg/minecraft-server:latest", startup: "" },
    { id: "egg-velocity", name: "Velocity", description: "Modern proxy server", dockerImage: "itzg/velocity:latest", startup: "" },
    { id: "egg-waterfall", name: "Waterfall", description: "BungeeCord fork", dockerImage: "itzg/waterfall:latest", startup: "" },
    { id: "egg-bungeecord", name: "BungeeCord", description: "Network proxy", dockerImage: "itzg/bungeecord:latest", startup: "" },
  ];

  for (const egg of eggs) {
    await prisma.egg.upsert({
      where: { id: egg.id },
      update: { ...egg, nestId: nest.id },
      create: { ...egg, nestId: nest.id },
    });
  }
  console.log(`  ✓ ${eggs.length} eggs created (itzg images)`);

  await prisma.coupon.upsert({
    where: { code: "LAUNCH2024" },
    update: {},
    create: { code: "LAUNCH2024", discount: 20, maxUses: 100, isActive: true },
  });
  console.log("  ✓ Coupon: LAUNCH2024 (20% off)");

  const defaultPermissions = [
    { key: "manage_servers", name: "Manage Servers", desc: "Edit, suspend, delete any server" },
    { key: "manage_users", name: "Manage Users", desc: "View and edit user accounts" },
    { key: "manage_nodes", name: "Manage Nodes", desc: "Add/edit/remove daemon nodes" },
    { key: "manage_allocations", name: "Manage Allocations", desc: "Manage IP/port allocations" },
    { key: "manage_tickets", name: "Manage Tickets", desc: "View and reply to all tickets" },
    { key: "manage_announcements", name: "Manage Announcements", desc: "Create/edit announcements" },
    { key: "manage_settings", name: "Manage Settings", desc: "Change panel branding settings" },
    { key: "manage_toggles", name: "Manage Toggles", desc: "Enable/disable features" },
    { key: "manage_credits", name: "Manage Credits", desc: "Give/remove user credits" },
    { key: "manage_roles", name: "Manage Roles", desc: "Edit role permissions" },
    { key: "manage_invoices", name: "Manage Invoices", desc: "View and manage billing" },
    { key: "manage_backups", name: "Manage Backups", desc: "Manage server backups" },
    { key: "view_activity", name: "View Activity", desc: "View audit and activity logs" },
  ];

  const rolePermMap: Record<string, string[]> = {
    ADMIN: defaultPermissions.map(p => p.key),
    MODERATOR: ["manage_servers", "manage_tickets", "manage_announcements", "view_activity"],
    USER: [],
  };

  for (const perm of defaultPermissions) {
    const existing = await prisma.permission.upsert({
      where: { key: perm.key },
      update: { name: perm.name, description: perm.desc },
      create: { key: perm.key, name: perm.name, description: perm.desc },
    });
    for (const [role, keys] of Object.entries(rolePermMap)) {
      const allowed = keys.includes(perm.key);
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: role as any, permissionId: existing.id } },
        update: { allowed },
        create: { role: role as any, permissionId: existing.id, allowed },
      });
    }
  }
  console.log(`  ✓ ${defaultPermissions.length} permissions seeded`);

  console.log("\n✅ Database seeded!");
  console.log(`   Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`   (Customize via ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME env vars)`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());