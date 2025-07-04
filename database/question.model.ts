import type { Document, Types } from 'mongoose';

import { model, models, Schema } from 'mongoose';

export type IQuestion = {
  title: string;
  description: string;
  content: string;
  tags: Types.ObjectId[];
  views: number;
  upvotes: number;
  downvotes: number;
  answers: number;
  author: Types.ObjectId;
};

export type IQuestionDoc = Document & IQuestion;

const QuestionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    content: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    answers: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

const Question = models?.Question || model<IQuestion>('Question', QuestionSchema);

export default Question;
