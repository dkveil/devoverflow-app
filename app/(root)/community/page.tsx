import { UserCard } from '@/components/cards/user-card';
import { DataRenderer } from '@/components/data-redenderer';
import { HomeFilter } from '@/components/filters/home-filter';
import { LocalSearch } from '@/components/search/local-search';
import ROUTES from '@/constants/routes';
import { EMPTY_USERS } from '@/constants/states';
import { getAllUsers } from '@/lib/actions/user.action';

export default async function Community({ searchParams }: RouteParams) {
  const { page = 1, pageSize = 10, query = '', sortBy = 'newest' } = await searchParams;

  const { success, data, error } = await getAllUsers({ page: Number(page), pageSize: Number(pageSize), query, sortBy });

  const { users } = data || {};

  return (
    <section className="flex w-full flex-col justify-between gap-4">
      <h1 className="h1-bold text-dark100_light900">Community</h1>

      <section className="mt-11">
        <LocalSearch
          route={ROUTES.COMMUNITY}
          imgSrc="/icons/search.svg"
          placeholder="Search users..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter />

      <DataRenderer<User>
        success={success}
        data={users}
        error={error}
        emptyState={EMPTY_USERS}
        render={() => (
          <div className="mt-10 flex flex-wrap gap-4">
            {(users as User[]).map(user => <UserCard key={user._id} {...user} />)}
          </div>
        )}
      />
    </section>
  );
}
