import Link from 'next/link';

import ROUTES from '@/constants/routes';
import { getDeviconIcon } from '@/lib/utils';

import { Badge } from '../ui/badge';

type Props = Tag & {
  showCount?: boolean;
  compact?: boolean;
};

export function TagCard(props: Props) {
  const { _id, name, questions, showCount } = props;

  const iconClass = getDeviconIcon(name);

  return (
    <Link href={ROUTES.TAGS(_id)} className="flex justify-between gap-2">
      <Badge className="subtle-medium background-light800_dark300 text-light400_light500 border-none px-4 py-2 uppercase">
        <div className="flex-center space-x-2">
          <i className={`${iconClass} text-sm`}></i>
          <span>{name}</span>
        </div>
      </Badge>

      {showCount && (
        <p className="small-medium text-dark500_light700">{questions}</p>
      )}
    </Link>
  );
};
