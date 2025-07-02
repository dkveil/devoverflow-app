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
