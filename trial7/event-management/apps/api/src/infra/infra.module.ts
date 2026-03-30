import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PinoLoggerService } from './pino-logger.service';

@Global()
@Module({
  providers: [PrismaService, PinoLoggerService],
  exports: [PrismaService, PinoLoggerService],
})
export class InfraModule {}
