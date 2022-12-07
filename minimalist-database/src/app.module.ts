import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';

import { HttpExceptionFilter } from './http-exception.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoModule } from './crypto/crypto.module';
import { UsersModule } from "./users/users.module";
import { IssuanceoModule } from "./Issuance/Issuance.module";
import { VerifyModule } from "./conditions/verify.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
        CryptoModule,
        IssuanceoModule,
    TerminusModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URL,
      }),
    }),
        UsersModule,
        VerifyModule,
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
