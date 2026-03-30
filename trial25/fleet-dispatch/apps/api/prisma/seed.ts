import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@repo/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tenantId = 'tenant-seed-001';
  const passwordHash = await bcryptjs.hash('password123', BCRYPT_SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: 'admin@fleet-dispatch.local' },
    update: {},
    create: {
      email: 'admin@fleet-dispatch.local',
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
