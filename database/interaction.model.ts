import type { Document, Types } from 'mongoose';

import { model, models, Schema } from 'mongoose';

export const InteractionActionEnums = [
  'view',
  'upvote',
  'downvote',
  'bookmark',
  'post',
  'edit',
  'delete',
  'search',
] as const;

export type IInteraction = {
  user: Types.ObjectId;
  action: (typeof InteractionActionEnums)[number];
  actionId: Types.ObjectId;
  actionType: 'question' | 'answer';
};

export type IInteractionDoc = Document & IInteraction;

const InteractionSchema = new Schema<IInteraction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: InteractionActionEnums,
      required: true,
    },
    actionId: { type: Schema.Types.ObjectId, required: true },
    actionType: { type: String, enum: ['question', 'answer'], required: true },
  },
  { timestamps: true },
);

const Interaction
  = models?.Interaction || model<IInteraction>('Interaction', InteractionSchema);

export default Interaction;
