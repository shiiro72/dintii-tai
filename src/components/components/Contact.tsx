'use client';

import { SITEINFO_QUERYResult } from '@/sanity/types';
import { Headline } from '../atoms/Headline';
import { Container } from '../molecules/Container';
import { GridContainer } from '../molecules/GridContainer';
import { Link } from '../atoms/Link';
import Image from 'next/image';
import { getWhatsAppLink } from '@/helpers';
import { useDictionary } from '../providers/DictionaryProvider';

type ContactProps = {
  siteInfo: NonNullable<SITEINFO_QUERYResult>;
};

export default function Contact(props: ContactProps) {
  const dictionary = useDictionary(); const contact = dictionary?.general?.contact;

  if (!props) return undefined;

  const { siteInfo } = props;
  const { phone, address, email, name, profession } = siteInfo;

  return (
    <Container darkBackground animateOnScroll={true}>
      <GridContainer>
        <div className='col-span-6 md:col-span-5 lg:col-start-2'>
          <div className='relative inset-0 h-64 w-full md:h-full'>
            <iframe
              className='relative inset-0 h-full w-full'
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2732.9408388993274!2d23.60152631547727!3d46.76606257913786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47490c3ab1909adb%3A0xbac915a4eca4e437!2sStrada%20Constantin%20Br%C3%A2ncu%C8%99i%2030%2C%20Cluj-Napoca%20400000!5e0!3m2!1sen!2sro!4v1615128028424!5m2!1sen!2sro'
              loading='lazy'
            />
          </div>
        </div>
        <div className='text-font col-span-6 md:col-start-7 lg:col-span-4 lg:col-start-8 lg:pb-16'>
          <Headline headline={contact || ''} anchor='contact' />
          <div className='flex flex-col gap-y-4 text-base md:gap-y-4 md:text-2xl'>
            {name && (
              <div>
                {name} | {profession?.value}
              </div>
            )}
            {phone && (
              <Link
                href={`tel:${phone}`}
                label={phone}
                iconName='phone'
                iconClassName='lg:!text-3xl'
              />
            )}
            {phone && (
              <div className='flex flex-row'>
                <Image
                  src='/whatsapp.svg'
                  height={30}
                  width={30}
                  alt='whatsapp icon'
                  loading='lazy'
                />
                <Link
                  href={getWhatsAppLink(phone)}
                  label='WhatsApp'
                  className='ml-3'
                />
              </div>
            )}
            {email && (
              <Link
                href={`mailto:${email}`}
                label={email}
                iconName='email'
                iconClassName='lg:!text-3xl'
              />
            )}
            {address && (
              <Link
                href='https://maps.app.goo.gl/EMPERD71bPH24zmu8'
                label={address}
                iconName='fmd_good'
                iconClassName='lg:!text-3xl'
              />
            )}
          </div>
        </div>
      </GridContainer>
    </Container>
  );
}
