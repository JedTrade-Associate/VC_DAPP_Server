import { Injectable } from '@nestjs/common';
import * as log4js from 'log4js';

const logger = log4js.getLogger(`cheese`);

@Injectable()
export class AppService {
  getAppVersion(): string {
    logger.info(`app.service: getAppVersion: process.env.API_VERSION: ${process.env.API_VERSION}`);
    return process.env.API_VERSION;
  }
}
