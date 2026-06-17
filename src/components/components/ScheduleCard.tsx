'use client';

import { SITEINFO_QUERYResult } from '@/sanity/types';
import LineCard from '../molecules/LineCard';
import { Container } from '../molecules/Container';
import { GridContainer } from '../molecules/GridContainer';
import { useDictionary } from '../providers/DictionaryProvider';

type ScheduleProps = {
  siteInfo: NonNullable<SITEINFO_QUERYResult>;
};

export default function ScheduleCard(props: ScheduleProps) {
  const { siteInfo } = props;
  const { timetable } = siteInfo;
  const dictionary = useDictionary();
  const schedule = dictionary?.general?.schedule;

  if (!timetable || !timetable.value) return null;

  return (
    <Container contentClass='bg-base-dark' animateOnScroll={true}>
      <GridContainer>
        <LineCard
          iconName='calendar_month'
          title={schedule || ''}
          text={timetable.value}
          className='col-span-6 md:col-span-12'
        />
      </GridContainer>
    </Container>
  );
}
