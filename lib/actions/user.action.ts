import type { FilterQuery } from 'mongoose';

import { User } from '@/database';

import action from '../handlers/action';
import { handleError } from '../handlers/error';
import { PaginatedSearchParamsSchema } from '../validations';

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
