'use client';

import { SupabaseArray } from '@/types/GeneralTypes';
import { EditableTODOListTable } from '../Tables/EditableTable';
import { Button } from '@/components/atoms/Button';
import { TODOS_PATH } from '@/types/GlobalTypes';
import BaseWidget from './BaseWidget';
import { useDictionary } from '@/components/providers/DictionaryProvider';

export function TodoWidget({ data }: { data: SupabaseArray }) {
  const dictionary = useDictionary();
  const redirectToTodoPage = dictionary?.todo?.redirectToTodoPage;

  return (
    <BaseWidget>
      <EditableTODOListTable
        data={data}
        unsortableHeaders={['done', 'todo', 'comment']}
      />

      <Button
        label={redirectToTodoPage ?? 'Check out all todos'}
        href={TODOS_PATH}
      />
    </BaseWidget>
  );
}
