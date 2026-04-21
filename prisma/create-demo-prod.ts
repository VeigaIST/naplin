/**
 * One-off: create dedicated demo admin + participant in the DB pointed to by DATABASE_URL.
 * Run against production: pull env, then `npx tsx prisma/create-demo-prod.ts`
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

const DEMO_ADMIN_EMAIL = "demo.admin@naplin.local";
const DEMO_PARTICIPANT_CODE = "DEMOUX";

async function main() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://naplin.vercel.app";

  let adminPassword: string | null = null;
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: DEMO_ADMIN_EMAIL },
  });
  if (!existingAdmin) {
    adminPassword = randomBytes(18).toString("base64url");
    await prisma.adminUser.create({
      data: {
        email: DEMO_ADMIN_EMAIL,
        passwordHash: bcrypt.hashSync(adminPassword, 12),
      },
    });
    console.log("Created demo admin.");
  } else {
    console.log("Demo admin already exists (password unchanged):", DEMO_ADMIN_EMAIL);
  }

  let magicToken: string | null = null;
  const existingP = await prisma.participant.findUnique({
    where: { code: DEMO_PARTICIPANT_CODE },
  });
  if (!existingP) {
    magicToken = randomBytes(24).toString("base64url");
    await prisma.participant.create({
      data: {
        code: DEMO_PARTICIPANT_CODE,
        name: "Demo User",
        accessToken: magicToken,
        pinHash: null,
      },
    });
    console.log("Created demo participant.");
  } else {
    magicToken = existingP.accessToken;
    console.log("Demo participant already exists:", DEMO_PARTICIPANT_CODE);
  }

  console.log("");
  console.log("── Demo accounts ──");
  console.log("Admin UI:     ", `${baseUrl}/admin/login`);
  console.log("  email:      ", DEMO_ADMIN_EMAIL);
  if (adminPassword) {
    console.log("  password:   ", adminPassword);
  } else {
    console.log("  password:   (unchanged — set a new one via DB or recreate user)");
  }
  console.log("");
  console.log("Participant:  ", `${baseUrl}/entrar`);
  console.log("  code:       ", DEMO_PARTICIPANT_CODE, "(leave PIN empty)");
  console.log("  magic link: ", `${baseUrl}/p/${magicToken}`);
  console.log("──────────────────");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
