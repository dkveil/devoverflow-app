import Link from 'next/link';
import { notFound } from 'next/navigation';
import { after } from 'next/server';
import React, { Suspense } from 'react';

import { AllAnswers } from '@/components/answers/all-answers';
import { TagCard } from '@/components/cards/tag-card';
import { Preview } from '@/components/editor/preview';
import { AnswerForm } from '@/components/forms/answers-form';
import { Metric } from '@/components/metric';
import { SaveQuestions, SaveQuestionsSkeleton } from '@/components/questions/save-questions';
import { UserAvatar } from '@/components/user-avatar';
import { Votes, VotesSkeleton } from '@/components/votes/votes';
import ROUTES from '@/constants/routes';
import { getQuestionAnswers } from '@/lib/actions/answer.action';
import { hasSavedQuestion } from '@/lib/actions/collection.action';
import { getQuestion, incrementViews } from '@/lib/actions/question.action';
import { hasVoted } from '@/lib/actions/vote.action';
import { formatNumber, getTimeStamp } from '@/lib/utils';

export default async function QuestionDetails({ params }: RouteParams) {
  const { id: questionId } = await params;

  const [{ success, data: question }, { success: answersLoadedSuccess, data: answersResult }, { success: savedSuccess, data: savedResult }] = await Promise.all([
    getQuestion({ questionId }),
    getQuestionAnswers({ questionId }),
    hasSavedQuestion({ questionId }),
  ]);

  const hasVotedPromise = hasVoted({ targetId: questionId, targetType: 'question' });

  after(async () => {
    await incrementViews({ questionId });
  });

  if (!success || !question) {
    return notFound();
  }

  const { author, createdAt, answers, views, tags, content, title, upvotes, downvotes } = question;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id}
              name={author.name}
              image={author.image || ''}
              className="size-[22px]"
              fallbackClassName="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>

          <div className="flex justify-end">
            <Suspense fallback={<VotesSkeleton />}>
              <Votes
                upvotes={upvotes}
                downvotes={downvotes}
                targetId={questionId}
                targetType="question"
                hasVotedPromise={hasVotedPromise}
              />
            </Suspense>

            <Suspense fallback={<SaveQuestionsSkeleton />}>
              <SaveQuestions questionId={questionId} hasSaved={(savedSuccess && savedResult?.saved) || false} />
            </Suspense>
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
          {title}
        </h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(new Date(createdAt))}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag: Tag) => (
          <TagCard
            key={tag._id}
            _id={tag._id as string}
            name={tag.name}
            compact
          />
        ))}
      </div>

      <section className="my-5">
        <AllAnswers success={answersLoadedSuccess} data={answersResult} />
      </section>

      <section className="my-5">
        <AnswerForm questionId={questionId} questionTitle={title} questionContent={content} />
      </section>
    </>
  );
};
