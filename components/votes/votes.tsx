'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { use, useState } from 'react';
import { toast } from 'sonner';

import { createVote } from '@/lib/actions/vote.action';
import { formatNumber } from '@/lib/utils';

import { Skeleton } from '../ui/skeleton';

type Props = {
  upvotes: number;
  downvotes: number;
  targetId: string;
  targetType: 'question' | 'answer';
  hasVotedPromise: Promise<ActionResponse<HasVotedResponse>>;
};

export function VotesSkeleton() {
  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="flex-center gap-1.5">
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
}

export function Votes(props: Props) {
  const { upvotes, downvotes, targetId, targetType, hasVotedPromise } = props;

  const { success, data } = use(hasVotedPromise);

  const { hasUpvoted, hasDownvoted } = data || {};

  const session = useSession();
  const userId = session.data?.user?.id;

  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!userId)
      return toast.error('Please login to vote', {
        description: 'Only logged-in users can vote.',
      });

    setIsLoading(true);

    try {
      const result = await createVote({
        targetId,
        targetType,
        voteType,
      });

      if (!result.success) {
        throw new Error('Failed to vote');
      }

      const successMessage
        = voteType === 'upvote'
          ? `Upvote ${!hasUpvoted ? 'added' : 'removed'} successfully`
          : `Downvote ${!hasDownvoted ? 'added' : 'removed'} successfully`;

      toast.success(successMessage, {
        description: 'Your vote has been recorded.',
      });
    } catch {
      toast.error('Failed to vote', {
        description: 'An error occurred while voting. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={success && hasUpvoted ? '/icons/upvoted.svg' : '/icons/upvote.svg'}
          width={18}
          height={18}
          alt="upvote"
          className={`cursor-pointer ${isLoading && 'opacity-50'}`}
          aria-label="Upvote"
          onClick={() => !isLoading && handleVote('upvote')}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(upvotes)}
          </p>
        </div>
      </div>

      <div className="flex-center gap-1.5">
        <Image
          src={success && hasDownvoted ? '/icons/downvoted.svg' : '/icons/downvote.svg'}
          width={18}
          height={18}
          alt="downvote"
          className={`cursor-pointer ${isLoading && 'opacity-50'}`}
          aria-label="Downvote"
          onClick={() => !isLoading && handleVote('downvote')}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(downvotes)}
          </p>
        </div>
      </div>
    </div>
  );
};
