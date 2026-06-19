import AppointmentCalendar from '@/components/components/Calendar/AppointmentCalendar';
import { Container } from '@/components/molecules/Container';
import { getDictionaryEntries } from '@/app/[lang]/layout';
import { getAppointments } from '@/supabase/actions/appointmentActions';
import { getPatientFields } from '@/supabase/actions/patientActions';

export default async function AppointmentsPage({
  params,
}: Readonly<{
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dictionary = await getDictionaryEntries(lang);
  const appointmentsHeadline = dictionary?.navigation?.appointmentsLink || 'Appointments';
  const appointments = await getAppointments();

  // Get both adults and minors for the appointment selection
  const adults = await getPatientFields(0, 1000, true, 'last_name', 'adult');
  const minors = await getPatientFields(0, 1000, true, 'last_name', 'minor');

  const allPatients = [...(adults || []), ...(minors || [])];

  return (
    <Container>
      <div className='col-span-12 mb-6'>
        <h1 className='text-2xl font-semibold'>{appointmentsHeadline}</h1>
      </div>
      <div className='col-span-12'>
        <AppointmentCalendar
            initialAppointments={appointments || []}
            patients={allPatients}
        />
      </div>
    </Container>
  );
}

export const revalidate = 0; // Disable cache for the calendar page to always show latest appointments
