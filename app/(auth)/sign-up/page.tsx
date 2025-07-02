'use client';

import React from 'react';

import AuthForm from '@/components/forms/auth-form';
import { singUpWithCredentials } from '@/lib/actions/auth.action';
import { SignUpSchema } from '@/lib/validations';

const SignUp = () => {
  return (
    <AuthForm
      formType="SIGN_UP"
      schema={SignUpSchema}
      defaultValues={{ email: '', password: '', name: '', username: '' }}
      onSubmit={singUpWithCredentials}
    />
  );
};

export default SignUp;
