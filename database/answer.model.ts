import type { Document, Types } from 'mongoose';

import { model, models, Schema } from 'mongoose';

export type IAnswer = {
  author: Types.ObjectId;
  question: Types.ObjectId;
  content: string;
  upvotes: number;
  downvotes: number;
};

export type IAnswerDoc = Document & IAnswer;

const AnswerSchema = new Schema<IAnswer>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Answer = models?.Answer || model<IAnswer>('Answer', AnswerSchema);

export default Answer;
