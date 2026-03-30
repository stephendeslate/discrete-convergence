import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [RegistrationService, PrismaService],
  controllers: [RegistrationController],
  exports: [RegistrationService],
})
export class RegistrationModule {}
