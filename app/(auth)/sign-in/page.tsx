'use client';

import React from 'react';

import AuthForm from '@/components/forms/auth-form';
import { singInWithCredentials } from '@/lib/actions/auth.action';
import { SignInSchema } from '@/lib/validations';

const SignIn = () => {
  return (
    <AuthForm
      formType="SIGN_IN"
      schema={SignInSchema}
      defaultValues={{ email: '', password: '' }}
      onSubmit={singInWithCredentials}
    />
  );
};

export default SignIn;
