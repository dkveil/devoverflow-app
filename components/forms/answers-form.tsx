'use client';

import type { MDXEditorMethods } from '@mdxeditor/editor';
import type { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { createAnswer } from '@/lib/actions/answer.action';
import { api } from '@/lib/api';
import { AnswerSchema } from '@/lib/validations';

const Editor = dynamic(() => import('@/components/editor'), {
  ssr: false,
});

type Props = {
  questionId: string;
  questionTitle: string;
  questionContent: string;
};

export function AnswerForm(props: Props) {
  const { questionId, questionTitle, questionContent } = props;

  const session = useSession();

  const [isAISubmitting, setIsAISubmitting] = useState(false);
  const [isAnswerPending, startAnswerTransition] = useTransition();

  const editorRef = useRef<MDXEditorMethods>(null);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema as any),
    defaultValues: {
      content: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    startAnswerTransition(async () => {
      const { content } = values;

      const result = await createAnswer({
        content,
        questionId,
      });

      if (result.success) {
        form.reset();

        toast.success('Success', {
          description: 'Your answer has been posted successfully',
        });

        if (editorRef.current) {
          editorRef.current.setMarkdown('');
        }
      } else {
        toast.error(`Error: ${result.status}`, {
          description: result.error?.message || 'Something went wrong',
        });
      }
    });
  };

  const generateAIAnswer = async () => {
    if (session?.status !== 'authenticated') {
      toast.error('You must be logged in to generate an AI answer');
      return;
    }

    setIsAISubmitting(true);

    const userAnswer = editorRef.current?.getMarkdown() || '';

    try {
      const { success, data, error } = await api.ai.getAnswer(questionTitle, questionContent, userAnswer);

      if (!success) {
        throw new Error(error?.message || 'Something went wrong');
      }

      const formattedAnswer = data?.answer.replace(/^# /, '').replace(/<br>/g, ' ').trim().toString() || '';

      if (editorRef.current) {
        editorRef.current.setMarkdown(formattedAnswer);
      }

      form.setValue('content', formattedAnswer);
      form.trigger('content');
    } catch (error) {
      toast.error('Error generating AI answer', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsAISubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
        <Button
          className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
          disabled={isAISubmitting}
          onClick={generateAIAnswer}
        >
          {isAISubmitting
            ? (
                <>
                  <LoaderIcon className="mr-2 size-4 animate-spin" />
                  Generating...
                </>
              )
            : (
                <>
                  <Image
                    src="/icons/stars.svg"
                    alt="Generate AI Answer"
                    width={12}
                    height={12}
                    className="object-contain"
                  />
                  Generate AI Answer
                </>
              )}
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-6 flex w-full flex-col gap-10"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormControl className="mt-3.5">
                  <Editor
                    value={field.value}
                    editorRef={editorRef}
                    fieldChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" className="primary-gradient w-fit">
              {isAnswerPending
                ? (
                    <>
                      <LoaderIcon className="mr-2 size-4 animate-spin" />
                      Posting...
                    </>
                  )
                : (
                    'Post Answer'
                  )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
