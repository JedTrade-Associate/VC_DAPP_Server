# About

This guide will provide the steps required to utilize MongoDB in the NestJS API Server. It comes with the necessary code snippets to aid in understanding. In addition, there are detailed steps on how to [reproduce this NestJS Server from scratch](#setup-from-scratch).

# Usage

For each collection in MongoDB, a new folder should be created to house all the files about the collection. They include the module, controller, and service files. A `schemas` and a `dtos` folder should also be created in the new folder to hold the schemas and data transfer objects of the collection. The schemas are typically used in retrieving data and DTOs are typically used in creating new documents in the document.

## Schema

The schema will be used to validate the parameters of a data model.

The available options to define a property are listed [here](https://mongoosejs.com/docs/schematypes.html#schematype-options).

<details>
  <summary>Click here to see the common options used</summary><br>

|        Option |  Type   | Description                                                                   |
| ------------: | :-----: | ----------------------------------------------------------------------------- |
|  **required** | General | boolean, makes the property mandatory                                         |
| **immutable** | General | boolean, defines the property as immutable                                    |
|  **validate** | General | array, define a custom validator with a RegExp condition and an error message |
|     **index** |  Index  | boolean, define an index on the property for efficient queries                |
|    **unique** |  Index  | boolean, define a unique index on the property for efficient queries         |
| **lowercase** | String  | boolean, converts the property to lowercase                                   |
| **uppercase** | String  | boolean, converts the property to uppercase                                   |
|      **trim** | String  | boolean, removes any whitespace from the property                             |
| **minLength** | String  | Number, ensures that the property length is not less than the value           |
| **maxLength** | String  | Number, ensures that the property length is not greater than the value        |
|      **enum** | String  | array, ensures that the property is one of the options in the array            |
|       **min** | Number  | number, ensures that the property is greater than or equal to the value       |
|       **max** | Number  | number, ensures that the property is less than or equal to the value          |
|       **min** |  Date   | number, ensures that the property is greater than or equal to the value       |
|       **max** |  Date   | number, ensures that the property is less than or equal to the value          |

</details>

The name of the collection in MongoDB is derived from the class name, with an additional 's' at the end. In the example below, the collection will be named `users` in MongoDB.

```javascript
export class User {}
```

Custom functions can be created to run before updating a document.

```javascript
UserSchema.pre("save", function (next) {
  this.updated = Date.now();
  if (!this.created) {
    this.created = this.updated;
  }
  next();
});
```

Additional methods can be created to expand the functionality of the schema.

```javascript
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};
```

<details>
  <summary>Click here to see the full code snippet</summary><br>

Location: [src/users/schemas/user.schema.ts](src/users/schemas/user.schema.ts)

```javascript
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

export type UserDocument = User & mongoose.Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    validate: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Not a valid email",
    ],
  })
  username: string;

  @Prop({
    required: true,
    validate: [/.{6,}/, "Password should be at least 6 characters long"],
  })
  password: string;

  @Prop()
  created: number;

  @Prop()
  updated: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre("save", function (next) {
  this.updated = Date.now();
  if (!this.created) {
    this.created = this.updated;
  }
  next();
});

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};
```

</details>

## DTO

As opposed to a schema, a DTO is typically used to assist in defining the parameters for an API.

A parameter can be defined using the `@ApiProperty` decorator. The available options to define a property are listed [here](https://swagger.io/docs/specification/data-models/keywords/).

```javascript
  @ApiProperty({
    description: 'The name of a user'
  })
  readonly name: string;
```

<details>
  <summary>Click here to see the full code snippet</summary><br>

Location: [src/users/dto/create-user.dto.ts](src/users/dto/create-user.dto.ts)

```javascript
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of a user'
  })
  readonly name: string;

  @ApiProperty({
    description: 'The email of a user',
    format: 'email',
  })
  readonly username: string;

  @ApiProperty({
    description: 'The password of a user',
    format: 'password'
  })
  readonly password: string;
}
```

</details>

## Service

The Service file will include methods that will perform a certain operation.

The necessary schemas should be provided when instancing the service so that it can be used in the functions. It can be done using the `@Injectable` and `InjectModel` decorators along with the `Model` interface.

```javascript
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
}
```

The `Model` interface is used to interact with MongoDB. The available operations are listed [here](https://mongoosejs.com/docs/api/model.html#).

```javascript
await this.userModel.create(createUserDto); // create new document
await this.userModel.find().exec(); // find all documents
await this.userModel.findOne({ _id: id }).exec(); // find a document based on its id
await await this.userModel.findByIdAndRemove({ _id: id }).exec(); // delete a document based on its id
```

<details>
  <summary>Click here to see the full code snippet</summary><br>

Location: [src/users/users.service.ts](src/users/users.service.ts)

```javascript
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = await this.userModel.create(createUserDto);
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  async findUser(username: string): Promise<User> {
    return this.userModel.findOne({ username: username }).exec();
  }

  async delete(id: string) {
    const deletedUser = await this.userModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedUser;
  }
}
```

</details>

## Controller

The Controller file will contain all the routes.

The route prefix can be declared using the `@Controller` decorator. Optionally, it can be categorized into groups in Swagger using the `@ApiTags` decorator.

```javascript
@ApiTags("Users")
@Controller("users")
export class UsersController {}
```

The service should be provided when instancing the controller so that it can be used in the routes.

```javascript
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
```

Each route should be created by declaring an HTTP Method using the `@Post`, `@Put`, `@Delete`, and `@Get` decorators. Optionally, a summary and description of the route can be added to Swagger using the `@ApiOperation` decorator.

```javascript
@Post()
@ApiOperation({
  summary: 'Create new user',
  description: 'Create a new user which will be saved in MongoDB.',
})
```

Each route should also define the responses that it will return depending on the status code.

```javascript
@ApiCreatedResponse({ description: 'User is created.' })
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Probable cause: invalid bearer token or not presented.',
})
@ApiInternalServerErrorResponse({
  description: 'Server error. Probable cause: Invalid parameters provided.',
})
```

For a `POST` route, it should utilize a DTO to define the body of the API request using the `@Body` decorator.

```javascript
async create(@Body() createUserDto: CreateUserDto) {}
```

For any routes that require the usage of parameters, it should define the parameter using the `@Param` decorator. Optionally, an example and type can be added to Swagger using the `@ApiParam` decorator.

```javascript
@ApiParam({
  name: "id",
  type: "String",
  example: "633e495a1edeed54c2947f70",
  required: true
})
async findOne(@Param('id') id: string): Promise<User> {}
```

The routes should not contain complicated logic, which should be defined in the service. Each route should rely on the service to process the complicated logic necessary.

```javascript
async create(@Body() createUserDto: CreateUserDto) {
  await this.usersService.create(createUserDto);
}
```

<details>
  <summary>Click here to see the full code snippet</summary><br>

Location: [src/users/users.controller.ts](src/users/users.controller.ts)

```javascript
import {
  Controller,
  Body,
  Param,
  Post,
  Get,
  Delete,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './schemas/user.schema';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new user',
    description: 'Create a new user which will be saved in MongoDB.',
  })
  @ApiCreatedResponse({ description: 'User is created.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Probable cause: invalid bearer token or not presented.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Server error. Probable cause: Invalid parameters provided.',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: `Get all user's information from MongoDB.`
  })
  @ApiOkResponse({ description: 'Users retrieved.' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user',
    description: 'Get user information from MongoDB.'
  })
  @ApiParam({
    name: "id",
    type: "String",
    example: "633e495a1edeed54c2947f70",
    required: true
  })
  @ApiOkResponse({ description: 'User retrieved.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async findOne(@Param('id') id: string): Promise<User> {
    var user = await this.usersService.findOne(id);
    if (user == null) throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      message: 'User not found.'
    })
    return user;
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Delete user information from MongoDB.'
  })
  @ApiParam({
    name: "id",
    type: "String",
    example: "633e495a1edeed54c2947f70",
    required: true
  })
  @ApiOkResponse({ description: 'User deleted.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Probable cause: invalid bearer token or not presented.',
  })
  async delete(@Param('id') id: string) {
    var user = await this.usersService.delete(id);
    if (user == null) throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      message: 'User not found.'
    })
    return user;
  }
}
```

</details>

## Module

The MongoDB module should be imported so that the MongoDB functionality is available in the module. In addition, any relevant module that is used in the controller or service should be imported as well.

The service should be defined so that it is available in the module. In addition, the service should also be exported if it will be used in other modules.

```javascript
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User, UserSchema } from "./schemas/user.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

## Integration

Import the new module to the `app.module.ts` file to integrate it into the application.

```javascript
import { UsersModule } from "./users/users.module";

@Module({
  imports: [UsersModule],
})
export class AppModule {}
```

# Setup from scratch

Integrates MongoDB functionality with the NestJS API Server via the `@nestjs/mongoose` library. The library, `@nestjs/terminus`, is also used to conduct health checks on MongoDB.

The standard MongoDB library, `mongoose`, is used in defining the schemas of a collection.

## Installation

1. In the project root folder, open a terminal and run `npm i @nestjs/mongoose @nestjs/terminus mongoose`

## Configuration

Update the `.env` file with a new environmental variable.

<details>
  <summary>.env</summary><br>

Location: [.env](.env)

```bash
MONGO_URL=mongodb+srv://<user>:<password>@cluster0.z7omj.mongodb.net/<database-name>?retryWrites=true&w=majority
```

</details>

Update the `app.module.ts` file with the following codes.

<details>
  <summary>app.module.ts</summary><br>

Location: [src/app.module.ts](src/app.module.ts)

```javascript
import { MongooseModule } from "@nestjs/mongoose";
import { TerminusModule } from "@nestjs/terminus";

@Module({
  imports: [
    TerminusModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URL,
      }),
    }),
  ],
})
export class AppModule {}
```

</details>

Update the `app.controller.ts` file with the following codes.

<details>
  <summary>app.controller.ts</summary><br>

Location: [src/app.controller.ts](src/app.controller.ts)

```javascript
import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';

export class AppController {
  constructor(
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
    var mongodb = await this.health.check([async () => this.mongoose.pingCheck(`mongoose`)]);
    logger.trace(`app.controller: mongodb: ${mongodb.status}`);
    if (mongodb.status != `ok`) throw new ServiceUnavailableException({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: `MongoDB is not available`
    });
  }
}
```

</details>

# References

1. [NestJS MongoDB Documentation](https://docs.nestjs.com/techniques/mongodb)
2. [MongooseJS Documentation](https://mongoosejs.com/docs/)
