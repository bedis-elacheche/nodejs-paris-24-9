import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ unique: true })
  username: string;

  @Prop()
  password: string;

  @Prop()
  firstname: string;

  @Prop()
  lastname: string;

  @Prop()
  age: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
