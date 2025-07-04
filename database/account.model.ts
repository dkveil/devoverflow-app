import type { Document, Types } from 'mongoose';

import { model, models, Schema } from 'mongoose';

export type IAccount = {
  name: string;
  image: string;
  password: string;
  provider: string;
  providerAccountId: string;
  userId: Types.ObjectId;
};

export type IAccountDoc = Document & IAccount;

const AccountSchema = new Schema<IAccount>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  image: { type: String },
  password: { type: String },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
}, { timestamps: true });

const Account = models?.Account || model<IAccount>('Account', AccountSchema);

export default Account;
