import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { conditions, VerifyDocument } from './schemas/conditions.schema';
import { CreateConditionsDto } from './dtos/create-conditions.dto';

@Injectable()
export class VerifyService {
  constructor(
      @InjectModel(conditions.name) private readonly userModel: Model<VerifyDocument>,
  ) {}

    async create(createConditionsDto: CreateConditionsDto): Promise<conditions> {
        const createdUser = await this.userModel.create(createConditionsDto);
    return createdUser;
  }

    async findAll(): Promise<conditions[]> {
    return this.userModel.find().exec();
  }

    async findOne(identifier: string): Promise<conditions> {
    return this.userModel.findOne({ identifier: identifier }).exec();
  }

  async delete(identifier: string) {
      const deletedUser = await this.userModel
          .findOneAndDelete({ identifier: identifier })
          .exec();
    return deletedUser;
  }
}