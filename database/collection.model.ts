import type { Document, Types } from 'mongoose';

import { model, models, Schema } from 'mongoose';

export type ICollection = {
  author: Types.ObjectId;
  question: Types.ObjectId;
};

export type ICollectionDoc = Document & ICollection;

const CollectionSchema = new Schema<ICollection>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
}, { timestamps: true });

const Collection = models?.Collection || model<ICollection>('Collection', CollectionSchema);

export default Collection;
