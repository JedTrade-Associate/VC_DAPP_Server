import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & mongoose.Document;

@Schema()
export class User {
    @Prop({ unique: true, required: true,})
    wallet: string;

  @Prop()
    deviceID: string;

  @Prop()
  created: number;

  @Prop()
  updated: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
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