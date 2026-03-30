// TRACED:WIDGET-MOD — Widget module
import { Module } from '@nestjs/common';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';

/**
 * TRACED:AE-WID-MOD-001 — Widget module
 */
@Module({
  controllers: [WidgetController],
  providers: [WidgetService],
  exports: [WidgetService],
})
export class WidgetModule {}
