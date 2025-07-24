'use client';

import { useQueryState } from 'nuqs';

import { Button } from './ui/button';

type Props = Pagination;

export function Pagination(props: Props) {
  const { page, pageSize: _pageSize, totalPages, total, isPrev, isNext } = props;

  const [currentPage, setCurrentPage] = useQueryState('page', {
    defaultValue: 1,
    parse: value => Number(value),
    shallow: false,
  });

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && isPrev) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && isNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <div className="flex items-center justify-center gap-2">
        <Button
          disabled={!isPrev}
          onClick={() => handleNavigation('prev')}
          className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
        >
          <p className="body-medium text-dark200_light800">Prev</p>
        </Button>

        <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2">
          <p className="body-semibold text-light-900">{page}</p>
        </div>

        <Button
          disabled={!isNext}
          onClick={() => handleNavigation('next')}
          className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
        >
          <p className="body-medium text-dark200_light800">Next</p>
        </Button>
      </div>

      <p className="body-regular text-dark400_light700">
        Page
        {' '}
        {page}
        {' '}
        of
        {' '}
        {totalPages}
        {' '}
        •
        {' '}
        {total}
        {' '}
        total results
        {' '}
        total results
      </p>
    </div>
  );
}
