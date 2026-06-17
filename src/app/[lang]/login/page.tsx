'use client';

import Dialog from '@/components/components/Dialog';
import { useDictionary } from '@/components/providers/DictionaryProvider';
import { login } from '@/supabase/actions/userActions';
import UserForm from '@/components/molecules/UserForm';

export default function LoginPage() {
  const dictionary = useDictionary();
  const loginEntry = dictionary?.form?.login;

  return (
    <Dialog headline={loginEntry ?? 'Login'} closeButton={false}>
      <UserForm formAction={login} />
    </Dialog>
  );
}
