import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (
    process.env.ADMIN_SEED_EMAIL || "admin@naplin.local"
  ).toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD || "changeme-naplin";

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  let adminPasswordPrinted: string | null = null;
  if (existing) {
    console.log("Seed: admin já existe:", email);
  } else {
    const passwordHash = bcrypt.hashSync(password, 12);
    await prisma.adminUser.create({
      data: { email, passwordHash },
    });
    adminPasswordPrinted = password;
    console.log("Seed: administrador criado", email);
    console.log("     palavra-passe (altere em produção):", password);
  }

  const demoNoPinCode = (
    process.env.PARTICIPANT_SEED_CODE_NO_PIN || "DEMO00"
  ).toUpperCase();
  const demoPinCode = (
    process.env.PARTICIPANT_SEED_CODE || "DEMO01"
  ).toUpperCase();
  const demoPin = process.env.PARTICIPANT_SEED_PIN || "1234";
  const magicNoPin = process.env.PARTICIPANT_SEED_MAGIC_TOKEN_NO_PIN || "local-dev-magic-demo00";
  const magicPin = process.env.PARTICIPANT_SEED_MAGIC_TOKEN || "local-dev-magic-demo01";

  if (!(await prisma.participant.findUnique({ where: { code: demoNoPinCode } }))) {
    await prisma.participant.create({
      data: {
        code: demoNoPinCode,
        name: null,
        accessToken: magicNoPin,
        pinHash: null,
      },
    });
    console.log("Seed: participante sem PIN criado — código:", demoNoPinCode);
  } else {
    console.log("Seed: participante sem PIN já existe — código:", demoNoPinCode);
  }

  if (!(await prisma.participant.findUnique({ where: { code: demoPinCode } }))) {
    await prisma.participant.create({
      data: {
        code: demoPinCode,
        name: null,
        accessToken: magicPin,
        pinHash: bcrypt.hashSync(demoPin, 12),
      },
    });
    console.log("Seed: participante com PIN criado — código:", demoPinCode);
  } else {
    console.log("Seed: participante com PIN já existe — código:", demoPinCode);
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3030";

  console.log("");
  console.log("── Contas de teste (local) ──");
  console.log("Admin:      ", `${baseUrl}/admin/login`);
  console.log("            email:", email);
  if (adminPasswordPrinted) {
    console.log("            password:", adminPasswordPrinted);
  } else {
    console.log(
      "            password: (conta já existia — use a palavra-passe actual)"
    );
  }
  console.log("Participante (sem PIN):", `${baseUrl}/entrar`);
  console.log("            código:", demoNoPinCode, "(deixe o PIN vazio)");
  console.log("            ou link:", `${baseUrl}/p/${magicNoPin}`);
  console.log("Participante (com PIN):", `${baseUrl}/entrar`);
  console.log("            código:", demoPinCode, "  PIN:", demoPin);
  console.log("            ou link:", `${baseUrl}/p/${magicPin}`, "(pede PIN)");
  console.log("─────────────────────────────");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
