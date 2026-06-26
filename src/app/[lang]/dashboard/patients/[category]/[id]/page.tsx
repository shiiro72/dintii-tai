import {
  deletePatient,
  editPatient,
  getPatientWithID,
} from '@/supabase/actions/patientActions';
import {
  addTreatment,
  getPatientTreatments,
} from '@/supabase/actions/treatmentActions';
import { getPatientAppointments } from '@/supabase/actions/appointmentActions';
import { PatientCategory } from '@/types/GeneralTypes';
import { ROWS_TO_LOAD } from '@/types/GlobalTypes';
import PatientClientWrapper from '@/components/components/Wrappers/PatientClientWrapper';

export default async function PatientDetail({
  params,
}: Readonly<{
  params: Promise<{ category: PatientCategory; id: string; lang: string }>;
}>) {
  const { category, id } = await params;

  const [patient, treatments, appointments] = await Promise.all([
    getPatientWithID(Number(id)),
    getPatientTreatments(0, ROWS_TO_LOAD - 1, false, 'date', Number(id)),
    getPatientAppointments(Number(id)),
  ]);

  return (
    <PatientClientWrapper
      patient={patient}
      patientID={Number(id)}
      data={treatments}
      appointments={appointments}
      addAction={addTreatment}
      editAction={editPatient}
      deleteAction={deletePatient}
      patientCategory={category}
      loadRows={async (params) => {
        'use server';

        return await getPatientTreatments(
          params.from,
          params.to,
          params.ascending,
          params.element,
          Number(id)
        );
      }}
      loadAppointmentRows={async (params) => {
        'use server';

        return await getPatientAppointments(
          Number(id),
          params.from,
          params.to,
          params.ascending,
          params.element
        );
      }}
    />
  );
}

export const revalidate = 300;
