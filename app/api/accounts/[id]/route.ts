import { NextResponse } from 'next/server';

import Account from '@/database/account.model';
import { handleError } from '@/lib/handlers/error';
import { NotFoundError, ValidationError } from '@/lib/http-errors';
import dbConnect from '@/lib/mongoose';
import { AccountSchema } from '@/lib/validations';

type Params = {
  id: string;
};

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;

  if (!id) throw new NotFoundError('Account');

  try {
    await dbConnect();

    const account = await Account.findById(id);

    if (!account) throw new NotFoundError('Account');

    return NextResponse.json({
      success: true,
      data: account,
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

    const account = await Account.findByIdAndDelete(id);

    if (!account) throw new NotFoundError('Account');

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

    const validationResult = AccountSchema.partial().safeParse(body);

    if (!validationResult.success) throw new ValidationError(validationResult.error.flatten().fieldErrors);

    const updatedAccount = await Account.findByIdAndUpdate(id, validationResult.data, { new: true });

    if (!updatedAccount) throw new NotFoundError('Account');

    return NextResponse.json({
      success: true,
      data: updatedAccount,
    }, { status: 200 });
  } catch (error) {
    return handleError(error, 'api') as APIErrorResponse;
  }
}
