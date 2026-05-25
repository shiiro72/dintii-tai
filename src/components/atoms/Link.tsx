import { SanityImage } from '@/types/GeneralTypes';
import { GoogleIcon, GoogleIconProps } from './GoogleIcon';
import NextLink from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import { PropsWithChildren } from 'react';

type LinkProps = Partial<GoogleIconProps> &
  PropsWithChildren & {
    className?: string;
    label?: string | null;
    onClick?: () => void;
    href: string;
    darkBackground?: boolean;
    logo?: SanityImage;
    target?: string;
  };

export function Link({
  className,
  label,
  onClick,
  href,
  iconName,
  iconClassName,
  darkBackground = false,
  logo,
  target,
  children,
}: LinkProps) {
  const linkClsses = `${darkBackground ? 'text-white hover:text-white' : 'text-link hover:!text-link-hover'} flex items-center${className ? ` ${className}` : ''}`;

  const linkContent = (
    <>
      {logo?.image && (
        <Image
          src={urlFor(logo?.image).width(64).height(64).url()}
          width={32}
          height={32}
          alt={logo?.image?.alt || ''}
          className='h-full w-full object-cover'
          loading='lazy'
        />
      )}
      {iconName && (
        <GoogleIcon iconName={iconName} iconClassName={iconClassName} />
      )}
      <span
        className={`hover:underline hover:underline-offset-4 ${(iconName || logo) && 'ml-2'}`}
      >
        {label ? label : ''}
      </span>
    </>
  );

  return (
    <NextLink
      className={linkClsses}
      onClick={onClick}
      href={href}
      target={target}
      prefetch={true}
    >
      {linkContent}
      {children}
    </NextLink>
  );
}
