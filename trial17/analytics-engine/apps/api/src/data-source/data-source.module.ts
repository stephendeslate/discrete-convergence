import { Module } from '@nestjs/common';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.service';

@Module({
  controllers: [DataSourceController],
  providers: [DataSourceService, PrismaService],
})
export class DataSourceModule {}
