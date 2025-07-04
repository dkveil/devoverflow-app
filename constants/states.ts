import ROUTES from './routes';

export const DEFAULT_EMPTY = {
  title: 'No results found',
  message: 'It seems there is no matching content for your search. Try searching for something else.',
  button: {
    text: 'Ask a question',
    link: ROUTES.HOME,
  },
};

export const DEFAULT_ERROR = {
  title: 'An error occurred',
  message: 'It seems there is an error while fetching the data. Please try again later.',
  button: {
    text: 'Try again',
    link: ROUTES.HOME,
  },
};

export const EMPTY_QUESTIONS = {
  title: 'No questions found',
  message: 'It seems there are no questions yet. Be the first to ask a question.',
  button: {
    text: 'Ask a question',
    link: ROUTES.ASK_QUESTION,
  },
};

export const EMPTY_TAGS = {
  title: 'No tags found',
  message: 'It seems there are no tags yet. Be the first to create a tag.',
  button: {
    text: 'Create a tag',
    link: ROUTES.TAGS,
  },
};

export const EMPTY_COLLECTIONS = {
  title: 'No collections found',
  message: 'It seems there are no collections yet. Be the first to create a collection.',
  button: {
    text: 'Create a collection',
    link: ROUTES.COLLECTIONS,
  },
};

export const EMPTY_ANSWERS = {
  title: 'No answers found',
  message: 'It seems there are no answers yet. Be the first to answer a question.',
};
