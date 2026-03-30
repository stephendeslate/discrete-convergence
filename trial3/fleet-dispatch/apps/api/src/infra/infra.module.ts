import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import pino from 'pino';
import { RequestContextService } from '../common/request-context.service';

const pinoLogger = pino({ level: 'info' });

@Global()
@Module({
  providers: [
    PrismaService,
    RequestContextService,
    {
      provide: 'PINO_LOGGER',
      useValue: pinoLogger,
    },
  ],
  exports: [PrismaService, RequestContextService, 'PINO_LOGGER'],
})
export class InfraModule {}
