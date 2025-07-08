'use server';

import mongoose from 'mongoose';

import type { IAnswer } from '@/database/answer.model';

import { Answer, Question } from '@/database';

import action from '../handlers/action';
import { handleError } from '../handlers/error';
import { NotFoundError } from '../http-errors';
import { CreateAnswerSchema } from '../validations';

export async function createAnswer(params: CreateAnswerParams): Promise<ActionResponse<IAnswer>> {
  const validationResult = await action({
    params,
    schema: CreateAnswerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { content, questionId } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      throw new NotFoundError('Question');
    }

    const [newAnswer] = await Answer.create([{ content, question: questionId, author: userId }], { session });

    if (!newAnswer) {
      throw new Error('Failed to create answer');
    }

    question.answers += 1;
    await question.save({ session });

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(newAnswer)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
