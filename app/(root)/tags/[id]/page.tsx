import { QuestionCard } from '@/components/cards/question-card';
import { DataRenderer } from '@/components/data-redenderer';
import { HomeFilter } from '@/components/filters/home-filter';
import { LocalSearch } from '@/components/search/local-search';
import ROUTES from '@/constants/routes';
import { EMPTY_QUESTIONS } from '@/constants/states';
import { getTagQuestions } from '@/lib/actions/tag.action';

export default async function TagQuestions({ params, searchParams }: RouteParams) {
  const { id } = await params;
  const { page = 1, pageSize = 10, query = '' } = await searchParams;

  const { success, data, error } = await getTagQuestions({ tagId: id, page: Number(page), pageSize: Number(pageSize), query });

  const { questions, tag } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl capitalize">{tag?.name}</h1>

      <section className="mt-11">
        <LocalSearch
          route={ROUTES.TAG_DETAILS(id)}
          imgSrc="/icons/search.svg"
          placeholder="Search tags..."
          otherClasses="flex-1"
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
    </>
  );
}
