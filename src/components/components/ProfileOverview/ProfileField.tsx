import { Button } from '@/components/atoms/Button';
import DeleteButton from '@/components/molecules/DeleteButton';

type ProfileFieldProps = {
  label: string;
  value?: string | null;
  link?: () => void;
  onDelete?: () => Promise<void>;
  deleteMessage?: string;
  dialogHeadline?: string;
};

export default function ProfileField({
  label,
  value,
  link,
  onDelete,
  deleteMessage,
  dialogHeadline,
}: ProfileFieldProps) {
  return (
    <div className='flex items-center gap-x-2'>
      <p className='flex gap-x-2'>
        <span>{label}:</span>
        {link ? (
          <Button asLink label={value ? value : '-'} onClick={link} />
        ) : (
          <span>{value ? value : '-'}</span>
        )}
      </p>
      {onDelete && value && value !== '-' && (
        <DeleteButton
          deleteAction={onDelete}
          message={deleteMessage || ''}
          dialogHeadline={dialogHeadline || ''}
          asLink
          className='!p-0'
        />
      )}
    </div>
  );
}
