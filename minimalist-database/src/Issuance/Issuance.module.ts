import { Module } from '@nestjs/common';

import { IssuanceController } from './Issuance.controller';
import { IssuanceService } from './Issuance.service';

@Module({
    controllers: [IssuanceController],
    providers: [IssuanceService],
    exports: [IssuanceService],
})
export class IssuanceoModule { }