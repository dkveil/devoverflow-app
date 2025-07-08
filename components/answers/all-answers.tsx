import type { GetQuestionAnswersResponse } from '@/lib/actions/answer.action';

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
        <p>Filters</p>
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
    </div>
  );
}
