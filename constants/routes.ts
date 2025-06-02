const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  COMMUNITY: '/community',
  PROFILE: (id: string) => `/profile/${id}`,
  COLLECTIONS: '/collections',
  JOBS: '/jobs',
  TAGS: (id: string) => `/tags/${id}`,
  ASK_QUESTION: '/ask-question',
  QUESTION_DETAILS: (id: string) => `/question/${id}`,
};

export default ROUTES;
