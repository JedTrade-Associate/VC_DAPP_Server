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

import { VerifyService } from './verify.service';
import { CreateConditionsDto } from './dtos/create-conditions.dto';
import { conditions } from './schemas/conditions.schema';

@ApiTags('Verify')
@Controller('conditions')
export class VerifyController {
    constructor(private readonly verifyService: VerifyService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new condition',
    description: 'Create a new user which will be saved in MongoDB.',
  })
  @ApiCreatedResponse({ description: 'User is created.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Probable cause: invalid bearer token or not presented.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Server error. Probable cause: Invalid parameters provided.',
  })
  async create(@Body() createConditionsDto: CreateConditionsDto) {
      await this.verifyService.create(createConditionsDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all conditions',
    description: `Get all user's information from MongoDB.`
  })
  @ApiOkResponse({ description: 'Users retrieved.' })
  async findAll(): Promise<conditions[]> {
      return this.verifyService.findAll();
  }

  @Get(':identifier')
  @ApiOperation({
    summary: 'Get a identifier condition',
    description: 'Get user information from MongoDB.'
  })
  @ApiParam({
    name: "identifier",
    type: "String",
    example: "123456",
    required: true
  })
  @ApiOkResponse({ description: 'Condition retrieved.' })
  @ApiNotFoundResponse({ description: 'Condition not found.' })
  async findOne(@Param('identifier') identifier: string): Promise<conditions> {
      var condition = await this.verifyService.findOne(identifier);
      if (condition == null) throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      message: 'User not found.'
    })
      return condition;
  }

  @Delete(':identifier')
  @ApiOperation({
    summary: 'Delete a condition',
    description: 'Delete user information from MongoDB.'
  })
  @ApiParam({
    name: "identifier",
    type: "String",
    example: "123456",
    required: true
  })
  @ApiOkResponse({ description: 'condition deleted.' })
  @ApiNotFoundResponse({ description: 'condition not found.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Probable cause: invalid bearer token or not presented.',
  })
  async delete(@Param('identifier') identifier: string) {
      var condition = await this.verifyService.delete(identifier);
    if (condition == null) throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      message: 'Conditions not found.'
    })
      return condition;
  }
}