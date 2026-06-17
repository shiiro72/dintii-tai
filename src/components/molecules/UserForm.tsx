'use client';

import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { useDictionary } from '@/components/providers/DictionaryProvider';
import { useActionState, useEffect, useRef, useState } from 'react';
import { GoogleIcon } from '@/components/atoms/GoogleIcon';
import { resetPassword } from '@/supabase/actions/userActions';
import { LOGIN_PATH } from '@/types/GlobalTypes';

type UserFormProps = {
  formAction: (formData: FormData) => Promise<{
    success: boolean;
    message: string;
  }>;
  buttonLabel?: string;
  darkMode?: boolean;
  formType?:
    | 'login'
    | 'register'
    | 'updatePassword'
    | 'resetPassword'
    | 'updateSuccess';
};

type FormState = {
  success: boolean;
  message: string;
};

export default function UserForm({
  formAction,
  formType = 'login',
  buttonLabel = 'Submit',
  darkMode = true,
}: UserFormProps) {
  const dictionary = useDictionary();
  const {
    login: loginEntry,
    email,
    password,
    forgotPassword,
    resetPassword: resetPasswordText,
    updatePassword,
    confirmPassword,
    backToLogin,
    passwordDoNotMatch,
  } = dictionary?.form || {};

  const { addNewUser } = dictionary?.navigation || {};

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const [valid, setValid] = useState(true);
  const [newFormType, setFormType] = useState(formType);

  const isLogin = newFormType === 'login';
  const isRegister = newFormType === 'register';
  const isUpdatePassword = newFormType === 'updatePassword';
  const isResetPassword = newFormType === 'resetPassword';

  const validateForm = () => {
    if (isUpdatePassword && confirmPasswordRef.current && passwordRef.current) {
      if (passwordRef.current.value !== confirmPasswordRef.current.value) {
        setValid(false);
        return false;
      } else {
        setValid(true);
        return true;
      }
    }
    setValid(false);
  };

  const actionReducer = async (
    state: FormState | undefined,
    formData: FormData
  ): Promise<FormState | undefined> => {
    return (
      (isResetPassword
        ? await resetPassword(formData)
        : await formAction(formData)) || { success: true, message: '' }
    );
  };

  const [state, formState] = useActionState(actionReducer, {
    success: true,
    message: '',
  });

  const [stateMessage, setStateMessage] = useState<string | undefined>('');

  useEffect(() => {
    setStateMessage(state?.message);
  }, [state]);

  const success = !isUpdatePassword ? state?.success : valid;

  return (
    <form className='flex flex-col gap-y-7'>
      {(stateMessage || !valid) && (
        <p
          className={`-mt-5 -mb-2 flex items-center gap-x-2 text-left font-bold ${success ? (darkMode ? 'text-green-400' : 'text-green-500') : darkMode ? 'text-yellow-300' : 'text-red-500'}`}
        >
          <GoogleIcon iconName={success ? 'check_circle' : 'error'} />
          {stateMessage}
          {!valid && passwordDoNotMatch}
        </p>
      )}
      {(isLogin || isRegister || isResetPassword) && (
        <Input
          label={email ?? 'Email'}
          element='email'
          type='email'
          required
          autoComplete='email'
          labelClassName={darkMode ? '' : '!text-gray-500'}
        />
      )}
      {!isResetPassword && (
        <Input
          label={password ?? 'Password'}
          element='password'
          type='password'
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          labelClassName={darkMode ? '' : '!text-gray-500'}
          ref={passwordRef}
        />
      )}
      {isUpdatePassword && (
        <Input
          label={confirmPassword ?? 'Confirm Password'}
          element='confirmPassword'
          type='password'
          autoComplete='new-password'
          required
          ref={confirmPasswordRef}
        />
      )}
      <Button
        label={
          isLogin
            ? loginEntry
            : isRegister
              ? addNewUser
              : isUpdatePassword
                ? updatePassword
                : isResetPassword
                  ? resetPasswordText
                  : buttonLabel
        }
        formAction={async (formData: FormData) => {
          if (isUpdatePassword) {
            const isValid = validateForm();

            if (isValid) formAction(formData);
            else return;
          }

          formState(formData);
        }}
      />
      {isLogin && (
        <Button
          asLink
          className='text-white hover:!text-white hover:underline'
          label={forgotPassword ?? 'Forgot Password? Reset Password'}
          onClick={() => {
            setFormType('resetPassword');
            setStateMessage(undefined);
          }}
          type='button'
        />
      )}
      {(isResetPassword || isUpdatePassword) && (
        <Button
          asLink
          className='text-white hover:!text-white hover:underline'
          label={backToLogin ?? 'Back to Login'}
          onClick={
            isResetPassword
              ? () => {
                  setFormType('login');
                  setStateMessage(undefined);
                }
              : undefined
          }
          href={isUpdatePassword ? LOGIN_PATH : undefined}
          type={'reset'}
        />
      )}
    </form>
  );
}
