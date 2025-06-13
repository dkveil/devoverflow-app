import type { Document } from 'mongoose';

import { model, models, Schema } from 'mongoose';

export type ITag = {
  name: string;
  questions: number;
};

export type ITagDoc = Document & ITag;

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true },
    questions: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Tag = models?.Tag || model<ITag>('Tag', TagSchema);

export default Tag;
