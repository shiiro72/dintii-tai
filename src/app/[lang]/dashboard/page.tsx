import { AppointmentWidget } from '@/components/components/Widgets/AppointmentWidget';
import { TodoWidget } from '@/components/components/Widgets/TodoWidget';
import { Container } from '@/components/molecules/Container';
import { GridContainer } from '@/components/molecules/GridContainer';
import { getAppointments } from '@/supabase/actions/appointmentActions';
import { getTODOList } from '@/supabase/actions/todoListActions';
import dayjs from 'dayjs';

export default async function Dashboard() {
  const todos = await getTODOList();
  const appointments = await getAppointments(
    dayjs().startOf('day').toISOString(),
    dayjs().add(7, 'day').endOf('day').toISOString()
  );

  return (
    <Container>
      <GridContainer>
        <div className='col-span-6 md:col-span-12'>
          <h1 className='text-2xl font-semibold'>Dashboard</h1>
        </div>
        <div className='col-span-6 md:col-span-6'>
          <TodoWidget data={todos} />
        </div>
        <div className='col-span-6 md:col-span-6'>
          <AppointmentWidget appointments={appointments || []} />
        </div>
      </GridContainer>
    </Container>
  );
}

export const revalidate = 300;
