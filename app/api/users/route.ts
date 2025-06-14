import { NextResponse } from 'next/server';

import User from '@/database/user.model';
import { handleError } from '@/lib/handlers/error';
import { ValidationError } from '@/lib/http-errors';
import dbConnect from '@/lib/mongoose';
import { UserSchema } from '@/lib/validations';

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find();

    return NextResponse.json({
      success: true,
      data: users,
    }, { status: 200 });
  } catch (error) {
    return handleError(error, 'api') as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    const validationResult = UserSchema.safeParse(body);

    if (!validationResult.success) throw new ValidationError(validationResult.error.flatten().fieldErrors);

    const { email, username } = validationResult.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) throw new Error('Email already exists');

    const existingUsername = await User.findOne({ username });

    if (existingUsername) throw new Error('Username already exists');

    const newUser = await User.create(validationResult.data);

    return NextResponse.json({
      success: true,
      data: newUser,
    }, { status: 201 });
  } catch (error) {
    return handleError(error, 'api') as APIErrorResponse;
  }
}
