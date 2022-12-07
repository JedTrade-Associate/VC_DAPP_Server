import { Controller, Get, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiServiceUnavailableResponse } from '@nestjs/swagger';
import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import * as log4js from 'log4js';

import { AppService } from './app.service';
import { GlobalService } from './global.service';

const logger = log4js.getLogger(`cheese`);

@ApiTags(`Health`)
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,    
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
  ) {}

  @Get(`/`)
  @ApiOperation({
      summary: `Server Health Check`,
      description: `It will check the health of the server by getting the application version number and checking if the crypto key has been decrypted.`
  })
  @ApiOkResponse({ description: `Health check is okay.` })
  @ApiServiceUnavailableResponse({ description: `Service unavailable. Health check is not okay` })
  async healthCheck() {
    logger.trace(`app.controller: Start`);
    var appVersion = this.appService.getAppVersion();
    logger.trace(`app.controller: appVersion: ${appVersion}`);
    var mongodb = await this.health.check([async () => this.mongoose.pingCheck(`mongoose`)]);
    logger.trace(`app.controller: mongodb: ${mongodb.status}`);
    if (mongodb.status != `ok`) throw new ServiceUnavailableException({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: `MongoDB is not available`
    });
    var isCryptoKeyDecrypted = GlobalService.isCryptoKeyDecrypted;
    logger.trace(`app.controller: isCryptoKeyDecrypted: ${isCryptoKeyDecrypted}`);
    if (!isCryptoKeyDecrypted) throw new ServiceUnavailableException({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: `Crypto Key is not decrypted`
    });
    return { appVersion, mongodb, isCryptoKeyDecrypted };
  }
}
