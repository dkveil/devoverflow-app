import { NextResponse } from 'next/server';

import User from '@/database/user.model';
import { handleError } from '@/lib/handlers/error';
import { NotFoundError, ValidationError } from '@/lib/http-errors';
import dbConnect from '@/lib/mongoose';
import { UserSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const body = await request.json();

  const { email } = body;

  if (!email) throw new NotFoundError('Email is required');

  try {
    const validationResult = UserSchema.partial().safeParse({ email });

    if (!validationResult.success) throw new ValidationError(validationResult.error.flatten().fieldErrors);

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) throw new NotFoundError('User');

    return NextResponse.json({
      success: true,
      data: user,
    }, { status: 200 });
  } catch (error) {
    return handleError(error, 'api') as APIErrorResponse;
  }
}
