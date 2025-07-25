'use server';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { after } from 'next/dist/server/after';

import type { IAnswer } from '@/database/answer.model';

import { Answer, Question, Vote } from '@/database';

import action from '../handlers/action';
import { handleError } from '../handlers/error';
import { NotFoundError } from '../http-errors';
import { CreateAnswerSchema, DeleteAnswerSchema, GetQuestionAnswersSchema } from '../validations';
import { createInteraction } from './interaction.action';

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

    after(async () => {
      await createInteraction({
        action: 'post',
        actionId: newAnswer._id.toString(),
        actionTarget: 'answer',
        authorId: userId as string,
      });
    });

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(newAnswer)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export type GetQuestionAnswersResponse = {
  answers: Answer[];
  pagination: Pagination;
};

export async function getQuestionAnswers(params: GetQuestionAnswersParams): Promise<ActionResponse<GetQuestionAnswersResponse>> {
  const validationResult = await action({
    params,
    schema: GetQuestionAnswersSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId, page = 1, pageSize = 10, sortBy = 'newest' } = validationResult.params!;

  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  let sortOptions = {};

  switch (sortBy) {
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    case 'popular':
      sortOptions = { upvotes: -1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }

  try {
    const totalAnswers = await Answer.countDocuments({ question: questionId });

    const answers = await Answer.find({ question: questionId }).populate('author', 'name image').sort(sortOptions).skip(skip).limit(limit).lean();

    const pagination = {
      page,
      pageSize,
      totalPages: Math.ceil(totalAnswers / pageSize),
      total: totalAnswers,
      isPrev: page > 1,
      isNext: page < Math.ceil(totalAnswers / pageSize),
    };

    return { success: true, data: { answers: JSON.parse(JSON.stringify(answers)), pagination } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteAnswer(
  params: DeleteAnswerParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteAnswerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { answerId } = validationResult.params!;
  const { user } = validationResult.session!;

  try {
    const answer = await Answer.findById(answerId);
    if (!answer) throw new Error('Answer not found');

    if (answer.author.toString() !== user?.id)
      throw new Error('You\'re not allowed to delete this answer');

    await Question.findByIdAndUpdate(
      answer.question,
      { $inc: { answers: -1 } },
      { new: true },
    );

    await Vote.deleteMany({ actionId: answerId, actionType: 'answer' });

    await Answer.findByIdAndDelete(answerId);

    revalidatePath(`/profile/${user?.id}`);

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
