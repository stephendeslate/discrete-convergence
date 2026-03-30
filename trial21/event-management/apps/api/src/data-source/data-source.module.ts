import { Module } from '@nestjs/common';
import { DataSourceController } from './data-source.controller';

@Module({
  controllers: [DataSourceController],
})
export class DataSourceModule {}
