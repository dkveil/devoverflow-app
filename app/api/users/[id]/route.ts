import { NextResponse } from 'next/server';

import User from '@/database/user.model';
import { handleError } from '@/lib/handlers/error';
import { NotFoundError, ValidationError } from '@/lib/http-errors';
import dbConnect from '@/lib/mongoose';
import { UserSchema } from '@/lib/validations';

type Params = {
  id: string;
};

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;

  if (!id) throw new NotFoundError('User');

  try {
    await dbConnect();

    const user = await User.findById(id);

    if (!user) throw new NotFoundError('User');

    return NextResponse.json({
      success: true,
      data: user,
    }, { status: 200 });
  } catch (error) {
    return handleError(error, 'api') as APIErrorResponse;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;

  if (!id) throw new NotFoundError('User');

  try {
    await dbConnect();

    const user = await User.findByIdAndDelete(id);

    if (!user) throw new NotFoundError('User');

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    }, { status: 204 });
  } catch (error) {
    return handleError(error, 'api') as APIErrorResponse;
  }
}

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;

  if (!id) throw new NotFoundError('User');

  try {
    await dbConnect();

    const body = await request.json();

    const validationResult = UserSchema.partial().safeParse(body);

    if (!validationResult.success) throw new ValidationError(validationResult.error.flatten().fieldErrors);

    const updatedUser = await User.findByIdAndUpdate(id, validationResult.data, { new: true });

    if (!updatedUser) throw new NotFoundError('User');

    return NextResponse.json({
      success: true,
      data: updatedUser,
    }, { status: 200 });
  } catch (error) {
    return handleError(error, 'api') as APIErrorResponse;
  }
}
