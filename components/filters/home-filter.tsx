'use client';

import { useQueryState } from 'nuqs';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

type Props = {
  filters?: { name: string; value: string }[];
  filterParam?: string;
};

const defaultFilters = [
  { name: 'Newest', value: 'newest' },
  { name: 'Oldest', value: 'oldest' },
  { name: 'Popular', value: 'popular' },
];

export function HomeFilter(props: Props) {
  const { filters = defaultFilters, filterParam = 'filter' } = props;

  const [active, setActive] = useQueryState(filterParam, {
    defaultValue: '',
    parse: value => value as string,
    shallow: false,
  });

  const handleTypeClick = (value: string) => {
    if (active === value) {
      setActive('');
    } else {
      setActive(value);
    }
  };

  return (
    <div className="mt-10 hidden flex-wrap gap-3 sm:flex">
      {filters.map(filter => (
        <Button
          key={filter.name}
          onClick={() => handleTypeClick(filter.value)}
          className={cn(
            'body-medium rounded-lg px-6 py-3 capitalize shadow-none',
            active === filter.value
              ? 'bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400'
              : 'bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-300',
          )}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  );
}
