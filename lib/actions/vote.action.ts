'use server';

import type { ClientSession } from 'mongoose';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { after } from 'next/dist/server/after';

import { ROUTES } from '@/constants';
import { Answer, Question, Vote } from '@/database';

import action from '../handlers/action';
import { handleError } from '../handlers/error';
import { NotFoundError, UnauthorizedError } from '../http-errors';
import { CreateVoteSchema, HasVotedSchema, UpdateVoteSchema } from '../validations';
import { createInteraction } from './interaction.action';

export async function updateVoteCount(params: UpdateVoteCountParams, session?: ClientSession): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: UpdateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType, change } = validationResult.params!;

  const Model = targetType === 'question' ? Question : Answer;
  const voteField = voteType === 'upvote' ? 'upvotes' : 'downvotes';

  try {
    const result = await Model.findByIdAndUpdate(targetId, {
      $inc: { [voteField]: change },
    }, { new: true, session });

    if (!result) {
      throw new NotFoundError('Target');
    }

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createVote(params: CreateVoteParams): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  if (!userId) {
    return handleError(new UnauthorizedError('Unauthorized')) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const Model = targetType === 'question' ? Question : Answer;

  const contentDoc = await Model.findById(targetId).session(session);
  if (!contentDoc) throw new Error('Content not found');

  const contentAuthorId = contentDoc.author.toString();

  after(async () => {
    await createInteraction({
      action: voteType,
      actionId: targetId,
      actionTarget: targetType,
      authorId: contentAuthorId,
    });
  });

  try {
    const existingVote = await Vote.findOne({
      id: targetId,
      type: targetType,
      author: userId,
    }).session(session);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.deleteOne({ _id: existingVote._id }).session(session);
        await updateVoteCount({ targetId, targetType, voteType, change: -1 }, session);
      } else {
        await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType },
          { new: true, session },
        );
        await updateVoteCount(
          { targetId, targetType, voteType: existingVote.voteType, change: -1 },
          session,
        );
        await updateVoteCount(
          { targetId, targetType, voteType, change: 1 },
          session,
        );
      }
    } else {
      await Vote.create([{
        id: targetId,
        type: targetType,
        voteType,
        author: userId,
      }], { session });
      await updateVoteCount({ targetId, targetType, voteType, change: 1 }, session);
    }

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION_DETAILS(targetId));

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function hasVoted(params: HasVotedParams): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  try {
    const vote = await Vote.findOne({
      id: targetId,
      type: targetType,
      author: userId,
    });

    if (!vote) {
      return { success: true, data: { hasUpvoted: false, hasDownvoted: false } };
    }

    return { success: true, data: { hasUpvoted: vote.voteType === 'upvote', hasDownvoted: vote.voteType === 'downvote' } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
