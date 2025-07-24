'use client';

import { useQueryState } from 'nuqs';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Filter = {
  name: string;
  value: string;
};

type Props = {
  filterParam?: string;
  filters: Filter[];
  otherClasses?: string;
  containerClasses?: string;
};

export function CommonFilter(props: Props) {
  const { filterParam = 'filter', filters, otherClasses, containerClasses } = props;

  const [active, setActive] = useQueryState(filterParam, {
    defaultValue: '',
    parse: value => value as string,
    shallow: false,
  });

  const handleUpdateParams = (value: string) => {
    setActive(value);
  };

  return (
    <div className={cn('relative', containerClasses)}>
      <Select
        onValueChange={handleUpdateParams}
        defaultValue={active || undefined}
      >
        <SelectTrigger
          className={cn(
            'body-regular no-focus light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5',
            otherClasses,
          )}
          aria-label="Filter options"
        >
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select a filter" />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {filters.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
