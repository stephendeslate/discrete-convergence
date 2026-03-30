// TRACED:EM-DATA-001 TRACED:EM-DATA-003
import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@repo/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tenantId = 'seed-tenant-001';
  const passwordHash = await bcryptjs.hash('password123', BCRYPT_SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
      tenantId,
    },
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
