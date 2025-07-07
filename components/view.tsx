'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

import { incrementViews } from '@/lib/actions/question.action';

type Props = {
  questionId: string;
};

export function View(props: Props) {
  const { questionId } = props;

  const handleIncrementViews = async () => {
    const { success } = await incrementViews({ questionId });

    if (!success) {
      toast.error('Failed to increment views');
    }
  };

  useEffect(() => {
    handleIncrementViews();
  }, []);

  return null;
}
