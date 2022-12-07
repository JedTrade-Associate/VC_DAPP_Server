import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type VerifyDocument = conditions & mongoose.Document;

@Schema()
export class conditions {
    @Prop()
    name: string;

    @Prop()
    org: string;

    @Prop()
    email: string;

    @Prop()
    companyWeb: string;

    @Prop()
    purpose: string;

    @Prop()
    startDate: string;

    @Prop()
    endDate: string;

    @Prop()
    rpc: string;

    @Prop()
    tokenID: string;

    @Prop()
    numberofTokens: number;

    @Prop()
    numberofDays: number;

    @Prop()
    identifier: number;

    @Prop()
    attendees: number;

    @Prop()
    created: number;

    @Prop()
    updated: number;
}

export const verifySchema = SchemaFactory.createForClass(conditions);

verifySchema.pre('save', function (next) {
  this.updated = Date.now();
  if (!this.created) {
    this.created = this.updated;
  }
  next();
});

verifySchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};