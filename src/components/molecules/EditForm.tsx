'use client';

import { Button, ButtonProps } from '../atoms/Button';
import { Input, InputProps } from '../atoms/Input';
import { useDialog } from '../providers/DialogProvider';
import { useDictionary } from '../providers/DictionaryProvider';
import NotificationMessageLine from './NotificationMessageLine';

type BaseEditFormProps = ButtonProps & {
  formFunctionality: 'add' | 'edit';
  formFields: InputProps[];
  onSave?: () => void;
};

export type EditFormProps = BaseEditFormProps & {
  addMessage: string;
  editMessage: string;
  buttonAddIconName: string;
  notificationMessage?: string;
};

export default function EditForm({
  formFunctionality,
  formFields,
  formAction,
  addMessage,
  editMessage,
  buttonAddIconName,
  onSave,
  notificationMessage,
  ...rest
}: EditFormProps) {
  const dictionary = useDictionary();
  const { save, cancel } = dictionary?.edit || {};
  const { errorMessage, successMessage } = dictionary?.feedback || {};

  const { handleClick, closeDialog, showFeedback } = useDialog();

  const isAddDialog = formFunctionality == 'add';
  const dialogHeadine = isAddDialog ? addMessage : editMessage;

  async function handleFormSubmission(formData: FormData) {
    if (formAction) {
      try {
        await formAction(formData);
        closeDialog();
        showFeedback('success', successMessage || '');
      } catch (error) {
        showFeedback('error', `${errorMessage} Error: ${error}`);
      }
    }
  }

  return (
    <Button
      label={dialogHeadine || ''}
      iconName={isAddDialog ? buttonAddIconName : 'edit'}
      {...rest}
      onClick={() =>
        handleClick(
          <form className='flex flex-col gap-y-7'>
            {notificationMessage && isAddDialog && (
              <NotificationMessageLine
                message={notificationMessage}
                iconName='error'
                notificationIconColor='text-yellow-300'
                textColor='text-yellow-300'
              />
            )}
            {formFields.map(
              ({
                label,
                element,
                type,
                required,
                value,
                containerClassName,
                autoComplete,
                ref,
              }) => (
                <Input
                  key={element}
                  label={label ?? ''}
                  element={element}
                  type={type}
                  required={required}
                  value={value}
                  containerClassName={containerClassName}
                  autoComplete={autoComplete}
                  ref={ref}
                />
              )
            )}

            {isAddDialog ? (
              <Button
                label={isAddDialog ? (addMessage ?? '') : (save ?? '')}
                className='rounded-full text-center'
                iconName={isAddDialog ? undefined : 'save'}
                formAction={async (formData) => handleFormSubmission(formData)}
              />
            ) : (
              <div className='flex flex-col gap-y-2 md:flex-row md:gap-x-3'>
                <Button
                  label={cancel ?? ''}
                  className='w-full rounded-full text-center'
                  onClick={closeDialog}
                  iconName='cancel'
                  type='button'
                />
                <Button
                  formAction={async (formData) =>
                    handleFormSubmission(formData)
                  }
                  label={save ?? ''}
                  className='w-full rounded-full text-center'
                  iconName='save'
                  onClick={() => onSave && onSave()}
                />
              </div>
            )}
          </form>,
          dialogHeadine ?? '',
          '!py-7'
        )
      }
    />
  );
}

export function EditPatientForm(props: BaseEditFormProps) {
  const dictionary = useDictionary();
  const { addPatient, editPatient } = dictionary?.edit || {};
  const { patientAdultNotification } = dictionary?.form || {};

  return (
    <EditForm
      addMessage={addPatient ?? ''}
      editMessage={editPatient ?? ''}
      buttonAddIconName='person_add'
      notificationMessage={patientAdultNotification ?? ''}
      {...props}
    />
  );
}

export function EditTreatmentForm(props: BaseEditFormProps) {
  const dictionary = useDictionary();
  const { addTreatment, editTreatment } = dictionary?.edit || {};

  return (
    <EditForm
      addMessage={addTreatment ?? ''}
      editMessage={editTreatment ?? ''}
      buttonAddIconName='post_add'
      {...props}
    />
  );
}

export function EditTODOForm(props: BaseEditFormProps) {
  const dictionary = useDictionary();
  const { addTODOItem, editTODOItem } = dictionary?.todo || {};

  return (
    <EditForm
      addMessage={addTODOItem ?? ''}
      editMessage={editTODOItem ?? ''}
      buttonAddIconName='add_task'
      {...props}
    />
  );
}
