'use client';

import { useQueryState } from 'nuqs';

import { GlobalSearchFilters } from '@/constants/filters';

export function GlobalFilter() {
  const [active, setActive] = useQueryState('type', {
    defaultValue: '',
    parse: value => value as string,
    shallow: false,
  });

  const handleTypeClick = (item: string) => {
    if (active === item) {
      setActive('');
    } else {
      setActive(item.toLowerCase());
    }
  };

  return (
    <div className="flex items-center gap-5 px-5">
      <p className="text-dark400_light900 body-medium">Type:</p>
      <div className="flex gap-3">
        {GlobalSearchFilters.map(item => (
          <button
            type="button"
            key={item.value}
            className={`light-border-2 small-medium rounded-2xl px-5 py-2 capitalize ${
              active === item.value
                ? 'bg-primary-500 text-light-900'
                : 'bg-light-700 text-dark-400 hover:text-primary-500 dark:bg-dark-500 dark:text-light-800 dark:hover:text-primary-500'
            }`}
            onClick={() => handleTypeClick(item.value)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};
