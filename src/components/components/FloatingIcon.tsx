import Image from 'next/image';
import { Link } from '../atoms/Link';
import { getWhatsAppLink } from '@/helpers';

export default function FloatingIcon({ phone }: { phone: string }) {
  return (
    <Link href={getWhatsAppLink(phone)}>
      <div className='group fixed right-6 bottom-6 z-50 flex aspect-square w-16 items-center justify-center rounded-full bg-black/90 shadow-lg transition-all hover:w-18'>
        <Image
          src='/whatsapp.svg'
          height={40}
          width={40}
          alt='whatsapp icon'
          className='aspect-square transition-all group-hover:w-12'
          loading='lazy'
        />
      </div>
    </Link>
  );
}
