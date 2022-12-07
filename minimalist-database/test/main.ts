import { NestFactory } from '@nestjs/core';
import { NotAcceptableException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as clc from 'cli-color';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as log4js from 'log4js';

import { AppModule } from './app.module';

log4js.configure({
  appenders: { cheese: { type: `file`, filename: `cheese.log` } },
  categories: { default: { appenders: [`cheese`], level: `all` } },
});
const logger = log4js.getLogger(`cheese`);

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet.frameguard());
  app.use(helmet.hsts({ maxAge: 7776000000 }));
  app.use(bodyParser.json({ limit: `50mb` }));
  app.use(bodyParser.urlencoded({ limit: `50mb`, extended: true }));
  const apiPrefix = process.env.API_PREFIX ?? `/api/v1`;
  const port = process.env.PORT ?? 3000;
  app.setGlobalPrefix(apiPrefix);

  const options = new DocumentBuilder()
    .setTitle(process.env.API_NAME)
    .setDescription(`API for ${process.env.API_NAME}`)
    .setVersion(process.env.API_VERSION)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`api`, app, document);

  const server = await app.listen(port);
  server.setTimeout(3600000, () => {
    console.log(`Socket is destroyed due to timeout`);
    logger.info(`main: server.setTimeout: Socket is destroyed due to timeout`);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.log(`Unhandled Rejection at ${promise}: ${reason}`);
    logger.warn(`main: process.on: Unhandled Rejection at ${promise}: ${reason}`);
  });

  console.log(
    `🚀  launched from pad ${clc.black.bgGreen(
      port,
    )}, mission ${clc.black.bgGreen(apiPrefix)}`,
  );
}
bootstrap();
