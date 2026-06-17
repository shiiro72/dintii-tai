'use client';

import { Headline } from '@/components/atoms/Headline';
import { Container } from '@/components/molecules/Container';
import { GridContainer } from '@/components/molecules/GridContainer';
import UserForm from '@/components/molecules/UserForm';
import { useDictionary } from '@/components/providers/DictionaryProvider';
import { registerUser } from '@/supabase/actions/userActions';

export default function NewUser() {
  const dictionary = useDictionary();
  const addNewUser = dictionary?.navigation?.addNewUser;

  return (
    <Container>
      <GridContainer>
        <div className='col-span-6 md:col-span-8 lg:col-span-6'>
          <Headline
            headline={addNewUser ?? 'Add new user'}
            className='mb-9 border-b-2'
          />
          <UserForm
            formAction={registerUser}
            formType='register'
            darkMode={false}
          />
        </div>
      </GridContainer>
    </Container>
  );
}
