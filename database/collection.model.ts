import type { Document, Types } from 'mongoose';

import { model, models, Schema } from 'mongoose';

export type ICollection = {
  author: Types.ObjectId;
  questions: Types.ObjectId[];
};

export type ICollectionDoc = Document & ICollection;

const CollectionSchema = new Schema<ICollection>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
}, { timestamps: true });

const Collection = models?.Collection || model<ICollection>('Collection', CollectionSchema);

export default Collection;
