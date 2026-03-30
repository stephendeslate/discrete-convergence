import { Module } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { WidgetController } from './widget.controller';
import { PrismaService } from '../infra/prisma.service';

@Module({
  controllers: [WidgetController],
  providers: [WidgetService, PrismaService],
})
export class WidgetModule {}
