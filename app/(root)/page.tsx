import Link from 'next/link';

import { QuestionCard } from '@/components/cards/question-card';
import { DataRenderer } from '@/components/data-redenderer';
import { HomeFilter } from '@/components/filters/home-filter';
import { LocalSearch } from '@/components/search/local-search';
import { Button } from '@/components/ui/button';
import ROUTES from '@/constants/routes';
import { EMPTY_QUESTIONS } from '@/constants/states';
import { getQuestions } from '@/lib/actions/question.action';

const filters = [
  { name: 'Newest', value: 'newest' },
  { name: 'Oldest', value: 'oldest' },
  { name: 'Popular', value: 'popular' },
];

export default async function Home({ searchParams }: RouteParams) {
  const { page = 1, pageSize = 10, query = '', filter = '', sortBy = 'newest' } = await searchParams;

  const { success, data, error } = await getQuestions({ page: Number(page), pageSize: Number(pageSize), query, filter, sortBy, excludeContent: true });

  const { questions } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter filters={filters} />

      <DataRenderer
        success={success}
        data={questions}
        error={error}
        emptyState={EMPTY_QUESTIONS}
        render={() => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions && questions.length > 0
              ? questions.map(question => (
                  <QuestionCard key={question._id} question={question} />
                ))
              : (
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-dark200_light800">No questions found</p>
                  </div>
                )}
          </div>
        )}
      />

    </>
  );
}
