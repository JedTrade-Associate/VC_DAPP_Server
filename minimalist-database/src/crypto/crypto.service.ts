import { Injectable, HttpStatus } from '@nestjs/common';
import * as log4js from 'log4js';
import * as fs from 'fs';
import * as crypto from 'crypto';

import { GlobalService } from '../global.service';

const logger = log4js.getLogger('cheese');

@Injectable()
export class CryptoService {
  isCryptoKeyDecrypted(): boolean {
    logger.info(`crypto.service: isCryptoKeyDecrypted: GlobalService.isCryptoKeyDecrypted: ${GlobalService.isCryptoKeyDecrypted}`);
    return GlobalService.isCryptoKeyDecrypted;
  }
  
  decryptCryptoKey(password): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let privateKey;
      try {
        privateKey = fs.readFileSync(process.env.CRYPTO_KEY_RSA_PRIVATE_KEY_PATH, 'utf8');
      } catch (error) {
        var errorMsg = `Private Key file not found at ${process.env.CRYPTO_KEY_RSA_PRIVATE_KEY_PATH}!`;
        logger.error(`crypto.service: decryptCryptoKey: Error 1: ${errorMsg}`);
        reject({ status: HttpStatus.BAD_REQUEST, message: errorMsg });
      }
      const bufferData = Buffer.from(process.env.CRYPTO_KEY, 'hex');
      try {
        const decryptedData = crypto.privateDecrypt(
          {
            key: privateKey.toString(),
            passphrase: password,
          },
          bufferData,
        );
        GlobalService.cryptoKey = decryptedData.toString('hex');
        GlobalService.isCryptoKeyDecrypted = true;
        resolve(true);
      } catch (error) {
        let errorNum;
        let errorMsg;
        switch (error.reason) {
          case 'oaep decoding error':
            errorNum = 2;
            errorMsg = `Private Key file and Encrypted Crypto Key does not match!`;
          case 'bad decrypt':
            errorNum = 3;
            errorMsg = `Failed to unlock Private Key file, incorrect password provided!`;
            break;
          default:
            errorNum = 4;
            errorMsg = `Unexpected Error: ${error}`;
        }
        logger.error(`crypto.service: decryptCryptoKey: Error ${errorNum}: ${errorMsg}`);
        reject({ status: HttpStatus.BAD_REQUEST, message: errorMsg });
      }
    });
  };
}
