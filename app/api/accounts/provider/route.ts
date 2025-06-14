import { NextResponse } from 'next/server';

import Account from '@/database/account.model';
import { handleError } from '@/lib/handlers/error';
import { NotFoundError, ValidationError } from '@/lib/http-errors';
import dbConnect from '@/lib/mongoose';
import { AccountSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const body = await request.json();

  const { providerAccountId } = body;

  if (!providerAccountId) throw new NotFoundError('Provider account ID is required');

  try {
    const validationResult = AccountSchema.partial().safeParse({ providerAccountId });

    if (!validationResult.success) throw new ValidationError(validationResult.error.flatten().fieldErrors);

    await dbConnect();

    const account = await Account.findOne({ providerAccountId });

    if (!account) throw new NotFoundError('Account');

    return NextResponse.json({
      success: true,
      data: account,
    }, { status: 200 });
  } catch (error) {
    return handleError(error, 'api') as APIErrorResponse;
  }
}
