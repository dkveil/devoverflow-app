'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

import { toggleQuestionInCollection } from '@/lib/actions/collection.action';
import { cn } from '@/lib/utils';

import { Skeleton } from '../ui/skeleton';

export function SaveQuestionsSkeleton() {
  return (
    <div className="flex-center gap-2.5">
      <Skeleton className="h-4 w-4" />
    </div>
  );
}

type Props = {
  questionId: string;
  hasSaved: boolean;
};

export function SaveQuestions(props: Props) {
  const { questionId, hasSaved } = props;

  const session = useSession();
  const userId = session.data?.user?.id;

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!userId) return toast.error('Please sign in to save questions');

    setIsLoading(true);

    try {
      const { success, data, error } = await toggleQuestionInCollection({ questionId });

      if (!success) throw new Error(error?.message || 'Failed to save question');

      toast.success(data?.saved ? 'Question saved' : 'Question removed from collection');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Image
      src={hasSaved ? '/icons/star-filled.svg' : '/icons/star.svg'}
      alt="save"
      width={18}
      height={18}
      className={cn(
        'cursor-pointer',
        isLoading && 'animate-pulse',
      )}
      aria-label="save question"
      onClick={handleSave}
    />
  );
}
