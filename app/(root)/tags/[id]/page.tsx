import { QuestionCard } from '@/components/cards/question-card';
import { DataRenderer } from '@/components/data-redenderer';
import { CommonFilter } from '@/components/filters/common-filter';
import { HomeFilter } from '@/components/filters/home-filter';
import { Pagination } from '@/components/pagination';
import { LocalSearch } from '@/components/search/local-search';
import { questionFilters } from '@/constants/filters';
import ROUTES from '@/constants/routes';
import { EMPTY_QUESTIONS } from '@/constants/states';
import { getTagQuestions } from '@/lib/actions/tag.action';

export default async function TagQuestions({ params, searchParams }: RouteParams) {
  const { id } = await params;
  const { page = 1, pageSize = 10, query = '', sortBy = 'newest' } = await searchParams;

  const { success, data, error } = await getTagQuestions({ tagId: id, page: Number(page), pageSize: Number(pageSize), query, sortBy });

  const { questions, tag, pagination } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl capitalize">{tag?.name}</h1>

      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route={ROUTES.TAG_DETAILS(id)}
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={questionFilters}
          filterParam="sortBy"
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </section>

      <HomeFilter filterParam="sortBy" />

      <DataRenderer
        success={success}
        data={questions}
        error={error}
        emptyState={EMPTY_QUESTIONS}
        render={questions => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {(questions as Question[]).map(question => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />

      {pagination && (
        <div className="mt-10">
          <Pagination {...pagination} />
        </div>
      )}
    </>
  );
}
