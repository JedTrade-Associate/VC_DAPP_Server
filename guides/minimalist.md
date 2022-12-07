# About

This guide will provide the steps required to utilize the below functionalities in the NestJS API Server. It comes with the necessary code snippets to aid in understanding. In addition, there are detailed steps on how to [reproduce this NestJS Server from scratch](#setup-from-scratch).

1. ENV usage
2. Swagger Open API Framework
3. Task Scheduler
4. Log4JS logs
5. Key Management System

# Usage

## New Set of APIs

For each set of APIs, it will require a set of `module`, `controller`, and `service` files in its folder.

The `module` file bundles the controllers and providers together. If the controller requires the usage of other service files, the relevant module will be imported here.

The `controller` file will contain all the routes.

The `service` file will include methods that will perform a certain operation. The methods available will usually be called in the `controller` file.

The standard RESTful API HTTP methods are supported, which include `POST`, `PUT`, `PATCH`, `GET`, `DELETE`, `OPTIONS`, `HEAD`, and `ALL`.

<details>
  <summary>Click here to see the Methods Table</summary><br>

| Method  | Responses                                                             | Description                                                       |
| :-----: | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
|  POST   | 201 (Created), 404 (Not Found), 409 (Conflict)                        | Create a new resource                                             |
|   PUT   | 200 (Ok), 204 (No Content), 404 (Not Found), 405 (Method Not Allowed) | Update or Replace an existing resource                            |
|  PATCH  | 200 (Ok), 204 (No Content), 404 (Not Found), 405 (Method Not Allowed) | Update or Modify an existing resource partially                   |
|   GET   | 200 (Ok), 404 (Not Found)                                             | Retrieve an existing resource                                     |
| DELETE  | 200 (Ok), 404 (Not Found), 405 (Method Not Allowed)                   | Deletes an existing resource                                      |
| OPTIONS | NA                                                                    | Retrieve information about an API (Methods / Content Type)        |
|  HEAD   | NA                                                                    | Retrieves information about a resource (Version / Length / Type ) |
|   ALL   | NA                                                                    | All of the above methods are supported                            |

</details>

## Environment Variables

To add and use any new environmental variable, add them in the `.env` file and read them anywhere in the server by adding a prefix, `process.env.` to the variable.

```shell
NEW_ENV_VAR="abcd"
```

```javascript
var newENVVar = process.env.NEW_ENV_VAR; //abcd
```

## Swagger

Swagger provides a web-based platform to easily interact with APIs that is conformance with the OpenAPI standards. The common responses that each API operation will return are provided below. This should be used as a quick reference and not as an exhaustive list.

<details>
  <summary>Click here to see the common decorators used</summary><br>

| Decorator        | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `@ApiBearerAuth` | Enable Bearer Authentication via security tokens        |
| `@ApiTags`       | Use to attach a controller or an API to a specific tag  |
| `@ApiOperation`  | Use to describe an API                                  |
| `@ApiBody`       | Use to explicitly set the format of an API body         |
| `@ApiParam`      | Use to explicitly set the parameters of an API request  |
| `@ApiProperty`   | Use to define an API property in a Data Transfer Object |

</details>

<details>
  <summary>Click here to see the common responses for each HTTP Method</summary><br>

| Operation | Responses                                                          |
| :-------: | ------------------------------------------------------------------ |
|  `POST`   | 201 Created, 401 Unauthorized, 500 Internal Server Error           |
|   `PUT`   | 200 Ok, 401 Unauthorized, 404 Not Found, 500 Internal Server Error |
|  `PATCH`  | 200 Ok, 401 Unauthorized, 404 Not Found, 500 Internal Server Error |
|   `GET`   | 200 Ok, 401 Unauthorized, 404 Not Found                            |
| `DELETE`  | 200 Ok, 401 Unauthorized, 404 Not Found                            |

</details>

To understand more about HTTP responses, please refer to the following resources.

1. [NestJS Swagger Response Decorators](https://docs.nestjs.com/openapi/operations#responses)
2. [Comprehensive List of API Responses](https://restfulapi.net/http-status-codes/)

## Task Scheduler

Task scheduling should be done in a class, which can be a `controller` or `service` file. To see the list of duration that is supported by `CronExpression`, please refer to the following resource, [NestJS Schedule CronExpression](https://github.com/nestjs/schedule/blob/master/lib/enums/cron-expression.enum.ts).

```javascript
import { Cron, CronExpression } from "@nestjs/schedule";

export class AppService {
@Cron(CronExpression.EVERY_5_SECONDS)
async repeatFunction() {
console.log(`Repeat every 5 seconds`);
}

```

## Logging

All logs will be saved in the `cheese.log` file in the project root directory. Six logging tags can be used for different events. Logging can be done at any part of the server.

<details>
  <summary>Click here to see the types of Logging Tags</summary><br>

1. Trace - For informational events for a specific functionality or module
2. Debug - For informational events that are useful for application developers to debug the application
3. Info - For saving progress and state information that might be useful
4. Warn - For unexpected error events that can be potentially harmful to the application
5. Error - For error events that need to be addressed and may result in the death of the application
6. Fatal - For events that will result in the death of the application

</details>

```javascript
import * as log4js from "log4js";

const logger = log4js.getLogger(`cheese`);

logger.trace("Entering cheese testing"); // [2022-10-04T18:18:21.327] [TRACE] cheese - Entering cheese testing
logger.debug("Got cheese."); // [2022-10-04T18:18:21.328] [DEBUG] cheese - Got cheese.
logger.info("Cheese is Comté."); // [2022-10-04T18:18:21.328] [INFO] cheese - Cheese is Comté.
logger.warn("Cheese is quite smelly."); // [2022-10-04T18:18:21.328] [WARN] cheese - Cheese is quite smelly.
logger.error("Cheese is too ripe!"); // [2022-10-04T18:18:21.328] [ERROR] cheese - Cheese is too ripe!
logger.fatal("Cheese was breeding ground for listeria."); // [2022-10-04T18:18:21.328] [FATAL] cheese - Cheese was breeding ground for listeria.
```

## Key Management System

The decrypted crypto key can be retrieved at any part of the server. It can then be used for any encryption or decryption necessary.

```javascript
import { GlobalService } from "../global.service";

export class RandomService {
  randomFunction(): any {
    const cryptoKey = GlobalService.cryptoKey;
  }
}
```

# Setup from scratch

An example of the [environment variables file](.env.sample) is included in the `samples` folder.

<details>
  <summary>Click here to see the table of Environment Variables</summary><br>

| Name                            | Required | Description                                                                     |
| ------------------------------- | :------: | ------------------------------------------------------------------------------- |
| PORT                            |    No    | The Port Number of the server. If empty, Port `3000` will be used.              |
| API_CORSALLOW_URLS              |   Yes    | An array of URL strings that are allowed to connect to the server.              |
| API_PREFIX                      |    No    | The Prefix that will be attached to each API. If empty, `/api/v1` will be used. |
| API_NAME                        |   Yes    | The name of the API Server.                                                     |
| API_VERSION                     |   Yes    | The version of the API Server.                                                  |
| CRYPTO_KEY_RSA_PRIVATE_KEY_PATH |   Yes    | The directory where the RSA Private Key is stored.                              |
| CRYPTO_KEY                      |   Yes    | The encrypted Crypto Key.                                                       |

</details>

## New NestJS Server

Creates a NestJS API Server at a specified Port Number and API Prefix. A list of URLs is also defined to allow access to the server.

`helmet` library is used to set HTTP headers to secure the API.
`body-parser` library is used to parse incoming request bodies.
`cli-color` library is used to enable colors in console logs.
`@nestjs/config` library is used to enable the usage of environment variables.

### Installation

1. In the project root folder, open a terminal and run `npm i -g @nestjs/cli` to install NestJS CLI functionality
2. Run `nest new <project-name>` to initialize a new NestJS project
3. Install the following libraries by running `npm install body-parser helmet cli-color`

Some libraries will be pre-installed when a new NestJS project is initialized. See below for the lists.

<details>
  <summary>Click here to see the list of pre-installed dependencies</summary><br>

1. @nestjs/common
2. @nestjs/config
3. @nestjs/core
4. @nestjs/platform-express
5. reflect-metadata
6. rimraf
7. rxjs

</details>

<details>
  <summary>Click here to see the list of pre-installed devDependencies</summary><br>

1. @nestjs/cli
2. @nestjs/schematics
3. @nestjs/testing
4. @types/express
5. @types/jest
6. @types/node
7. @types/supertest
8. @typescript-eslint/eslint-plugin
9. @typescript-eslint/parser
10. eslint
11. eslint-config-prettier
12. eslint-plugin-prettier
13. jest
14. prettier
15. supertest
16. ts-jest
17. ts-loader
18. ts-node
19. tsconfig-paths
20. typescript

</details>

### Update

To update the default NestJS libraries, all of them must be using the same major version. The current version used is `9.0.0`, which means that the major version is `9`.

<details>
  <summary>Click here to see the list of libraries to update</summary><br>

1. @nestjs/common
2. @nestjs/core
3. @nestjs/platform-express
4. @nestjs/cli
5. @nestjs/schematics
6. @nestjs/testing

</details>

### Configuration

Create a new file, `.env` with the following code.

<details>
  <summary>.env</summary><br>

Location: [.env](.env)

```bash
PORT=3002
API_CORSALLOW_URLS=["http://localhost:3002"]
API_PREFIX="/api/v1"
```

</details>

Create a new file, `http-exception.filter.ts` with the following code.

<details>
  <summary>http-exception.filter.ts</summary><br>

Location: [src/http-exception.filter.ts](src/http-exception.filter.ts)

```javascript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const pchars: string[] = ['%3E', '%3C', '%2F', '<', '/', '>'];
    let message = exception.message;
    if (message) {
      if (pchars.some(v => message.includes(v))) {
        message = '';
      }
    }
    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
```

</details>

Amend the `main.ts` file with the following codes.

<details>
  <summary>main.ts</summary><br>

Location: [src/main.ts](src/main.ts)

```javascript
import { NotAcceptableException } from "@nestjs/common";
import * as clc from "cli-color";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet.frameguard());
  app.use(helmet.hsts({ maxAge: 7776000000 }));
  app.use(bodyParser.json({ limit: `50mb` }));
  app.use(bodyParser.urlencoded({ limit: `50mb`, extended: true }));
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || process.env.API_CORSALLOW_URLS.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new NotAcceptableException(`Not allowed by CORS ${origin}`));
      }
    },
  });
  const apiPrefix = process.env.API_PREFIX ?? `/api/v1`;
  const port = process.env.PORT ?? 3000;

  app.setGlobalPrefix(apiPrefix);

  const server = await app.listen(port);
  process.on("unhandledRejection", (reason, promise) => {
    console.log(`Unhandled Rejection at ${promise}: ${reason}`);
  });

  server.setTimeout(3600000, () => {
    console.log("Socket is destroyed due to timeout");
  });

  console.log(`🚀  launched from pad ${clc.black.bgGreen(port)}, mission ${clc.black.bgGreen(apiPrefix)}`);
}
bootstrap();
```

</details>

Amend the `app.module.ts` file with the following codes.

<details>
  <summary>app.module.ts</summary><br>

Location: [src/app.module.ts](src/app.module.ts)

```javascript
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";

import { HttpExceptionFilter } from "./http-exception.filter";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
```

</details>

### Test

Test the default route of the NestJS API Server.

<details>
  <summary>terminal</summary>

```bash
$ # GET
$ curl -X GET http://localhost:3000/api/v1
$ # result -> Hello World!
```

</details>

## Swagger

Integrates Swagger functionality with the NestJS API Server via the `@nestjs/swagger` library. It is in conformance with the OpenAPI Specifications Version 3.0.3.

### Installation

1. In the project root folder, open a terminal and run `npm i @nestjs/swagger`

### Configuration

Update the `.env` file with 2 new environmental variables.

<details>
  <summary>.env</summary><br>

Location: [.env](.env)

```bash
API_NAME="Jupyton API"
API_VERSION=1.0.0
```

</details>

Update the `main.ts` file with the following codes.

<details>
  <summary>main.ts</summary><br>

Location: [src/main.ts](src/main.ts)

```javascript
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

const options = new DocumentBuilder()
  .setTitle(process.env.API_NAME)
  .setDescription(`API for ${process.env.API_NAME}`)
  .setVersion(process.env.API_VERSION)
  .build();
const document = SwaggerModule.createDocument(app, options);
SwaggerModule.setup(`api`, app, document);
```

</details>

### Optional Configuration

It is also possible to add the following configuration to the Swagger Module.

<details>
  <summary>Optional Configuration Table</summary><br>

|              Configuration | Description                                                                                                |
| -------------------------: | ---------------------------------------------------------------------------------------------------------- |
|       **Terms of Service** | Adds a link to the terms of services for the API Server.                                                   |
|       **Point of Contact** | Adds the contact details for the API Server. The contact details are a name, an URL, and an email address. |
|    **License Information** | Adds a link to the License Agreement for the API Server.                                                   |
|             **Server URL** | Adds multiple server URLs to call for the API. Useful only when there are multiple API servers.            |
| **External Documentation** | Adds a link to the external Documentation for the API Server.                                              |

</details>

The method to add these configurations is the same, which is to add new environment variables and set them as part of the options before creating the Swagger Module document in the `main.ts` file.

<details>
  <summary>main.ts</summary><br>

Location: [src/main.ts](src/main.ts)

```javascript
const options = new DocumentBuilder()
  .setTermsOfService(process.env.API_TOS) // https://www.jedtrade.com/privacy-policy/
  .setContact(
    process.env.API_POC_NAME, // JEDTrade
    process.env.API_POC_WEBSITE, // https://www.jedtrade.com/
    process.env.API_POC_EMAIL // johndoe@jedtrade.com
  )
  .setLicense(`License`, process.env.API_LICENSE_AGREEMENT) // https://www.jedtrade.com/privacy-policy/
  .addServer(
    process.env.API_2_URL, // https://api1.binance.com
    process.env.API_2_NAME // BINANCE API
  )
  .setExternalDoc(`Documentation`, process.env.API_DOCUMENTATION); // https://binance-docs.github.io/apidocs/spot/en/#general-info
const document = SwaggerModule.createDocument(app, options);
SwaggerModule.setup(`api`, app, document);
```

</details>

## Task Scheduler

Integrates task scheduling functionality with the NestJS API Server via the `@nestjs/schedule` library.

### Installation

1. In the project root folder, open a terminal and run `npm i @nestjs/schedule`

### Configuration

Update the `app.module.ts` file with the following code.

<details>
  <summary>app.module.ts</summary><br>

Location: [src/app.module.ts](src/app.module.ts)

```javascript
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [ScheduleModule.forRoot()],
})
export class AppModule {}
```

</details>

## Logging

Integrates logging functionality with the NestJS API Server via the `log4js` library.

### Installation

1. In the project root folder, open a terminal and run `npm i log4js`

### Configuration

Update the `main.ts` file with the following code.

<details>
  <summary>main.ts</summary><br>

Location: [src/main.ts](src/main.ts)

```javascript
import * as log4js from "log4js";

log4js.configure({
  appenders: { cheese: { type: `file`, filename: `cheese.log` } },
  categories: { default: { appenders: [`cheese`], level: `all` } },
});
```

</details>

## Key Management System

Integrates usage of a crypto key to cryptographically secure any private keys.

To ensure that the crypto key is not known to any system engineers, a password is used to secure an RSA Private Key. This RSA Private Key is then used to encrypt the plaintext crypto key. Hence, after a server restarts or reboots, an administrator must provide the password of the RSA Private Key to decrypt the crypto key. The decrypted crypto key will only exist in the memory of the server and will be deleted once the server shuts down.

### Installation

1. In the project root folder, open a terminal and run `npm i crypto`

### Keys Generation

If you do not have the RSA Private Key and the encrypted crypto key, go to [Jupyton KMS](https://github.com/JupiterChain/jupyton_kms) to learn how to generate them.

1. Generate Random Crypto Key
2. Generate RSA Key Pair
3. Encrypt using an Asymmetric Public Key

### Configuration

Update the `.env` file with 2 new environmental variables.

<details>
  <summary>.env</summary><br>

Location: [.env](.env)

```bash
CRYPTO_KEY_RSA_PRIVATE_KEY_PATH=<directory-path-to-rsa-private-key>
CRYPTO_KEY=<encrypted-crypto-key>
```

</details>

Create a new file, `global.service.ts` with the following code. This is to allow create global variables that are accessible anywhere in the server.

<details>
  <summary>global.service.ts</summary><br>

Location: [src/global.service.ts](src/global.service.ts)

```javascript
export class GlobalService {
  static cryptoKey: any;
  static isCryptoKeyDecrypted: boolean = false;
}
```

</details>

Create a new folder, `crypto`, and 3 new files inside the folder, `crypto.module.ts`, `crypto.controller.ts`, and `crypto.service.ts` with the following codes.

<details>
  <summary>crypto.service.ts</summary><br>

Location: [src/crypto/crypto.service.ts](src/crypto/crypto.service.ts)

```javascript
import { Injectable, HttpStatus } from "@nestjs/common";
import * as log4js from "log4js";
import * as fs from "fs";
import * as crypto from "crypto";

import { GlobalService } from "../global.service";

const logger = log4js.getLogger("cheese");

@Injectable()
export class CryptoService {
  isCryptoKeyDecrypted(): boolean {
    logger.info(
      `crypto.service: isCryptoKeyDecrypted: GlobalService.isCryptoKeyDecrypted: ${GlobalService.isCryptoKeyDecrypted}`
    );
    return GlobalService.isCryptoKeyDecrypted;
  }

  decryptCryptoKey(password): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let privateKey;
      try {
        privateKey = fs.readFileSync(process.env.CRYPTO_KEY_RSA_PRIVATE_KEY_PATH, "utf8");
      } catch (error) {
        var errorMsg = `Private Key file not found at ${process.env.CRYPTO_KEY_RSA_PRIVATE_KEY_PATH}!`;
        logger.error(`crypto.service: decryptCryptoKey: Error 1: ${errorMsg}`);
        reject({ status: HttpStatus.BAD_REQUEST, message: errorMsg });
      }
      const bufferData = Buffer.from(process.env.CRYPTO_KEY, "hex");
      try {
        const decryptedData = crypto.privateDecrypt(
          {
            key: privateKey.toString(),
            passphrase: password,
          },
          bufferData
        );
        GlobalService.cryptoKey = decryptedData.toString("hex");
        GlobalService.isCryptoKeyDecrypted = true;
        resolve(true);
      } catch (error) {
        let errorNum;
        let errorMsg;
        switch (error.reason) {
          case "oaep decoding error":
            errorNum = 2;
            errorMsg = `Private Key file and Encrypted Crypto Key does not match!`;
          case "bad decrypt":
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
  }
}
```

</details>

<details>
  <summary>crypto.controller.ts</summary><br>

Location: [src/crypto/crypto.controller.ts](src/crypto/crypto.controller.ts)

```javascript
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
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Probable cause: invalid bearer token or not presented.',
  })
  @ApiBadRequestResponse({ description: 'Bad Request: Possible cause: Incorrect password.' })
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
```

</details>

<details>
  <summary>crypto.module.ts</summary><br>

Location: [src/crypto/crypto.module.ts](src/crypto/crypto.module.ts)

```javascript
import { Module } from "@nestjs/common";

import { CryptoController } from "./crypto.controller";
import { CryptoService } from "./crypto.service";

@Module({
  controllers: [CryptoController],
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
```

</details>

Update the `app.module.ts` file with the following code.

<details>
  <summary>app.module.ts</summary><br>

Location: [src/app.module.ts](src/app.module.ts)

```javascript
import { CryptoModule } from "./crypto/crypto.module";

@Module({
  imports: [CryptoModule],
})
export class AppModule {}
```

</details>

# References

1. [NestJS Documentation](https://docs.nestjs.com/)
2. [NestJS Swagger OpenAPI Documentation](https://docs.nestjs.com/openapi/introduction)
3. [Swagger OpenAPI Documentation](https://swagger.io/docs/specification/about/)
4. [NestJS Task Scheduler Documentation](https://docs.nestjs.com/techniques/task-scheduling)
5. [Log4JS Documentation](https://log4js-node.github.io/log4js-node/index.html)
