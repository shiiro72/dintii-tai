'use client';

import { SupabaseArray } from '@/types/GeneralTypes';
import { EditableTODOListTable } from '../Tables/EditableTable';
import { Headline } from '@/components/atoms/Headline';
import { EditTODOForm } from '@/components/molecules/EditForm';
import {
  addTODOItem,
  deleteTODOItem,
  editTODOItem,
  getTODOList,
} from '@/supabase/actions/todoListActions';
import { useDictionary } from '@/components/providers/DictionaryProvider';

export type TodoListWrapperProps = {
  data: SupabaseArray;
  addAction?: (formData: FormData) => Promise<void>;
};

export default function TodoListWrapper({ data }: TodoListWrapperProps) {
  const dictionary = useDictionary(); const { todoHeadline, todo, comment } = dictionary?.todo || {};

  const formFields = [
    {
      element: 'todo',
      label: todo || "To-Do",
      value: undefined,
    },
    {
      element: 'comment',
      label: comment || "Comment",
      value: undefined,
    },
  ];

  return (
    <EditableTODOListTable
      data={data}
      editAction={editTODOItem}
      deleteAction={deleteTODOItem}
      formFields={formFields}
      loadRows={(params) =>
        getTODOList(params.from, params.to, params.ascending, params.element)
      }
      tableHeader={
        <>
          <div className='border-font/20 mb-2 flex flex-row border-b-2 border-dashed pb-2'>
            <div className='flex flex-1 items-center'>
              <Headline
                headline={todoHeadline ?? 'To-Do List'}
                className='!mb-0 !text-2xl'
              />
            </div>
            <div className='flex h-fit flex-1 justify-end'>
              <EditTODOForm
                formFunctionality='add'
                formAction={addTODOItem}
                formFields={formFields}
              />
            </div>
          </div>
        </>
      }
    />
  );
}
