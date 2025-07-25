import dayjs from 'dayjs';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { AnswerCard } from '@/components/cards/answer-card';
import { QuestionCard } from '@/components/cards/question-card';
import { TagCard } from '@/components/cards/tag-card';
import { DataRenderer } from '@/components/data-redenderer';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/user-avatar';
import { ProfileLink } from '@/components/user/profie-link';
import { Stats } from '@/components/user/stats';
import { getUser, getUserAnswers, getUserQuestions, getUserTopTags } from '@/lib/actions/user.action';

export default async function Profile({ params, searchParams }: RouteParams) {
  const { id } = await params;
  const { page = 1, pageSize = 10 } = await searchParams;

  if (!id) notFound();

  const loggedInUser = await auth();

  const { success, data, error } = await getUser({ userId: id });

  if (!success) {
    return <div>{error?.message}</div>;
  }

  const { user, totalQuestions, totalAnswers } = data!;
  const { _id, name, image, portfolio, location, createdAt, username, bio } = user;

  const { success: successQuestions, data: dataQuestions, error: errorQuestions } = await getUserQuestions({
    userId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
  });

  const {
    success: userAnswersSuccess,
    data: userAnswers,
    error: userAnswersError,
  } = await getUserAnswers({
    userId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
  });

  const { success: successTopTags, data: dataTopTags, error: errorTopTags } = await getUserTopTags({
    userId: id,
  });

  const { questions, pagination: questionsPagination } = dataQuestions!;
  const { answers, pagination: answersPagination } = userAnswers!;
  const { tags } = dataTopTags!;
  return (
    <>
      <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <UserAvatar
            id={_id}
            name={name}
            image={image}
            className="size-[140px] rounded-full object-cover"
            fallbackClassName="text-6xl fond-bolder"
          />

          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{name}</h2>
            <p className="paragraph-regular text-dark200_light800">
              @
              {username}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              {portfolio && (
                <ProfileLink
                  imgUrl="/icons/link.svg"
                  href={portfolio}
                  title="Portfolio"
                />
              )}
              {location && (
                <ProfileLink imgUrl="/icons/location.svg" title="Portfolio" />
              )}
              <ProfileLink
                imgUrl="/icons/calendar.svg"
                title={dayjs(createdAt).format('MMMM YYYY')}
              />
            </div>

            {bio && (
              <p className="paragraph-regular text-dark400_light800 mt-8">
                {bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          {loggedInUser?.user?.id === id && (
            <Link href="/profile/edit">
              <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-12 min-w-44 px-4 py-3">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </section>

      <Stats
        totalQuestions={totalQuestions}
        totalAnswers={totalAnswers}
        badges={{
          GOLD: 0,
          SILVER: 0,
          BRONZE: 0,
        }}
        points={user.reputation || 0}
      />

      <section className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-[2]">
          <TabsList className="background-light800_dark400 min-h-[42px] p-1">
            <TabsTrigger value="top-posts" className="tab">
              Top Posts
            </TabsTrigger>
            <TabsTrigger value="answers" className="tab">
              Answers
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="top-posts"
            className="mt-5 flex w-full flex-col gap-6"
          >
            <DataRenderer
              data={questions}
              success={successQuestions}
              error={errorQuestions}
              render={questions => (
                <div className="flex w-full flex-col gap-6">
                  {Array.isArray(questions) && questions.map(question => (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      showActionBtns={
                        loggedInUser?.user?.id === question.author._id
                      }
                    />
                  ))}
                </div>
              )}
            />

            <Pagination {...questionsPagination} />
          </TabsContent>
          <TabsContent value="answers" className="flex w-full flex-col gap-6">
            <DataRenderer
              data={answers}
              success={userAnswersSuccess}
              error={userAnswersError}
              render={answers => (
                <div className="flex w-full flex-col gap-6">
                  {Array.isArray(answers) && answers.map(answer => (
                    <AnswerCard
                      key={answer._id}
                      {...answer}
                      content={answer.content.slice(0, 27)}
                      containerClasses="card-wrapper rounded-[10px] px-7 py-9 sm:px-11"
                      showReadMore
                      showActionBtns={
                        loggedInUser?.user?.id === answer.author._id
                      }
                    />
                  ))}
                </div>
              )}
            />

            <Pagination {...answersPagination} />
          </TabsContent>
        </Tabs>

        <div className="flex w-full min-w-[250px] flex-1 flex-col max-lg:hidden">
          <h3 className="h3-bold text-dark200_light900">Top Tech</h3>
          <div className="mt-7 flex flex-col gap-4">
            <DataRenderer
              data={tags}
              success={successTopTags}
              error={errorTopTags}
              render={tags => (
                <div className="mt-3 flex w-full flex-col gap-4">
                  {Array.isArray(tags) && tags.map(tag => (
                    <TagCard
                      key={tag._id}
                      _id={tag._id}
                      name={tag.name}
                      questions={tag.count}
                      showCount
                      compact
                    />
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      </section>
    </>
  );
}
