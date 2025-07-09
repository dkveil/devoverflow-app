type SignInWithOAuthParams = {
  provider: 'github' | 'google';
  providerAccountId: string;
  user: {
    name: string;
    username: string;
    email: string;
    image: string;
  };
};

type AuthCredentials = {
  name: string;
  username: string;
  email: string;
  password: string;
};

type CreateQuestionParams = {
  title: string;
  description?: string;
  content: string;
  tags: string[];
};

type UpdateQuestionParams = {
  questionId: string;
  title: string;
  description?: string;
  content: string;
  tags: string[];
};

type GetQuestionParams = {
  questionId: string;
};

type CreateVoteParams = {
  targetId: string;
  targetType: 'question' | 'answer';
  voteType: 'upvote' | 'downvote';
};

type UpdateVoteCountParams = CreateVoteParams & {
  change: 1 | -1;
};

type HasVotedParams = Pick<CreateVoteParams, 'targetId' | 'targetType'>;

type HasVotedResponse = {
  hasUpvoted: boolean;
  hasDownvoted: boolean;
};
