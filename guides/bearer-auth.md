# About

This guide will provide the steps required to utilize Bearer Authentication in the NestJS API Server. It comes with the necessary code snippets to aid in understanding. In addition, there are detailed steps on how to [reproduce this NestJS Server from scratch](#setup-from-scratch).

# Usage

The authentication module has to be imported to the module file that it will be used on. After which, the authentication can be enabled at each API level or the entire controller.

## Module

Import the authentication module.

```javascript
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
})
export class CryptoModule {}
```

## Controller

Enable bearer authentication to an API route.

```javascript
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

export class CryptoController {
  @ApiBearerAuth() // set ApiBearerAuth
  @UseGuards(AuthGuard('bearer')) // set UseGuards with bearer strategy
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
```

Alternatively, it is also possible to enable bearer authentication for all the routes.

```javascript
@ApiBearerAuth() // set ApiBearerAuth
@UseGuards(AuthGuard("bearer")) // set UseGuards with bearer strategy
export class CryptoController {}
```

# Setup from scratch

Integrates bearer authentication functionality with the NestJS API Server via the `@nestjs/passport` and `passport-http-bearer` libraries.

## Installation

1. In the project root folder, open a terminal and run `npm i @nestjs/passport passport-http-bearer`

## Configuration

Update the `.env` file with a new environmental variable.

<details>
  <summary>.env</summary><br>

Location: [.env](.env)

```bash
API_KEY="b7efbcc111efce56b4bf934aeda92fa6aef6e7f074cfec01174ae9a6bc75a33d"
```

</details>

Create a new file, `bearer.strategy.ts` with the following code.

<details>
  <summary>bearer.strategy.ts</summary><br>

Location: [src/auth/strategies/bearer.strategy.ts](src/auth/strategies/bearer.strategy.ts)

```javascript
import { Strategy } from "passport-http-bearer";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, "bearer") {
  constructor() {
    super();
  }

  async validate(token: string): Promise<any> {
    const adminPassword = process.env.API_KEY;
    if (token !== adminPassword) throw new UnauthorizedException();
    else return true;
  }
}
```

</details>

Create a new file, `auth.module.ts` with the following code.

<details>
  <summary>auth.module.ts</summary><br>

Location: [src/auth/auth.module.ts](src/auth/auth.module.ts)

```javascript
import { Module } from "@nestjs/common";
import { BearerStrategy } from "./strategies/bearer.strategy";

@Module({
  imports: [],
  controllers: [],
  providers: [BearerStrategy],
  exports: [],
})
export class AuthModule {}
```

</details>

Update `main.ts` with the following code to set a Bearer Token in Swagger.

<details>
  <summary>main.ts</summary><br>

Location: [src/main.ts](src/main.ts)

```javascript
const options = new DocumentBuilder().addBearerAuth();
```

</details>

# References

1. [NestJS Authentication Documentation](https://docs.nestjs.com/security/authentication)
2. [Swagger Bearer Authentication Documentation](https://swagger.io/docs/specification/authentication/bearer-authentication/)