import type { Document } from 'mongoose';

import { model, models, Schema } from 'mongoose';

export type IUser = {
  name: string;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  location?: string;
  portfolio?: string;
  reputation?: number;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
};

export type IUserDoc = Document & IUser;

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true },
  bio: { type: String, maxlength: 160 },
  image: { type: String },
  location: { type: String },
  portfolio: { type: String },
  reputation: { type: Number, default: 0 },
  socialLinks: {
    github: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    website: { type: String },
  },
}, { timestamps: true });

const User = models?.User || model<IUser>('User', UserSchema);

export default User;
