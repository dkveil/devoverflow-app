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
}

export {};
