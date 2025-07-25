import type { FilterQuery, PipelineStage } from 'mongoose';

import { Types } from 'mongoose';

import { Answer, Question, User } from '@/database';

import action from '../handlers/action';
import { handleError } from '../handlers/error';
import { assignBadges } from '../utils';
import { GetUserAnswersSchema, GetUserQuestionsSchema, GetUserSchema, PaginatedSearchParamsSchema } from '../validations';

type PaginatedUsers = {
  users: User[];
  pagination: Pagination;
};

export async function getAllUsers(params: PaginatedSearchParams): Promise<ActionResponse<PaginatedUsers>> {
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

  const filterQuery: FilterQuery<User> = {};

  if (query) {
    filterQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } },
    ];
  }

  let sortOptions = {};

  switch (sortBy) {
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    case 'popular':
      sortOptions = { reputation: -1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
      break;
  }

  try {
    const total = await User.countDocuments(filterQuery);

    const users = await User.find(filterQuery)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
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

    return { success: true, data: { users: JSON.parse(JSON.stringify(users)), pagination } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

type GetUserResponse = {
  user: User;
  totalQuestions: number;
  totalAnswers: number;
};

export async function getUser(params: GetUserParams): Promise<ActionResponse<GetUserResponse>> {
  const validationResult = await action({
    params,
    schema: GetUserSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = validationResult.params!;

  try {
    const user = await User.findById(userId).lean();

    const totalQuestions = await Question.countDocuments({ author: userId });
    const totalAnswers = await Answer.countDocuments({ author: userId });

    if (!user) {
      throw new Error('User not found');
    }

    return { success: true, data: { user: JSON.parse(JSON.stringify(user)), totalQuestions, totalAnswers } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

type PaginatedQuestions = {
  questions: Question[];
  pagination: Pagination;
};

export async function getUserQuestions(params: GetUserQuestionsParams): Promise<ActionResponse<PaginatedQuestions>> {
  const validationResult = await action({
    params,
    schema: GetUserQuestionsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  try {
    const total = await Question.countDocuments({ author: userId });

    const questions = await Question.find({ author: userId })
      .populate('tags', 'name')
      .populate('author', 'name image')
      .skip(skip)
      .limit(limit);

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

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questions)),
        pagination,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

type GetUserAnswersResponse = {
  answers: Answer[];
  pagination: Pagination;
};

export async function getUserAnswers(params: GetUserAnswersParams): Promise<ActionResponse<GetUserAnswersResponse>> {
  const validationResult = await action({
    params,
    schema: GetUserAnswersSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = validationResult.params!;

  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  try {
    const total = await Answer.countDocuments({ author: userId });

    const answers = await Answer.find({ author: userId })
      .populate('author', '_id name image')
      .skip(skip)
      .limit(limit);

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

    return { success: true, data: { answers: JSON.parse(JSON.stringify(answers)), pagination } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserTopTags(params: GetUserTopTagsParams): Promise<
  ActionResponse<{
    tags: { _id: string; name: string; count: number }[];
  }>
> {
  const validationResult = await action({
    params,
    schema: GetUserSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = params;

  try {
    const pipeline: PipelineStage[] = [
      { $match: { author: new Types.ObjectId(userId) } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'tags',
          localField: '_id',
          foreignField: '_id',
          as: 'tagInfo',
        },
      },
      { $unwind: '$tagInfo' },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: '$tagInfo._id',
          name: '$tagInfo.name',
          count: 1,
        },
      },
    ];

    const tags = await Question.aggregate(pipeline);

    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserStats(params: GetUserParams): Promise<
  ActionResponse<{
    totalQuestions: number;
    totalAnswers: number;
    badges: Badges;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetUserSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = params;

  try {
    const [questionStats] = await Question.aggregate([
      { $match: { author: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          upvotes: { $sum: '$upvotes' },
          views: { $sum: '$views' },
        },
      },
    ]);

    const [answerStats] = await Answer.aggregate([
      { $match: { author: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          upvotes: { $sum: '$upvotes' },
        },
      },
    ]);

    const badges = assignBadges({
      criteria: [
        { type: 'ANSWER_COUNT', count: answerStats.count },
        { type: 'QUESTION_COUNT', count: questionStats.count },
        {
          type: 'QUESTION_UPVOTES',
          count: questionStats.upvotes + answerStats.upvotes,
        },
        { type: 'TOTAL_VIEWS', count: questionStats.views },
      ],
    });

    return {
      success: true,
      data: {
        totalQuestions: questionStats.count,
        totalAnswers: answerStats.count,
        badges,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
