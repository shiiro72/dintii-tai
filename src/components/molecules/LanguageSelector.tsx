'use client';

import { Button } from '../atoms/Button';
import { useState } from 'react';
import { useLanguage } from '../providers/LanguageProvider';
const locales = ['en', 'de', 'ro'];
import { usePathname } from 'next/navigation';

type LanguageProps = {
  className?: string;
  buttonClassNames?: string;
};

export function LanguageSelector({
  className,
  buttonClassNames,
}: LanguageProps) {
  const currentLocale = useLanguage();

  const [isOpen, setIsOpen] = useState(false);

  //get path without locale
  const pathname = usePathname().substring(3);

  return (
    <div className={className}>
      <Button
        iconName='public'
        label={currentLocale?.toUpperCase()}
        className={`cursor-pointer ${buttonClassNames ? buttonClassNames : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        asLink
      />
      <div
        className={`absolute transition-opacity duration-300 ease-in-out ${isOpen ? 'visible flex flex-col opacity-100' : 'invisible opacity-0'}`}
      >
        {locales.map((locale) => (
          <Button
            key={locale}
            label={locale.toUpperCase()}
            className='mt-2 flex justify-center rounded-lg'
            href={`/${locale}${pathname}`}
            onClick={() => (document.cookie = `NEXT_LOCALE=${locale}; `)}
          />
        ))}
      </div>
    </div>
  );
}
