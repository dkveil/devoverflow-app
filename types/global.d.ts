import type { NextResponse } from 'next/server';

declare global {
  type Tag = {
    _id: string;
    name: string;
    questions?: number;
  };

  type Author = {
    _id: string;
    name: string;
    image: string;
  };

  type Question = {
    _id: string;
    title: string;
    description: string;
    content: string;
    tags: Tag[];
    author: Author;
    upvotes: number;
    downvotes: number;
    answers: number;
    views: number;
    createdAt: Date;
  };

  type Answer = {
    _id: string;
    content: string;
    author: Author;
    upvotes: number;
    downvotes: number;
    createdAt: Date;
    question: Question;
  };

  type ActionResponse<T = null> = {
    success: boolean;
    data?: T;
    status?: number;
    error?: ActionResponseError;
  };

  type ActionResponseError = {
    message: string;
    details?: Record<string, string[]>;
  };

  type SuccessResponse<T = null> = ActionResponse<T> & {
    success: true;
  };

  type ErrorResponse = ActionResponse<undefined> & {
    success: false;
  };

  type APIErrorResponse = NextResponse<ErrorResponse>;

  type APIResponse<T = null> = SuccessResponse<T> | ErrorResponse;

  type RouteParams = {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string>>;
  };

  type PaginatedSearchParams = {
    page?: number;
    pageSize?: number;
    query?: string;
    filter?: string;
    sortBy?: string;
  };

  type GetTagQuestionsParams = PaginatedSearchParams & {
    tagId: string;
  };

  type IncrementViewsParams = {
    questionId: string;
  };

  type Pagination = {
    page: number;
    pageSize: number;
    totalPages: number;
    total: number;
    isPrev: boolean;
    isNext: boolean;
  };

  type CreateAnswerParams = {
    content: string;
    questionId: string;
  };

  type GetQuestionAnswersParams = PaginatedSearchParams & {
    questionId: string;
  };

  type AIAnswerData = {
    answer: string;
  };

  type AIAnswerRequest = {
    question: string;
    content: string;
    userAnswer: string;
  };

  type AIAnswerResponse = ActionResponse<AIAnswerData>;

  type AIAnswerSuccessResponse = SuccessResponse<AIAnswerData>;

  type AIAnswerErrorResponse = ErrorResponse;

  type User = {
    _id: string;
    name: string;
    username: string;
    email: string;
    image: string;
    bio: string;
    location: string;
    portfolio: string;
    reputation: number;
    socialLinks: {
      github: string;
      twitter: string;
      linkedin: string;
      website: string;
    };
    createdAt: Date;
  };

  type Collection = {
    _id: string;
    author: string | Author;
    question: Question;
  };

  type BadgeCounts = {
    GOLD: number;
    SILVER: number;
    BRONZE: number;
  };

  type Badges = {
    GOLD: number;
    SILVER: number;
    BRONZE: number;
  };

  type Job = {
    id?: string;
    employer_name?: string;
    employer_logo?: string | undefined;
    employer_website?: string;
    job_employment_type?: string;
    job_title?: string;
    job_description?: string;
    job_apply_link?: string;
    job_city?: string;
    job_state?: string;
    job_country?: string;
  };

  type Country = {
    name: {
      common: string;
    };
  };
}

export {};
