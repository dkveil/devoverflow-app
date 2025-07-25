'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useQueryState } from 'nuqs';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { LocalSearch } from '../search/local-search';

type JobsFilterProps = {
  countriesList?: Country[];
};

export function JobsFilter({ countriesList = [] }: JobsFilterProps) {
  const pathname = usePathname();

  const [location, setLocation] = useQueryState('location', {
    defaultValue: '',
    parse: value => value as string,
    shallow: false,
  });

  const handleUpdateParams = (value: string) => {
    setLocation(value);
  };

  return (
    <div className="relative mt-11 flex w-full justify-between gap-5 max-sm:flex-col sm:items-center">
      <LocalSearch
        route={pathname}
        iconPosition="left"
        imgSrc="/icons/job-search.svg"
        placeholder="Job Title, Company, or Keywords"
        otherClasses="flex-1 max-sm:w-full"
      />

      <Select
        onValueChange={handleUpdateParams}
        defaultValue={location || undefined}
      >
        <SelectTrigger className="body-regular light-border background-light800_dark300 text-dark500_light700 line-clamp-1 flex min-h-[56px] items-center gap-3 border p-4 sm:max-w-[210px]">
          <Image
            src="/icons/carbon-location.svg"
            alt="location"
            width={18}
            height={18}
          />
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select Location" />
          </div>
        </SelectTrigger>

        <SelectContent className="body-semibold max-h-[350px] max-w-[250px]">
          <SelectGroup>
            {countriesList && countriesList.length > 0
              ? countriesList.map((country: Country) => (
                  <SelectItem
                    key={country.name.common}
                    value={country.name.common}
                    className="px-4 py-3"
                  >
                    {country.name.common}
                  </SelectItem>
                ))
              : (
                  <SelectItem value="no-results" disabled>
                    No results found
                  </SelectItem>
                )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
