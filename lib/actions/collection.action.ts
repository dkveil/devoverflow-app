'use server';

import type { FilterQuery, PipelineStage } from 'mongoose';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

import ROUTES from '@/constants/routes';
import { Collection, Question } from '@/database';

import action from '../handlers/action';
import { handleError } from '../handlers/error';
import { NotFoundError } from '../http-errors';
import { CollectionBaseSchema, PaginatedSearchParamsSchema } from '../validations';

export async function toggleQuestionInCollection(params: CollectionBaseParams): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      throw new NotFoundError('Question');
    }

    const collection = await Collection.findOne({ question: questionId, author: userId });

    if (collection) {
      await Collection.findByIdAndDelete(collection._id);

      return { success: true, data: { saved: false } };
    }

    await Collection.create({
      author: userId,
      question: question._id,
    });

    revalidatePath(ROUTES.QUESTION_DETAILS(question._id));

    return { success: true, data: { saved: true } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function hasSavedQuestion(params: CollectionBaseParams): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const collection = await Collection.findOne({
      question: questionId,
      author: userId,
    });

    return {
      success: true,
      data: {
        saved: !!collection,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

type PaginatedCollection = {
  collection: Collection[];
  pagination: Pagination;
};

export async function getUserCollection(params: PaginatedSearchParams): Promise<ActionResponse<PaginatedCollection>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const userId = validationResult.session?.user?.id;
  const { page = 1, pageSize = 10, sortBy, query } = validationResult.params!;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<Collection> = { author: new mongoose.Types.ObjectId(userId) };

  const sortOptions: Record<string, Record<string, 1 | -1>> = {
    mostrecent: { 'question.createdAt': -1 },
    oldest: { 'question.createdAt': 1 },
    mostquestions: { 'question.answers': -1 },
    leastquestions: { 'question.answers': 1 },
    mostvotes: { 'question.upvotes': -1 },
    mostanswers: { 'question.answers': -1 },
    leastanswers: { 'question.answers': 1 },
    mostviews: { 'question.views': -1 },
    leastviews: { 'question.views': 1 },
  };

  const sort = sortOptions[sortBy as keyof typeof sortOptions] || sortOptions.mostrecent;

  try {
    const pipeline: PipelineStage[] = [
      { $match: filterQuery },
      {
        $lookup: {
          from: 'questions',
          localField: 'question',
          foreignField: '_id',
          as: 'question',
        },
      },
      { $unwind: '$question' },
      { $lookup: { from: 'users', localField: 'question.author', foreignField: '_id', as: 'question.author' } },
      { $unwind: '$question.author' },
      {
        $lookup: {
          from: 'tags',
          localField: 'question.tags',
          foreignField: '_id',
          as: 'question.tags',
        },
      },
    ];

    if (query) {
      pipeline.push({
        $match: {
          $or: [
            { 'question.title': { $regex: query, $options: 'i' } },
            { 'question.description': { $regex: query, $options: 'i' } },
            { 'question.content': { $regex: query, $options: 'i' } },
          ],
        },
      });
    }
    const totalCountResult = await Collection.aggregate([...pipeline, { $count: 'count' }]);
    const totalCount = totalCountResult[0]?.count || 0;

    pipeline.push({ $sort: sort }, { $skip: skip }, { $limit: limit });

    pipeline.push({
      $project: {
        _id: 1,
        author: 1,
        question: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });

    const collections = await Collection.aggregate(pipeline);

    const totalPages = Math.ceil(totalCount / limit);
    const isPrev = page > 1;
    const isNext = page < totalPages;

    const pagination: Pagination = {
      page,
      pageSize,
      totalPages,
      total: totalCount,
      isPrev,
      isNext,
    };

    return { success: true, data: { collection: JSON.parse(JSON.stringify(collections)), pagination } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
