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