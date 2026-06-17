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
import { LoadRowsFunction, PatientCategory, SupabaseArray } from '@/types/GeneralTypes';
import { EditableAppointmentTable } from '../Tables/EditableTable';

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
  const { backToPatients, profile } = dictionary?.navigation || {};
  const treatmentText = dictionary?.treatment?.treatment;
  const appointmentsHeadline = dictionary?.appointments?.appointmentsHeadline;
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
            <EditableAppointmentTable
              data={appointments}
              loadRows={loadAppointmentRows}
            />
          </div>
        </Tab>
      </Tabs>
    </>
  );
}
