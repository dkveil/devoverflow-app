import type { Document, Types } from 'mongoose';

import { model, models, Schema } from 'mongoose';

export type ITagQuestion = {
  tag: Types.ObjectId;
  question: Types.ObjectId;
};

export type ITagQuestionDoc = Document & ITagQuestion;

const TagQuestionSchema = new Schema<ITagQuestion>(
  {
    tag: { type: Schema.Types.ObjectId, ref: 'Tag', required: true },
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  },
  { timestamps: true },
);

const TagQuestion
  = models?.TagQuestion || model<ITagQuestion>('TagQuestion', TagQuestionSchema);

export default TagQuestion;
