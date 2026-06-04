import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ryzenpanel.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin@@@@";
  const adminUsername = process.env.ADMIN_USERNAME || "admin";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`[SEED] Admin user already exists: ${adminEmail}`);
    return;
  }

  const password = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      email: adminEmail,
      username: adminUsername,
      password,
      role: "ADMIN",
      emailVerified: true,
    },
  });

  console.log(`[SEED] Admin user created: ${adminEmail} / ${adminPassword}`);

  const existingNest = await prisma.nest.findFirst();
  if (!existingNest) {
    const nest = await prisma.nest.create({
      data: { name: "Minecraft", description: "Minecraft server software" },
    });
    await prisma.egg.create({
      data: {
        nestId: nest.id, name: "Paper", description: "Paper Minecraft server",
        dockerImage: "itzg/minecraft-server:latest", startup: "",
      },
    });
    await prisma.egg.create({
      data: {
        nestId: nest.id, name: "Vanilla", description: "Vanilla Minecraft server",
        dockerImage: "itzg/minecraft-server:latest", startup: "",
      },
    });
    console.log("[SEED] Default eggs created");
  }

  console.log("[SEED] Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
