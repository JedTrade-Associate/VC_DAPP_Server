import {
  Controller,
  Get,
  Put,
  Res,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import * as log4js from 'log4js';

import { CryptoService } from './crypto.service';

const logger = log4js.getLogger('cheese');

@ApiTags('Crypto')
@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) { }

  @Get('/isCryptoKeyDecrypted')
  @ApiOperation({
    summary: `Check if Crypto Key is decrypted`,
    description: `It will check if the Crypto Key is decrypted.`
  })
  @ApiOkResponse({ description: 'Is crypto key decrypted?' })
  isCryptoKeyDecrypted() {
    logger.trace(`crypto.controller: isCryptoKeyDecrypted: Start`);
    var isCryptoKeyDecrypted = this.cryptoService.isCryptoKeyDecrypted();
    logger.trace(`crypto.controller: isCryptoKeyDecrypted: ${isCryptoKeyDecrypted}`);
    return isCryptoKeyDecrypted;
  }
  
  @Put('/decrypt/:password')
  @ApiParam({
    name: "password",
    type: "String",
    description: "Password of the RSA Private Key",
    required: true
  })
  @ApiOperation({
    summary: 'Decrypt Crypto Key',
    description: 'It will decrypt the Crypto Key.',
  })
  @ApiOkResponse({ description: 'Crypto Key decrypted.' })
  @ApiBadRequestResponse({ description: 'Bad Request: Possible cause: Incorrect password.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Probable cause: invalid bearer token or not presented.',
  })
  async decryptCryptoKey(@Res() res, @Param('password') password: string) {
    logger.trace(`crypto.controller: decrypt: Start`);
    try {
      const success = await this.cryptoService.decryptCryptoKey(password);
      logger.trace(`crypto.controller: decrypt: ${success}`);
      return res.status(200).send(success);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
