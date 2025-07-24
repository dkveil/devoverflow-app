'use server';

import type { FilterQuery } from 'mongoose';

import { Question, Tag } from '@/database';

import action from '../handlers/action';
import { handleError } from '../handlers/error';
import { NotFoundError } from '../http-errors';
import dbConnect from '../mongoose';
import { GetTagQuestionsSchema, PaginatedSearchParamsSchema } from '../validations';

type PaginatedTags = {
  tags: Tag[];
  pagination: Pagination;
};

export async function getTags(params: PaginatedSearchParams): Promise<ActionResponse<PaginatedTags>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query = '', sortBy } = validationResult.params!;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<Tag> = {};

  if (query) {
    filterQuery.$or = [{ name: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }];
  }

  let sortOptions = {};

  switch (sortBy) {
    case 'popular':
      sortOptions = { questions: -1 };
      break;
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    case 'name':
      sortOptions = { name: 1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }

  try {
    const total = await Tag.countDocuments(filterQuery);

    const tagsQuery = Tag.find(filterQuery);

    const tags = await tagsQuery.sort(sortOptions).skip(skip).limit(limit).lean();

    const totalPages = Math.ceil(total / limit);
    const isPrev = page > 1;
    const isNext = page < totalPages;

    const pagination: Pagination = {
      page,
      pageSize,
      totalPages,
      total,
      isPrev,
      isNext,
    };

    return { success: true, data: { tags: JSON.parse(JSON.stringify(tags)), pagination } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

type PaginatedTagQuestions = {
  tag: Tag;
  questions: Question[];
  pagination: Pagination;
};

export async function getTagQuestions(params: GetTagQuestionsParams): Promise<ActionResponse<PaginatedTagQuestions>> {
  const validationResult = await action({
    params,
    schema: GetTagQuestionsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { tagId, page = 1, pageSize = 10, query = '' } = validationResult.params!;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  try {
    const tag = await Tag.findById(tagId);

    if (!tag) {
      throw new NotFoundError('Tag');
    }

    const filterQuery: FilterQuery<Question> = {};

    if (query) {
      filterQuery.$or = [{ title: { $regex: query, $options: 'i' } }, { content: { $regex: query, $options: 'i' } }];
    }

    const total = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .select('_id title description author tags upvotes answers views upvotes downvotes createdAt')
      .populate('author', 'name image')
      .populate('tags', 'name')
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);
    const isPrev = page > 1;
    const isNext = page < totalPages;

    const pagination: Pagination = {
      page,
      pageSize,
      totalPages,
      total,
      isPrev,
      isNext,
    };

    return { success: true, data: { tag, questions: JSON.parse(JSON.stringify(questions)), pagination } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPopularTags(): Promise<ActionResponse<Tag[]>> {
  try {
    await dbConnect();

    const tags = await Tag.find({}).sort({ questions: -1 }).limit(5);

    return { success: true, data: JSON.parse(JSON.stringify(tags)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
