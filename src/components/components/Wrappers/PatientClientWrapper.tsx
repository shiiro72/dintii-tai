'use client';

import { PATIENTS_PATH } from '@/types/GlobalTypes';
import { Link } from '../../atoms/Link';
import { Container } from '../../molecules/Container';
import { GridContainer } from '../../molecules/GridContainer';
import { Headline } from '../../atoms/Headline';
import ProfileOverview, {
  ProfileOverviewProps,
} from '../ProfileOverview/ProfileOverview';
import Tabs from '../Tabs/Tabs';
import Tab from '../Tabs/Tab';
import { useDictionary } from '../../providers/DictionaryProvider';
import TreatmentsOverview, {
  TreatmentsOverviewProps,
} from '../Wrappers/TreatmentsOverview';
import {
  LoadRowsFunction,
  PatientCategory,
  SupabaseArray,
} from '@/types/GeneralTypes';
import { EditableAppointmentTable } from '../Tables/EditableTable';
import { Button } from '@/components/atoms/Button';
import { useDialog } from '@/components/providers/DialogProvider';
import AppointmentModal from '../Modals/AppointmentModal';
import { deleteAppointment } from '@/supabase/actions/appointmentActions';

type PatientClientWrapperProps = TreatmentsOverviewProps &
  ProfileOverviewProps & {
    patientCategory: PatientCategory;
    appointments: SupabaseArray;
    loadAppointmentRows: LoadRowsFunction;
  };

export default function PatientClientWrapper({
  patientID,
  data: treatments,
  appointments,
  patient,
  addAction: addTreatment,
  editAction: editPatient,
  deleteAction: deletePatient,
  loadRows,
  loadAppointmentRows,
  patientCategory,
}: PatientClientWrapperProps) {
  const dictionary = useDictionary();
  const { handleClick } = useDialog();
  const { backToPatients, profile } = dictionary?.navigation || {};
  const treatmentText = dictionary?.treatment?.treatment;
  const {
    appointmentsHeadline,
    addAppointment,
    editAppointment: editAppointmentText,
    deleteAppointment: deleteAppointmentText,
    deleteAppointmentMessage,
  } = dictionary?.appointments || {};
  const { first_name, last_name } = patient;

  return (
    <>
      <Container>
        <GridContainer>
          <div className='col-span-6 md:col-span-12'>
            <Link
              href={`${PATIENTS_PATH}/${patientCategory}`}
              label={backToPatients}
              className='mt-3 mb-3 md:mt-0'
              iconName='arrow_back'
            />
            <Headline headline={`${first_name} ${last_name}`} />
          </div>
        </GridContainer>
      </Container>
      <Tabs>
        <Tab title={profile ?? ''}>
          <ProfileOverview
            patient={patient}
            deleteAction={deletePatient}
            editAction={editPatient}
          />
        </Tab>
        <Tab title={treatmentText ?? ''}>
          <TreatmentsOverview
            data={treatments}
            addAction={addTreatment}
            loadRows={loadRows}
            patientID={patientID}
          />
        </Tab>
        <Tab title={appointmentsHeadline ?? ''}>
          <div className='bg-background rounded-lg p-5 md:p-10'>
            <div className='border-font/20 mb-2 flex flex-row border-b-2 border-dashed pb-2'>
              <div className='flex flex-1 items-center'>
                <Headline
                  headline={appointmentsHeadline ?? ''}
                  className='!mb-0 !text-2xl'
                />
              </div>
              <div className='flex h-fit flex-1 justify-end'>
                <Button
                  label={addAppointment || 'Add Appointment'}
                  iconName='event'
                  onClick={() =>
                    handleClick(
                      <AppointmentModal
                        patients={[
                          {
                            id: patientID,
                            first_name: patient.first_name || '',
                            last_name: patient.last_name || '',
                            phone: patient.phone || '',
                            birthdate: patient.birthdate || '',
                          },
                        ]}
                        patientId={patientID}
                        onSave={() => {}}
                        initialAppointments={
                          appointments as {
                            id: number;
                            start_time: string;
                            end_time: string;
                          }[]
                        }
                      />,
                      addAppointment || 'Add Appointment'
                    )
                  }
                />
              </div>
            </div>
            <EditableAppointmentTable
              data={appointments}
              loadRows={loadAppointmentRows}
              onEditClick={(rowData) =>
                handleClick(
                  <AppointmentModal
                    appointment={{
                      id: Number(rowData.id),
                      patient_id: patientID,
                      start_time: rowData.start_time,
                      end_time: rowData.end_time,
                      phone_number: rowData.phone_number,
                      patient: {
                        id: patientID,
                        first_name: patient.first_name || '',
                        last_name: patient.last_name || '',
                        phone: patient.phone || '',
                        birthdate: patient.birthdate || '',
                      },
                    }}
                    patients={[
                      {
                        id: patientID,
                        first_name: patient.first_name || '',
                        last_name: patient.last_name || '',
                        phone: patient.phone || '',
                        birthdate: patient.birthdate || '',
                      },
                    ]}
                    patientId={patientID}
                    onSave={() => {}}
                    initialAppointments={
                      appointments as {
                        id: number;
                        start_time: string;
                        end_time: string;
                      }[]
                    }
                  />,
                  editAppointmentText || 'Edit Appointment'
                )
              }
              deleteAction={deleteAppointment}
              editMessage={editAppointmentText || 'Edit Appointment'}
              deleteMessage={deleteAppointmentText || 'Delete Appointment'}
              deleteDialogMessage={
                deleteAppointmentMessage || 'Delete Appointment'
              }
            />
          </div>
        </Tab>
      </Tabs>
    </>
  );
}
