import { QuestionCard } from '@/components/cards/question-card';
import { DataRenderer } from '@/components/data-redenderer';
import { HomeFilter } from '@/components/filters/home-filter';
import { LocalSearch } from '@/components/search/local-search';
import { ROUTES } from '@/constants';
import { EMPTY_QUESTIONS } from '@/constants/states';
import { getUserCollection } from '@/lib/actions/collection.action';

export default async function Collections({ searchParams }: RouteParams) {
  const { page = 1, pageSize = 10, query = '', sortBy = 'popular' } = await searchParams;

  const { success, data, error } = await getUserCollection({
    page: Number(page),
    pageSize: Number(pageSize),
    query,
    sortBy,
  });

  const { collection } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>

      <section className="mt-11">
        <LocalSearch
          route={ROUTES.COLLECTIONS}
          imgSrc="/icons/search.svg"
          placeholder="Search collections..."
          otherClasses="flex-1"
        />
      </section>

      <HomeFilter filterParam="sortBy" />

      <DataRenderer<Collection>
        success={success}
        error={error}
        data={collection}
        emptyState={EMPTY_QUESTIONS}
        render={collection => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {Array.isArray(collection)
              ? collection.map(item => (
                  <QuestionCard key={item._id} question={item.question} />
                ))
              : null}
          </div>
        )}
      />
    </>
  );
}
