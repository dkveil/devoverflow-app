import Image from 'next/image';
import Link from 'next/link';

import ROUTES from '@/constants/routes';
import { getDeviconIcon, getTagDescription } from '@/lib/utils';

import { Badge } from '../ui/badge';

type Props = Tag & {
  showCount?: boolean;
  compact?: boolean;
  remove?: boolean;
  isButton?: boolean;
  handleRemove?: () => void;
};

export function TagCard(props: Props) {
  const { _id, name, questions, showCount, compact, remove, isButton, handleRemove } = props;

  const iconClass = getDeviconIcon(name);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const Content = (
    <>
      <Badge className="subtle-medium background-light800_dark300 text-light400_light500 flex flex-row gap-2 rounded-md border-none px-4 py-2 uppercase">
        <div className="flex-center space-x-2">
          <i className={`${iconClass} text-sm`}></i>
          <span>{name}</span>
        </div>

        {remove && (
          <Image
            src="/icons/close.svg"
            width={12}
            height={12}
            alt="close icon"
            className="cursor-pointer object-contain invert-0 dark:invert"
            onClick={handleRemove}
          />
        )}
      </Badge>

      {showCount && (
        <p className="small-medium text-dark500_light700">{questions}</p>
      )}
    </>
  );

  if (compact) {
    return isButton
      ? (
          <button
            type="button"
            onClick={handleClick}
            className="flex justify-between gap-2"
          >
            {Content}
          </button>
        )
      : (
          <Link href={ROUTES.TAG_DETAILS(_id)} className="flex justify-between gap-2">
            {Content}
          </Link>
        );
  }

  const description = getTagDescription(name);

  return (
    <Link href={ROUTES.TAG_DETAILS(_id)} className="background-light800_darkgradient flex w-full flex-col gap-4 rounded-lg p-6 hover:shadow-lg transition-all">
      <article className="w-full">
        <div className="flex items-center gap-3">
          <i className={`${iconClass} text-2xl text-primary-500`}></i>
          <h3 className="h3-bold text-dark200_light800 uppercase">{name}</h3>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-dark200_light800 body-regular line-clamp-2">{description}</p>

          {questions !== undefined && (
            <div className="flex items-center gap-2 rounded-full bg-light-700 px-5 py-2 dark:bg-dark-400">
              <span className="text-dark400_light700 small-medium">{questions}</span>
              <span className="text-dark400_light700 small-regular">questions</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};
