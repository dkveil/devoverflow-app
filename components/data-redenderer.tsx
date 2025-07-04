import Link from 'next/link';

import { DEFAULT_EMPTY, DEFAULT_ERROR } from '@/constants/states';

import { Button } from './ui/button';

type State = {
  title: string;
  message: string;
  button: {
    text: string;
    link: string;
  };
};

type Props<T> = {
  success: boolean;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  data: T | T[] | null | undefined;
  emptyState?: State;
  errorState?: State;
  render: (data: T | T[]) => React.ReactNode;
};

function StateSkeleton(props: State) {
  const { title, message, button } = props;

  return (
    <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-4">
      <h2 className="h2-bold text-dark200_light800">{title}</h2>
      <p className="text-dark200_light800 body-regular">{message}</p>
      <Button
        className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
        asChild
      >
        <Link href={button.link}>{button.text}</Link>
      </Button>
    </div>
  );
}

export function DataRenderer<T,>(props: Props<T>) {
  const { success, data, error, emptyState = DEFAULT_EMPTY, errorState = DEFAULT_ERROR } = props;

  if (!success || error) {
    return <StateSkeleton {...errorState} />;
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <StateSkeleton {...emptyState} />;
  }

  return props.render(data);
}
