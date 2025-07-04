const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  COMMUNITY: '/community',
  PROFILE: (id: string) => `/profile/${id}`,
  COLLECTIONS: '/collections',
  JOBS: '/jobs',
  TAGS: '/tags',
  TAG_DETAILS: (id: string) => `/tags/${id}`,
  ASK_QUESTION: '/ask-question',
  QUESTION_DETAILS: (id: string) => `/question/${id}`,
  EDIT_QUESTION: (id: string) => `/question/${id}/edit`,
  DELETE_QUESTION: (id: string) => `/question/${id}/delete`,
};

export default ROUTES;
