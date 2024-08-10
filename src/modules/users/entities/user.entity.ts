import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Document, HydratedDocument } from 'mongoose';
import { Roles } from '../enum/roles.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Document {
  _id: string;

  @Prop({ type: String, unique: true })
  userName: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String, enum: Roles, default: Roles.USER })
  role: Roles;

  @Prop({
    type: Boolean,
    default: false,
  })
  removed: boolean;

  passwordCheck: (password: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (this: UserDocument, next: any) {
  // this.isModified is a mongoose method that returns true if a specified field has been modified
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.passwordCheck = async function (password: string) {
  const isPassword = await bcrypt.compare(password, this.password);
  return isPassword;
};

UserSchema.pre('findOneAndUpdate', async function (next: any) {
  const password = this.getUpdate()['password'];
  if (!password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.getUpdate()['$set'].password = await bcrypt.hash(password, salt);
  delete this.getUpdate()['password'];
  next();
});
