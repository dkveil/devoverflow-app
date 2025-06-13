import type { Document, Types } from 'mongoose';

import { model, models, Schema } from 'mongoose';

export type IVote = {
  author: Types.ObjectId;
  id: Types.ObjectId;
  type: 'question' | 'answer';
  voteType: 'upvote' | 'downvote';
};

export type IVoteDoc = Document & IVote;

const VoteSchema = new Schema<IVote>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  id: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ['question', 'answer'], required: true },
  voteType: { type: String, enum: ['upvote', 'downvote'], required: true },
}, { timestamps: true });

const Vote = models?.Vote || model<IVote>('Vote', VoteSchema);

export default Vote;
