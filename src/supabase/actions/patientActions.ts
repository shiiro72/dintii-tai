'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/supabase/server';
import { notFound } from 'next/navigation';
import {
  GDPR_FILENAME,
  PATIENT_DATABASE,
  PATIENT_FILE_NAME,
  PATIENTS_PATH,
  ROWS_TO_LOAD,
  TREATMENT_CONSENT,
} from '@/types/GlobalTypes';
import {
  addPatientFile,
  deleteFolder,
  deletePatientFile,
  updatePatientFile,
} from './bucketActions';
import { getPatientFileName } from '@/helpers';
import { PatientCategory } from '@/types/GeneralTypes';

export async function addPatient(formData: FormData) {
  const supabase = await createClient();

  const patientFile = formData.get('patientFile') as File;

  const data = {
    first_name: formData.get('firstName')?.toString() || null,
    last_name: formData.get('lastName')?.toString() || null,
    phone: formData.get('phone')?.toString() || null,
    email: formData.get('email')?.toString() || null,
    patient_file_id: null,
  };

  const { data: newPatient, error } = await supabase
    .from(PATIENT_DATABASE)
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error adding patient:', newPatient, error);
    throw error;
  }

  if (newPatient && patientFile.size) {
    const patientFileId = await addPatientFile(
      `${newPatient.id.toString()}`,
      PATIENT_FILE_NAME,
      patientFile
    );

    const { error } = await supabase
      .from(PATIENT_DATABASE)
      .update({ patient_file_id: patientFileId })
      .eq('id', newPatient.id);

    if (error) {
      console.error(
        `Error adding file for ${newPatient.id}: ${patientFileId}`,
        error
      );
      throw error;
    }
  }

  revalidatePath(`${PATIENTS_PATH}/adult`);
}

export async function getPatientWithID(id: number) {
  const supabase = await createClient();

  const { data: patient, error } = await supabase
    .from(PATIENT_DATABASE)
    .select()
    .eq('id', id)
    .limit(1)
    .maybeSingle();

  if (!patient || error) return notFound();

  return patient;
}

export async function getPatientFields(
  from = 0,
  to = ROWS_TO_LOAD - 1,
  ascending = true,
  element = 'first_name',
  category: PatientCategory = 'adult'
) {
  const supabase = await createClient();

  const today = new Date();
  const adultDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  ).toISOString();

  const categoryCondition =
    category === 'adult'
      ? `birthdate.lte.${adultDate}, birthdate.is.null`
      : `birthdate.gt.${adultDate}`;

  const { data } = await supabase
    .from(PATIENT_DATABASE)
    .select('id, first_name, last_name, phone, email, birthdate')
    .or(categoryCondition)
    .order(element, { ascending: ascending })
    .range(from, to);

  return data;
}

export async function editPatient(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id')?.toString().trim();

  if (!id) return;

  const patientFile = formData.get('patientFile') as File;
  const gdprFile = formData.get('gdprFile') as File;

  const data = {
    first_name: formData.get('firstName'),
    last_name: formData.get('lastName'),
    phone: formData.get('phone'),
    cnp: formData.get('cnp'),
    email: formData.get('email'),
    city: formData.get('city'),
    county: formData.get('county'),
    birthdate: formData.get('birthdate')?.toString() || null,
  };

  const { error } = await supabase
    .from(PATIENT_DATABASE)
    .update(data)
    .eq('id', id);

  await updatePatientFile(
    id,
    PATIENT_FILE_NAME,
    patientFile,
    PATIENT_DATABASE,
    'patient_file_id'
  );
  await updatePatientFile(
    id,
    GDPR_FILENAME,
    gdprFile,
    PATIENT_DATABASE,
    'gdpr_file_id'
  );

  if (error) throw error;

  revalidatePath(`${PATIENTS_PATH}/${id}`);
}

export async function deletePatient(id: number) {
  const supabase = await createClient();

  if (!id) return;

  const { data: deletedPatient, error } = await supabase
    .from(PATIENT_DATABASE)
    .delete()
    .eq('id', id)
    .select();

  if (deletedPatient) {
    if (deletedPatient[0].patient_file_id) {
      await deletePatientFile(
        getPatientFileName(id.toString(), PATIENT_FILE_NAME)
      );
    }

    if (deletedPatient[0].gdpr_file_id) {
      await deletePatientFile(getPatientFileName(id.toString(), GDPR_FILENAME));
    }

    deleteFolder(`${id.toString()}/${TREATMENT_CONSENT}`);
  }

  if (error) {
    console.error(`Error deleting patient: ${id}`, deletedPatient, error);
    throw error;
  }
}
