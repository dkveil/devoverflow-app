import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import ROUTES from '@/constants/routes';
import { getHotQuestions } from '@/lib/actions/question.action';
import { getPopularTags } from '@/lib/actions/tag.action';

import { TagCard } from '../cards/tag-card';

export async function RightSidebar() {
  const [{ success: _hotQuestionsSuccess, data: hotQuestionsData }, { success: _popularTagsSuccess, data: popularTagsData }] = await Promise.all([getHotQuestions(), getPopularTags()]);

  return (
    <section className="pt-36 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark200_light900 uppercase">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestionsData?.map(({ _id, title }) => (
            <Link
              key={_id}
              href={ROUTES.PROFILE(_id)}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">{title}</p>

              <Image
                src="/icons/chevron-right.svg"
                alt="Chevron"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900 uppercase">Popular Tags</h3>

        <div className="mt-7 flex flex-col gap-4">
          {popularTagsData?.map(({ _id, name, questions }) => (
            <TagCard
              key={_id}
              _id={_id}
              name={name}
              questions={questions}
              showCount
              compact
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
