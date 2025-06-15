import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import slugify from 'slugify';

import type { IUser } from '@/database/user.model';

import Account from '@/database/account.model';
import User from '@/database/user.model';
import { handleError } from '@/lib/handlers/error';
import { ValidationError } from '@/lib/http-errors';
import dbConnect from '@/lib/mongoose';
import { OAuthSignInSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validationResult = OAuthSignInSchema.safeParse({ provider, providerAccountId, user });

    if (!validationResult.success) throw new ValidationError(validationResult.error.flatten().fieldErrors);

    const { name, username, email, image } = validationResult.data.user;

    const slugifiedUsername = await slugify(username, { lower: true, strict: true, trim: true });

    let existingUser = await User.findOne({ email }).session(session);

    if (!existingUser) {
      [existingUser] = await User.create([{ name, username: slugifiedUsername, email, image }], { session });
    } else {
      const updateData: Partial<IUser> = {};

      if (existingUser.name !== name) updateData.name = name;
      if (existingUser.image !== image) updateData.image = image;

      if (Object.keys(updateData).length > 0) {
        await User.updateOne({ _id: existingUser._id }, { $set: updateData }).session(session);
      }
    }

    const exisitingAccount = await Account.findOne({ userId: existingUser._id, provider, providerAccountId }).session(session);

    if (!exisitingAccount) {
      await Account.create([{ provider, providerAccountId, userId: existingUser._id, name, image }], { session });
    }

    await session.commitTransaction();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    await session.abortTransaction();
    return handleError(error, 'api') as APIErrorResponse;
  } finally {
    await session.endSession();
  }
}
