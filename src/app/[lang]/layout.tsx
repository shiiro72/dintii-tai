import '@/app/globals.css';

import { Metadata } from 'next';
import { Providers } from '@/components/providers/providers';
import { sanityFetch } from '@/sanity/lib/live';
import { FULL_DICTIONARY_QUERY, SITEINFO_QUERY } from '@/sanity/lib/queries';
import { DICTIONARY_QUERYResult } from '@/types/GeneralTypes';
import { urlFor } from '@/sanity/lib/image';
import SchemaScript from '@/components/molecules/SchemaScript';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang = 'ro' } = await params;

  const { data: siteInfo } = await sanityFetch({
    query: SITEINFO_QUERY,
    params: { language: lang },
  });

  const {
    title: siteTitle,
    name,
    description: plainContent,
    logo,
  } = siteInfo || {};

  const title =
    `${siteTitle} - Dentist Cluj | ${name}` ||
    'DintiiTai - Dentist Cluj | Dr. Natalia Rednic';
  const description =
    plainContent !== undefined && plainContent !== null
      ? typeof plainContent === 'string'
        ? plainContent
        : plainContent.value || ''
      : 'Cabinet stomatologic modern în Cluj-Napoca. Dr. Natalia Rednic oferă tratamente dentare, implanturi, albire și protetică. Programează-te la DintiiTai.';

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      images: [
        {
          url: logo
            ? urlFor(logo).width(1200).height(1200).url()
            : '/favicon.ico',
          width: 1200,
          height: 1200,
          alt: `${siteTitle} Logo`,
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;

  const [{ data: siteInfo }, dictionaryEntries] = await Promise.all([
    sanityFetch({
      query: SITEINFO_QUERY,
      params: { language: lang },
    }),
    getDictionaryEntries(lang),
  ]);

  return (
    <html lang={lang}>
      <head>
        <SchemaScript siteInfo={siteInfo} />
      </head>
      <body>
        <Providers
          language={lang}
          dictionaryEntries={dictionaryEntries}
          siteInfo={siteInfo}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}

export async function getDictionaryEntries(
  lang: string
): Promise<DICTIONARY_QUERYResult> {
  const { data } = await sanityFetch({
    query: FULL_DICTIONARY_QUERY,
    params: { language: lang },
  });

  const mergedEntries = {
    ...data?.general,
    ...data?.navigation,
    ...data?.edit,
    ...data?.patient,
    ...data?.treatment,
    ...data?.feedback,
    ...data?.form,
    ...data?.todo,
    appointments: data?.appointments,
    appointmentsLink: data?.navigation?.appointmentsLink,
  };

  const dictionaryEntries: DICTIONARY_QUERYResult = Object.fromEntries(
    Object.entries(mergedEntries).map(([key, value]) => [
      key,
      value === undefined ? null : value,
    ])
  ) as DICTIONARY_QUERYResult;

  return dictionaryEntries;
}
