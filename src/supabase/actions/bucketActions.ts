'use server';

import { revalidatePath } from 'next/cache';
import { getPatientFileName } from '@/helpers';
import { createClient } from '@/supabase/server';
import { PATIENT_FILE_BUCKET } from '@/types/GlobalTypes';

export async function addPatientFile(
  patientID: string,
  fileName: string,
  file: File
) {
  const supabase = await createClient();

  if (!patientID || !file) return null;

  const { data, error } = await supabase.storage
    .from(PATIENT_FILE_BUCKET)
    .upload(getPatientFileName(patientID, fileName), file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error(
      `Error uploading file for ${patientID}: ${fileName} for ${file}`,
      error
    );
    throw error;
  }

  return data.id;
}

export async function deletePatientFile(fileName: string) {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(PATIENT_FILE_BUCKET)
    .remove([fileName]);

  if (error) {
    console.error(
      `Error deleting patient file with name:"${fileName.toString()}"`,
      error
    );

    return false;
  }

  return true;
}

export async function downloadPatientFile(fileName: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(PATIENT_FILE_BUCKET)
    .download(fileName);

  if (error) {
    return null;
  }

  if (data.type === 'application/octet-stream') return null;

  return data;
}

export async function getPatientFileURL(fileName: string) {
  const supabase = await createClient();

  if (!fileName) return null;

  const { data, error } = await supabase.storage
    .from(PATIENT_FILE_BUCKET)
    .createSignedUrl(fileName, 3600);

  if (error) {
    console.error(`Error getting signed URL for file: ${fileName}`, error);
    return null;
  }

  return data?.signedUrl;
}

export async function updatePatientFile(
  id: string,
  fileName: string,
  file: File,
  database: string,
  fileType: string,
  treatmentID?: string
) {
  if (!file || !file?.size) return;

  const supabase = await createClient();
  const newFileID = await addPatientFile(id, fileName, file);

  const { error: fileError } = await supabase
    .from(database)
    .update({ [fileType]: newFileID })
    .eq('id', treatmentID ? treatmentID : id);

  if (fileError) {
    console.error(
      `Error adding file ${fileName} for patient ${id}: ${newFileID}`,
      fileError
    );
    throw fileError;
  }
}

export const deleteFolder = async (folderName: string) => {
  const supabase = await createClient();

  const { data: list, error } = await supabase.storage
    .from(PATIENT_FILE_BUCKET)
    .list(folderName);

  if (error) {
    console.error(`Error listing folder: ${folderName}`, error);
    throw error;
  }

  const filesToRemove = list?.map((x) => `${folderName}/${x.name}`);

  if (!filesToRemove || filesToRemove.length === 0) return;

  const { error: errorRemoveFiles } = await supabase.storage
    .from(PATIENT_FILE_BUCKET)
    .remove(filesToRemove);

  if (errorRemoveFiles) {
    console.error(`Error deleting folder: ${folderName}`, errorRemoveFiles);
    throw errorRemoveFiles;
  }
};

export async function deleteFileAndUpdateDatabase(
  fileName: string,
  database: string,
  fileType: string,
  recordID: string,
  revalidatePathString?: string
) {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage
    .from(PATIENT_FILE_BUCKET)
    .remove([fileName]);

  if (storageError) {
    console.error(`Error deleting file: ${fileName}`, storageError);
    throw storageError;
  }

  const { error: dbError } = await supabase
    .from(database)
    .update({ [fileType]: null })
    .eq('id', recordID);

  if (dbError) {
    console.error(
      `Error updating database for file deletion: ${recordID}`,
      dbError
    );
    throw dbError;
  }

  if (revalidatePathString) {
    revalidatePath(revalidatePathString);
  }

  return true;
}
