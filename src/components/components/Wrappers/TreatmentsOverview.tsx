'use client';

import { useDictionary } from '@/components/providers/DictionaryProvider';
import { EditableTreatmentTable } from '../Tables/EditableTable';
import { Headline } from '@/components/atoms/Headline';
import { EditTreatmentForm } from '@/components/molecules/EditForm';
import {
  deleteTreatment,
  editTreatment,
} from '@/supabase/actions/treatmentActions';
import { LoadRowsFunction, SupabaseArray } from '@/types/GeneralTypes';
import { getPatientFileName, getTreatmentConsentFileName } from '@/helpers';
import { getPatientFileURL } from '@/supabase/actions/bucketActions';

export type TreatmentsOverviewProps = {
  data: SupabaseArray;
  addAction?: (formData: FormData) => Promise<void>;
  patientID: number;
  loadRows: LoadRowsFunction;
};

export default function TreatmentsOverview({
  data,
  addAction,
  patientID,
  loadRows,
}: TreatmentsOverviewProps) {
  const dictionary = useDictionary(); const { treatment, date, price, consentFile } = dictionary?.treatment || {};

  const today = new Date().toISOString().slice(0, 10);

  const getConsentFile = async (treatmentID: string) => {
    const filePath = getPatientFileName(
      patientID.toString(),
      getTreatmentConsentFileName(treatmentID)
    );

    const documentURL = await getPatientFileURL(filePath);

    return documentURL;
  };

  const formFields = [
    {
      element: 'date',
      label: date || "Date",
      value: today,
      type: 'date',
    },
    {
      element: 'treatment',
      label: treatment || "Treatment",
      value: undefined,
    },
    {
      element: 'price',
      label: price || "Price",
      value: undefined,
      type: 'number',
    },
    {
      element: 'consentFile',
      label: consentFile || "Consent",
      value: undefined,
      type: 'file',
    },
    {
      element: 'patientID',
      label: 'patientID',
      value: patientID,
      containerClassName: '-mt-7',
      type: 'hidden',
    },
  ];

  return (
    <EditableTreatmentTable
      data={data}
      excludedHeaders={['id']}
      editAction={editTreatment}
      deleteAction={deleteTreatment}
      formFields={formFields}
      loadRows={(params) => loadRows(params)}
      clickableCell={{
        clickableCellHeader: 'consent_file',
        clickableCellFunction: async (rowData) => {
          const link = await getConsentFile(rowData.id.toString());

          if (link) open(link);
        },
      }}
      useHeaderTranslationForRows={['consent_file']}
      tableHeader={
        <>
          <div className='border-font/20 mb-2 flex flex-row border-b-2 border-dashed pb-2'>
            <div className='flex flex-1 items-center'>
              <Headline
                headline={treatment ?? ''}
                className='!mb-0 !text-2xl'
              />
            </div>
            <div className='flex h-fit flex-1 justify-end'>
              <EditTreatmentForm
                formFunctionality='add'
                formAction={addAction}
                formFields={formFields}
              />
            </div>
          </div>
        </>
      }
    />
  );
}
