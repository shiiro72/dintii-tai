'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/supabase/server';
import { APPOINTMENT_DATABASE, APPOINTMENTS_PATH } from '@/types/GlobalTypes';

export async function getAppointments(startDate?: string, endDate?: string) {
  const supabase = await createClient();

  let query = supabase
    .from(APPOINTMENT_DATABASE)
    .select(`
      *,
      patient (
        id,
        first_name,
        last_name,
        phone,
        birthdate
      )
    `);

  if (startDate) {
    query = query.gte('start_time', startDate);
  }
  if (endDate) {
    query = query.lte('end_time', endDate);
  }

  const { data, error } = await query.order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }

  return data;
}

export async function addAppointment(formData: FormData) {
  const supabase = await createClient();

  const data = {
    patient_id: parseInt(formData.get('patientId') as string),
    start_time: formData.get('startTime') as string,
    end_time: formData.get('endTime') as string,
    phone_number: formData.get('phone')?.toString() || null,
  };

  const { error } = await supabase.from(APPOINTMENT_DATABASE).insert(data);

  if (error) {
    console.error('Error adding appointment:', error);
    throw error;
  }

  revalidatePath(APPOINTMENTS_PATH);
  revalidatePath('/dashboard');
}

export async function editAppointment(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id');
  if (!id) throw new Error('Appointment ID is required for editing');

  const data = {
    patient_id: parseInt(formData.get('patientId') as string),
    start_time: formData.get('startTime') as string,
    end_time: formData.get('endTime') as string,
    phone_number: formData.get('phone')?.toString() || null,
  };

  const { error } = await supabase
    .from(APPOINTMENT_DATABASE)
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error editing appointment:', error);
    throw error;
  }

  revalidatePath(APPOINTMENTS_PATH);
  revalidatePath('/dashboard');
}

export async function deleteAppointment(id: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from(APPOINTMENT_DATABASE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }

  revalidatePath(APPOINTMENTS_PATH);
  revalidatePath('/dashboard');
}
