import { z } from 'zod';

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please provide a valid email address.' }),

  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long. ' })
    .max(100, { message: 'Password cannot exceed 100 characters.' }),
});

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long.' })
    .max(30, { message: 'Username cannot exceed 30 characters.' })
    .regex(/^\w+$/, {
      message: 'Username can only contain letters, numbers, and underscores.',
    }),

  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(50, { message: 'Name cannot exceed 50 characters.' })
    .regex(/^[a-z\s]+$/i, {
      message: 'Name can only contain letters and spaces.',
    }),

  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please provide a valid email address.' }),

  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' })
    .max(100, { message: 'Password cannot exceed 100 characters.' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter.',
    })
    .regex(/\d/, { message: 'Password must contain at least one number.' })
    .regex(/[^a-z0-9]/i, {
      message: 'Password must contain at least one special character.',
    }),
});

export const AskQuestionSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title is required.' })
    .max(100, { message: 'Title cannot exceed 100 characters.' }),

  description: z
    .string()
    .optional(),

  content: z.string().min(1, { message: 'Body is required.' }),
  tags: z
    .array(
      z
        .string()
        .min(1, { message: 'Tag is required.' })
        .max(30, { message: 'Tag cannot exceed 30 characters.' }),
    )
    .min(1, { message: 'At least one tag is required.' })
    .max(3, { message: 'Cannot add more than 3 tags.' }),
});

export const UpdateQuestionSchema = AskQuestionSchema.extend({
  questionId: z
    .string()
    .min(1, { message: 'Question ID is required.' })
    .regex(/^[0-9a-f]{24}$/i, {
      message: 'Question ID must be a valid MongoDB ObjectId.',
    }),
});

export const GetQuestionSchema = z.object({
  questionId: z.string().min(1, { message: 'Question ID is required.' }),
});

export const PaginatedSearchParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  query: z.string().optional(),
  filter: z.string().optional(),
  sortBy: z.string().optional(),
});

export const UserSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(50, { message: 'Name cannot exceed 50 characters.' }),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long.' })
    .max(30, { message: 'Username cannot exceed 30 characters.' }),
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please provide a valid email address.' }),
  bio: z
    .string()
    .max(160, { message: 'Bio cannot exceed 160 characters.' })
    .optional(),
  image: z
    .string()
    .url({ message: 'Please provide a valid URL.' })
    .optional(),
  location: z
    .string()
    .max(100, { message: 'Location cannot exceed 100 characters.' })
    .optional(),
  portfolio: z
    .string()
    .url({ message: 'Please provide a valid URL.' })
    .optional(),
  socialLinks: z
    .object({
      github: z.string().url({ message: 'Please provide a valid URL.' }).optional(),
      twitter: z.string().url({ message: 'Please provide a valid URL.' }).optional(),
      linkedin: z.string().url({ message: 'Please provide a valid URL.' }).optional(),
      website: z.string().url({ message: 'Please provide a valid URL.' }).optional(),
    })
    .optional(),
});

export const AccountSchema = z.object({
  userId: z
    .string()
    .min(1, { message: 'User ID is required.' })
    .regex(/^[0-9a-f]{24}$/i, {
      message: 'User ID must be a valid MongoDB ObjectId.',
    }),
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(100, { message: 'Name cannot exceed 100 characters.' }),

  image: z
    .string()
    .url({ message: 'Please provide a valid image URL.' })
    .optional(),

  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' })
    .max(100, { message: 'Password cannot exceed 100 characters.' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter.',
    })
    .regex(/\d/, { message: 'Password must contain at least one number.' })
    .regex(/[^a-z0-9]/i, {
      message: 'Password must contain at least one special character.',
    })
    .optional(),

  provider: z
    .string()
    .min(1, { message: 'Provider is required.' })
    .max(50, { message: 'Provider cannot exceed 50 characters.' }),

  providerAccountId: z
    .string()
    .min(1, { message: 'Provider account ID is required.' })
    .max(100, { message: 'Provider account ID cannot exceed 100 characters.' }),
});

export const OAuthSignInSchema = z.object({
  provider: z.enum(['github', 'google']),
  providerAccountId: z.string().min(1, { message: 'Provider account ID is required.' }),
  user: z.object({
    name: z.string().min(1, { message: 'Name is required.' }).max(50, { message: 'Name cannot exceed 50 characters.' }),
    username: z.string().min(3, { message: 'Username must be at least 3 characters long.' }).max(30, { message: 'Username cannot exceed 30 characters.' }),
    email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Please provide a valid email address.' }),
    image: z.string().url({ message: 'Please provide a valid image URL.' }).optional(),
  }),
});

export const GetTagQuestionsSchema = PaginatedSearchParamsSchema.extend({
  tagId: z.string().min(1, { message: 'Tag ID is required.' }),
});

export const IncrementViewsSchema = z.object({
  questionId: z.string().min(1, { message: 'Question ID is required.' }),
});

export const AnswerSchema = z.object({
  content: z
    .string()
    .min(100, { message: 'Answer has to have more than 100 characters.' }),
});

export const CreateAnswerSchema = AnswerSchema.extend({
  questionId: z.string().min(1, { message: 'Question ID is required.' }),
});

export const GetQuestionAnswersSchema = PaginatedSearchParamsSchema.extend({
  questionId: z.string().min(1, { message: 'Question ID is required.' }),
});

export const AIAnswerSchema = z.object({
  question: z.string().min(1, { message: 'Question is required.' }),
  content: z.string().min(1, { message: 'Content is required.' }),
  userAnswer: z.string().optional(),
});
