'use server';

import type { FilterQuery } from 'mongoose';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { after } from 'next/dist/server/after';
import { z } from 'zod';

import type { ITagDoc } from '@/database/tag.model';

import { ROUTES } from '@/constants';
import { Answer, Collection, Question, Tag, TagQuestion, Vote } from '@/database';

import action from '../handlers/action';
import { handleError } from '../handlers/error';
import dbConnect from '../mongoose';
import { AskQuestionSchema, DeleteQuestionSchema, GetQuestionSchema, IncrementViewsSchema, PaginatedSearchParamsSchema, UpdateQuestionSchema } from '../validations';
import { createInteraction } from './interaction.action';

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

    after(async () => {
      await createInteraction({
        action: 'post',
        actionId: question._id.toString(),
        actionTarget: 'question',
        authorId: userId as string,
      });
    });

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
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId).populate('tags').populate('author', '_id name image');

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

export async function incrementViews(params: IncrementViewsParams): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: IncrementViewsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      throw new Error('Question not found');
    }

    await question.updateOne({ $inc: { views: 1 } });

    revalidatePath(ROUTES.QUESTION_DETAILS(questionId));

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getHotQuestions(): Promise<ActionResponse<Question[]>> {
  try {
    await dbConnect();

    const questions = await Question.find({}).sort({ views: -1, upvotes: -1 }).limit(5);

    return { success: true, data: JSON.parse(JSON.stringify(questions)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteQuestion(
  params: DeleteQuestionParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const { user } = validationResult.session!;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const question = await Question.findById(questionId).session(session);
    if (!question) throw new Error('Question not found');

    if (question.author.toString() !== user?.id)
      throw new Error('You are not authorized to delete this question');

    await Collection.deleteMany({ question: questionId }).session(session);

    await TagQuestion.deleteMany({ question: questionId }).session(session);

    if (question.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: question.tags } },
        { $inc: { questions: -1 } },
        { session },
      );
    }

    await Vote.deleteMany({
      actionId: questionId,
      actionType: 'question',
    }).session(session);

    const answers = await Answer.find({ question: questionId }).session(
      session,
    );

    if (answers.length > 0) {
      await Answer.deleteMany({ question: questionId }).session(session);

      await Vote.deleteMany({
        actionId: { $in: answers.map(answer => answer.id) },
        actionType: 'answer',
      }).session(session);
    }

    await Question.findByIdAndDelete(questionId).session(session);

    await session.commitTransaction();
    session.endSession();

    revalidatePath(`/profile/${user?.id}`);

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return handleError(error) as ErrorResponse;
  }
}
