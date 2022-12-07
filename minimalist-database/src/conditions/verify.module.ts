import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VerifyController } from './verify.controller';
import { VerifyService } from './verify.service';
import { conditions, verifySchema } from './schemas/conditions.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: conditions.name, schema: verifySchema }])],
    controllers: [VerifyController],
    providers: [VerifyService],
    exports: [VerifyService],
})
export class VerifyModule { }