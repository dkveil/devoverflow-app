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
    answers: number;
    views: number;
    createdAt: Date;
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
}

export {};
