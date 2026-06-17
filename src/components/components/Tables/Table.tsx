'use client';

import { TREATMENT_QUERYResult } from '@/sanity/types';
import { Fragment } from 'react';
import { Container } from '@/components/molecules/Container';
import { GridContainer } from '@/components/molecules/GridContainer';
import { Headline } from '@/components/atoms/Headline';
import { useDictionary } from '@/components/providers/DictionaryProvider';

type TableProps = {
  treatments: NonNullable<TREATMENT_QUERYResult>;
  showPrices?: boolean;
};

export default function Table(props: TableProps) {
  const { treatments, showPrices = false } = props;
  const dictionary = useDictionary();

  const treatmentGroups = Object.values(treatments);
  const {
    treatments: dictionaryTreatments,
    treatment,
  } = dictionary?.treatment || {};
  const { prices, pricesTableTitle } = dictionary?.general || {};

  if (!treatmentGroups || !treatmentGroups.length) return null;

  const cellClasses = 'p-4 text-font text-lg border-b border-font/20';
  const headClasses = `bg-background !text-xl ${cellClasses}`;

  return (
    <Container contentClass={showPrices ? '!mt-5' : ''}>
      <GridContainer>
        <div className='col-span-6 md:col-span-12'>
          <Headline
            headline={
              showPrices
                ? prices || 'Rates'
                : dictionaryTreatments || 'Treatments'
            }
            anchor='treatment'
          />

          <table className='w-full text-left'>
            <colgroup>
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th className={headClasses}>{treatment}</th>
                {showPrices && (
                  <th className={headClasses}>{pricesTableTitle}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {treatmentGroups.map((group, index) => {
                const { name, slug, treatments } = group;

                return (
                  <Fragment key={slug ? slug.current : name?.value || index}>
                    {name?.value && (
                      <tr>
                        <th className={headClasses} colSpan={2}>
                          {name?.value}
                        </th>
                      </tr>
                    )}
                    {treatments.map((treatmentGroups, index) => {
                      const { name, price, slug } = treatmentGroups;

                      return (
                        <tr
                          key={slug ? slug.current : index}
                          className='hover:bg-background/50'
                        >
                          <td className={cellClasses}>{name?.value}</td>
                          {showPrices && (
                            <td className={cellClasses}>{price}</td>
                          )}
                        </tr>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </GridContainer>
    </Container>
  );
}
