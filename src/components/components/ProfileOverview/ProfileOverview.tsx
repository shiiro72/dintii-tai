'use client';

import { PatientType } from '@/types/PatientType';
import { useDictionary } from '../../providers/DictionaryProvider';
import ProfileField from './ProfileField';
import { getPatientFileName, getWhatsAppLink } from '@/helpers';
import { useCallback, useEffect, useState } from 'react';
import { getPatientFileURL } from '@/supabase/actions/bucketActions';
import { EditPatientForm } from '@/components/molecules/EditForm';
import { DeletePatientButton } from '@/components/molecules/DeleteButton';
import { GDPR_FILENAME, PATIENT_FILE_NAME } from '@/types/GlobalTypes';

export type ProfileOverviewProps = {
  patient: NonNullable<PatientType>;
  editAction?: (formData: FormData) => Promise<void>;
  deleteAction?: (id: number) => Promise<void>;
};

export default function ProfileOverview({
  patient,
  deleteAction,
  editAction,
}: ProfileOverviewProps) {
  const dictionary = useDictionary();
  const {
    firstName,
    lastName,
    phone,
    email,
    birthdate,
    cnp,
    city,
    county,
    patientFile,
    gdpr,
  } = dictionary?.patient || {
    firstName: null,
    lastName: null,
    phone: null,
    email: null,
    birthdate: null,
    cnp: null,
    city: null,
    county: null,
    patientFile: null,
    gdpr: null,
  };

  const [documentURL, setDocumentURL] = useState<string | null>(null);
  const [gdprDocumentURL, setGdprDocumentURL] = useState<string | null>(null);

  const phoneNumber = getWhatsAppLink(patient?.phone ?? '');
  const filePath = getPatientFileName(
    patient?.id?.toString() ?? '',
    PATIENT_FILE_NAME
  );

  const gdprFilePath = getPatientFileName(
    patient?.id?.toString() ?? '',
    GDPR_FILENAME
  );

  const getPatientFile = useCallback(async () => {
    const url = await getPatientFileURL(filePath);
    setDocumentURL(url);
  }, [filePath]);

  const getGdprFile = useCallback(async () => {
    const url = await getPatientFileURL(gdprFilePath);
    setGdprDocumentURL(url);
  }, [gdprFilePath]);

  useEffect(() => {
    getPatientFile();
    getGdprFile();
  }, [getPatientFile, getGdprFile]);

  const fieldValues = [
    { label: firstName, value: patient?.first_name },
    { label: lastName, value: patient?.last_name },
    {
      label: phone,
      value: patient?.phone,
      link: patient.phone
        ? () => {
            open(phoneNumber);
            return;
          }
        : undefined,
    },
    { label: email, value: patient?.email },
    { label: birthdate, value: patient?.birthdate },
    { label: cnp, value: patient?.cnp },
    { label: city, value: patient?.city },
    { label: county, value: patient?.county },
    {
      label: patientFile,
      value: documentURL ? `${patient.first_name} ${patient.last_name}` : '-',
      link: documentURL
        ? () => {
            getPatientFile();
            open(documentURL);
            return;
          }
        : undefined,
    },
    {
      label: gdpr,
      value: gdprDocumentURL ? gdpr : '-',
      link: gdprDocumentURL
        ? () => {
            getGdprFile();
            open(gdprDocumentURL);
            return;
          }
        : undefined,
    },
  ];

  return (
    <div className='flex flex-col gap-y-2 md:flex-row md:gap-x-2'>
      <div className='bg-background flex flex-2/3 flex-col gap-y-2 rounded-lg p-5 md:p-10'>
        {fieldValues.map(({ label, value, link }, index) => (
          <ProfileField
            key={`${label}-${index}`}
            label={label ?? ''}
            value={value}
            link={link}
          />
        ))}
      </div>
      <div className='bg-background flex flex-1/3 flex-col gap-y-3 rounded-lg p-5 md:p-10'>
        {editAction && (
          <EditPatientForm
            formFunctionality='edit'
            formAction={editAction}
            formFields={[
              {
                element: 'firstName',
                label: firstName,
                required: true,
                value: patient?.first_name ?? undefined,
                autoComplete: 'given-name',
              },
              {
                element: 'lastName',
                label: lastName,
                required: true,
                value: patient?.last_name ?? undefined,
                autoComplete: 'family-name',
              },
              {
                element: 'phone',
                label: phone,
                type: 'tel',
                value: patient.phone || undefined,
                autoComplete: 'tel',
              },
              {
                element: 'email',
                label: email,
                type: 'email',
                value: patient?.email || undefined,
                autoComplete: 'email',
              },
              {
                element: 'cnp',
                label: cnp,
                value: patient?.cnp || undefined,
              },
              {
                element: 'birthdate',
                label: birthdate,
                type: 'date',
                value: patient?.birthdate || undefined,
              },
              {
                element: 'city',
                label: city,
                value: patient?.city || undefined,
              },
              {
                element: 'county',
                label: county,
                value: patient?.county || undefined,
                autoComplete: 'county-name',
              },
              {
                element: 'patientFile',
                label: patientFile,
                type: 'file',
              },
              {
                element: 'gdprFile',
                label: gdpr,
                type: 'file',
              },
              {
                element: 'id',
                label: 'id',
                value: patient?.id,
                type: 'hidden',
                containerClassName: '!-mt-7',
              },
            ]}
          />
        )}
        {deleteAction && (
          <DeletePatientButton
            deleteAction={() => deleteAction(Number(patient.id))}
            textForEntryToDelete={`${patient.first_name} ${patient.last_name}`}
          />
        )}
      </div>
    </div>
  );
}
