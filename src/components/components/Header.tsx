'use client';

import NextLink from 'next/link';
import { GridContainer } from '../molecules/GridContainer';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { LanguageSelector } from '../molecules/LanguageSelector';
import { Container } from '../molecules/Container';
import { Button } from '../atoms/Button';
import { Link } from '../atoms/Link';
import { useState } from 'react';
import BurgerMenu from '../molecules/BurgerMenu';
import { useDictionary } from '../providers/DictionaryProvider';
import { useSiteInfo } from '../providers/SiteInfoProvider';
import { RATES_PATH } from '@/types/GlobalTypes';

export function Header() {
  const dictionary = useDictionary();
  const navigationLinks = [
    { name: dictionary?.treatment?.treatments, href: '/#treatment' },
    { name: dictionary?.general?.aboutUs, href: '/#aboutus' },
    { name: dictionary?.general?.contact, href: '/#contact' },
    { name: dictionary?.general?.prices, href: RATES_PATH },
  ];
  const [menuOpen, setMenuOpen] = useState(false);
  const siteInfo = useSiteInfo();

  if (!siteInfo) return undefined;

  const { title, subtitle, logo, phone } = siteInfo;

  return (
    <header className='border-base-dark sticky top-0 z-50 border-b-2 bg-white shadow-lg'>
      <Container contentClass='md:!pt-4 !py-0 !mt-0'>
        <GridContainer>
          <div className='col-span-5 md:col-span-6'>
            <NextLink
              className='mb:mt-2 text-font mt-7 flex flex-row justify-start md:mt-0'
              href='/'
            >
              {logo && (
                <div className='aspect-square w-16 lg:w-22'>
                  <Image
                    src={urlFor(logo).width(100).height(100).url()}
                    width={100}
                    height={100}
                    alt={title || ''}
                    loading='lazy'
                  />
                </div>
              )}
              <div className='mt-3 lg:mt-6'>
                <p className='font-[Architects_Daughter] text-xl lg:text-4xl'>
                  {title}
                </p>
                {subtitle && (
                  <p className='ml-3 text-base italic lg:text-2xl'>
                    {subtitle.value}
                  </p>
                )}
              </div>
            </NextLink>
          </div>

          <div className='col-span-1 col-start-6 flex items-center justify-end md:col-span-6 md:items-end lg:mb-3'>
            <BurgerMenu
              isOpen={menuOpen}
              toggle={() => setMenuOpen(!menuOpen)}
              className='!mt-0 md:hidden'
            />
            <nav
              className={
                `border-link bg-background/95 absolute top-full left-0 flex h-96 w-full items-center justify-center border-b-2 shadow-2xl ${menuOpen ? 'block' : 'hidden'} ` +
                'md:relative md:top-0 md:block md:h-auto md:border-none md:bg-transparent md:shadow-none'
              }
            >
              <ul className='flex flex-col gap-y-8 md:flex-row md:justify-end md:gap-x-6 md:text-base lg:gap-x-18 lg:text-2xl'>
                {navigationLinks.map((link, index) => {
                  return link.name ? (
                    <li key={link.href + index}>
                      <Link
                        className='!text-font'
                        href={link.href}
                        label={link.name}
                        onClick={() => setMenuOpen(false)}
                      />
                    </li>
                  ) : undefined;
                })}
              </ul>
            </nav>
          </div>

          <div className='col-span-6 flex items-center justify-center md:col-span-12 md:items-end md:justify-end'>
            <div className='mb:mt-3 absolute top-0 mt-1 flex flex-row gap-x-4 text-base md:gap-x-8 md:text-lg'>
              {phone && (
                <Button
                  iconName='phone'
                  href={`tel:${phone}`}
                  label={phone}
                  className='h-fit'
                  asLink
                />
              )}
              <LanguageSelector />
            </div>
          </div>
        </GridContainer>
      </Container>
    </header>
  );
}
