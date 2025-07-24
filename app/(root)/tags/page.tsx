import { TagCard } from '@/components/cards/tag-card';
import { DataRenderer } from '@/components/data-redenderer';
import { CommonFilter } from '@/components/filters/common-filter';
import { HomeFilter } from '@/components/filters/home-filter';
import { Pagination } from '@/components/pagination';
import { LocalSearch } from '@/components/search/local-search';
import { ROUTES } from '@/constants';
import { tagFilters } from '@/constants/filters';
import { EMPTY_TAGS } from '@/constants/states';
import { getTags } from '@/lib/actions/tag.action';

export default async function Tags({ searchParams }: RouteParams) {
  const { page = 1, pageSize = 10, query = '', sortBy = 'popular' } = await searchParams;

  const { success, data, error } = await getTags({
    page: Number(page),
    pageSize: Number(pageSize),
    query,
    sortBy,
  });

  const { tags, pagination } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>

      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route={ROUTES.TAGS}
          imgSrc="/icons/search.svg"
          placeholder="Search tags..."
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={tagFilters}
          filterParam="sortBy"
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </section>

      <HomeFilter filterParam="sortBy" />

      <DataRenderer<Tag>
        success={success}
        error={error}
        data={tags}
        emptyState={EMPTY_TAGS}
        render={tags => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {(tags as Tag[]).map(tag => (
              <TagCard key={tag._id} {...tag} />
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
