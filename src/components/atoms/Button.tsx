import { GoogleIcon, GoogleIconProps } from './GoogleIcon';

export type ButtonProps = Partial<GoogleIconProps> & {
  className?: string;
  label?: string | null;
  onClick?: (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>
      | undefined
  ) => void;
  href?: string;
  asLink?: boolean;
  type?: 'button' | 'submit' | 'reset';
  iconPlacement?: 'left' | 'right';
  formAction?: (formData: FormData) => Promise<void>;
  disabled?: boolean;
  target?: string;
};

export function Button({
  className,
  label,
  onClick,
  href,
  iconName,
  iconClassName,
  asLink,
  formAction,
  type,
  disabled,
  target,
  iconPlacement = 'left',
}: ButtonProps) {
  const buttonClasses = `flex items-center cursor-pointer ${
    asLink
      ? 'text-link hover:text-link-hover'
      : 'justify-center bg-link border-2 py-2 px-4 text-white hover:bg-link-hover rounded-lg'
  } ${className ? ` ${className}` : ''}`;

  const icon = iconName ? (
    <GoogleIcon iconName={iconName} iconClassName={iconClassName} />
  ) : null;

  const buttonContent = (
    <>
      {iconPlacement === 'left' && icon}
      {label != undefined && (
        <span
          className={
            iconName ? (iconPlacement === 'left' ? 'ml-2' : 'mr-2') : ''
          }
        >
          {label ? label : ''}
        </span>
      )}
      {iconPlacement === 'right' && icon}
    </>
  );

  return href ? (
    <a
      href={href}
      className={buttonClasses}
      onClick={onClick}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    >
      {buttonContent}
    </a>
  ) : (
    <button
      className={`${buttonClasses} ${disabled ? 'cursor-not-allowed opacity-50 grayscale' : ''}`}
      onClick={onClick}
      formAction={formAction}
      type={type}
      disabled={disabled}
    >
      {buttonContent}
    </button>
  );
}
