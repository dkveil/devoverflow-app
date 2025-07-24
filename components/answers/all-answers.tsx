import type { GetQuestionAnswersResponse } from '@/lib/actions/answer.action';

import { CommonFilter } from '@/components/filters/common-filter';
import { Pagination } from '@/components/pagination';
import { answerFilters } from '@/constants/filters';
import { EMPTY_ANSWERS } from '@/constants/states';

import { AnswerCard } from '../cards/answer-card';
import { DataRenderer } from '../data-redenderer';

type Props = ActionResponse<GetQuestionAnswersResponse>;

export function AllAnswers({ success, data, error }: Props) {
  if (!success || !data) {
    return null;
  }

  const { answers, pagination } = data;

  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {pagination.total}
          {' '}
          {pagination.total === 1 ? 'Answer' : 'Answers'}
        </h3>

        <CommonFilter
          filters={answerFilters}
          filterParam="sortBy"
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>
      <DataRenderer
        data={answers}
        error={error}
        success={success}
        emptyState={EMPTY_ANSWERS}
        render={answers =>
          Array.isArray(answers)
            ? answers.map(answer => <AnswerCard key={answer._id} {...answer} />)
            : <AnswerCard {...answers} />}
      />

      {pagination && (
        <div className="mt-10">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
