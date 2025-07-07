'use server';

import type { FilterQuery } from 'mongoose';

import mongoose from 'mongoose';
import { z } from 'zod';

import type { ITagDoc } from '@/database/tag.model';

import Question from '@/database/question.model';
import TagQuestion from '@/database/tag-question.model';
import Tag from '@/database/tag.model';

import action from '../handlers/action';
import { handleError } from '../handlers/error';
import { AskQuestionSchema, GetQuestionSchema, PaginatedSearchParamsSchema, UpdateQuestionSchema } from '../validations';

export async function createQuestion(params: CreateQuestionParams): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, description, content, tags } = validationResult.params!;

  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [question] = await Question.create([{
      title,
      description,
      content,
      author: userId,
    }], { session });

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocuments = [];

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate({ name: { $regex: new RegExp(`^${tag}$`, 'i') } }, { $setOnInsert: { name: tag }, $inc: { questions: 1 } }, { new: true, upsert: true, session });

      tagIds.push(existingTag._id);
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    await TagQuestion.insertMany(tagQuestionDocuments, { session });
    await Question.findByIdAndUpdate(question._id, { $push: { tags: { $each: tagIds } } }, { session });

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function updateQuestion(params: UpdateQuestionParams): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: UpdateQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId, title, description, content, tags } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).populate('tags');

    if (!question) {
      throw new Error('Question not found');
    }

    if (question.author.toString() !== userId) {
      throw new Error('You are not authorized to update this question');
    }

    if (question.title !== title) question.title = title;
    if (question.description !== description) question.description = description;
    if (question.content !== content) question.content = content;

    await question.save({ session });

    const currentTagNames = question.tags.map((tag: ITagDoc) => tag.name.toLowerCase());
    const newTagNames = tags.map(tag => tag.toLowerCase());

    const tagsToAdd = tags.filter(tag => !currentTagNames.includes(tag.toLowerCase()));
    const tagsToRemove = question.tags.filter((tag: ITagDoc) => !newTagNames.includes(tag.name.toLowerCase()));

    if (tagsToRemove.length > 0) {
      const tagIds = tagsToRemove.map((tag: ITagDoc) => tag._id);

      await Tag.updateMany({ _id: { $in: tagIds } }, { $inc: { questions: -1 } }, { session });
      await TagQuestion.deleteMany({ tag: { $in: tagIds }, question: questionId }, { session });

      question.tags = question.tags.filter(
        (tag: mongoose.Types.ObjectId) =>
          !tagIds.some((id: mongoose.Types.ObjectId) =>
            id.equals(tag._id),
          ),
      );
    }

    // Dodaj nowe tagi
    if (tagsToAdd.length > 0) {
      const newTagDocuments = [];
      const newTagIds = [];

      for (const tag of tagsToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { new: true, upsert: true, session },
        );

        newTagDocuments.push({
          tag: existingTag._id,
          question: questionId,
        });

        newTagIds.push(existingTag._id);
      }

      await TagQuestion.insertMany(newTagDocuments, { session });

      question.tags.push(...newTagIds);
    }

    await question.save({ session });
    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getQuestion(
  params: GetQuestionParams,
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId).populate('tags');

    if (!question) {
      throw new Error('Question not found');
    }

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

type PaginatedQuestions = {
  questions: Question[];
  pagination: Pagination;
};

export async function getQuestions(
  params: PaginatedSearchParams & { excludeContent?: boolean },
): Promise<ActionResponse<PaginatedQuestions>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema.extend({ excludeContent: z.boolean().optional() }),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query = '', filter = '', sortBy, excludeContent = false } = validationResult.params!;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<Question> = {};

  if (filter === 'recommended') {
    const pagination: Pagination = {
      page,
      pageSize,
      totalPages: 0,
      total: 0,
      isPrev: false,
      isNext: false,
    };

    return { success: true, data: { questions: [], pagination } };
  }

  if (query) {
    filterQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
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
    case 'unanswered':
      filterQuery.answers = { $or: [{ $exists: false }, { $eq: 0 }] };
      break;
    case 'most-votes':
      sortOptions = { upvotes: -1 };
      break;
    case 'most-answers':
      sortOptions = { answers: -1 };
      break;
    case 'most-views':
      sortOptions = { views: -1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }

  try {
    const total = await Question.countDocuments(filterQuery);

    let questionsQuery = Question.find(filterQuery);

    if (excludeContent) {
      questionsQuery = questionsQuery.select('-content');
    }

    const questions = await questionsQuery
      .populate('tags', 'name')
      .populate('author', 'name image')
      .lean()
      .sort(sortOptions)
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

    return { success: true, data: { questions: JSON.parse(JSON.stringify(questions)), pagination } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
