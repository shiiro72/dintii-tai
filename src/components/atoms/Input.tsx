import { PropsWithChildren, Ref, useState } from 'react';
import { Button } from './Button';

export type InputProps = PropsWithChildren & {
  label: string | null;
  labelClassName?: string;
  element: string;
  type?: string;
  required?: boolean;
  value?: string | number;
  readOnly?: boolean;
  className?: string;
  containerClassName?: string;
  autoComplete?: string;
  pattern?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  ref?: Ref<HTMLInputElement>;
};

export function Input(props: InputProps) {
  const {
    label = '',
    element,
    type = 'text',
    required = false,
    readOnly = false,
    value,
    className,
    containerClassName,
    autoComplete,
    labelClassName,
    children,
    ...rest
  } = props;

  const isCheckbox = type === 'checkbox';

  const checkboxStylesInput = 'w-fit mr-3';
  const checkboxStylesLabel = 'text-white';

  const [showPassword, setShowPassword] = useState(false);

  const inputProps = {
    id: element,
    type: type === 'password' ? (showPassword ? 'text' : 'password') : type,
    name: element,
    className: `${isCheckbox ? checkboxStylesInput : `peer w-full min-w-72 rounded-lg border border-gray-500 bg-white p-3 placeholder:text-transparent`} ${className ?? ''}`,
    placeholder: 'name',
    required,
    autoComplete: autoComplete ?? 'off',
    readOnly,
    ...rest,
  };

  return (
    <div className={`relative ${containerClassName || ''}`}>
      <input
        {...inputProps}
        {...(rest.onChange ? { value } : { defaultValue: value })}
        {...(isCheckbox && Boolean(value) === true
          ? { defaultChecked: true }
          : {})}
      />
      {type === 'password' && (
        <Button
          asLink
          iconName={showPassword ? 'visibility_off' : 'visibility'}
          className='absolute top-3 right-4'
          onClick={() => {
            setShowPassword(!showPassword);
          }}
          type='button'
          ariaLabel='toggle password visibility'
        />
      )}

      {children}
      {type != 'hidden' && (
        <label
          htmlFor={element}
          className={`${isCheckbox ? checkboxStylesLabel : `absolute left-0 mt-[2px] ml-3 -translate-y-6 cursor-text text-white duration-200 ease-linear peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-gray-500 peer-focus:ml-3 peer-focus:-translate-y-6 peer-focus:text-white ${labelClassName ?? ''}`}`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
