import { NextResponse } from 'next/server';
import { createAdminClient } from '@/supabase/admin';
import {
  sendWhatsAppReminder,
  sendWhatsAppReengagementReminder,
} from '@/supabase/whatsapp';
import { APPOINTMENT_DATABASE } from '@/types/GlobalTypes';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export async function GET(request: Request) {
  // Auth check
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const isAuthorized =
    (process.env.CRON_SECRET &&
      authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
    vercelCronHeader === '1';

  if (!isAuthorized) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createAdminClient();
  const today = dayjs();
  const dayOfWeek = today.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  const results = [];
  const concurrencyLimit = 10;

  // Sunday (0) to Thursday (4) - Upcoming Appointment Reminders
  if (dayOfWeek >= 0 && dayOfWeek <= 4) {
    const tomorrow = dayjs().utc().add(1, 'day');
    const tomorrowDate = tomorrow.format('YYYY-MM-DD');
    const nextDay = tomorrow.add(1, 'day').format('YYYY-MM-DD');

    const { data: appointments, error } = await supabase
      .from(APPOINTMENT_DATABASE)
      .select(
        `
        *,
        patient (
          id,
          first_name,
          last_name,
          phone
        )
      `
      )
      .gte('start_time', tomorrowDate)
      .lt('start_time', nextDay)
      .eq('status', 'pending');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (appointments && appointments.length > 0) {
      for (let i = 0; i < appointments.length; i += concurrencyLimit) {
        const chunk = appointments.slice(i, i + concurrencyLimit);
        const chunkPromises = chunk.map(async (app) => {
          const phone = app.phone_number || app.patient?.phone;
          if (phone) {
            const time = dayjs(app.start_time).format('HH:mm');
            const patientName =
              `${app.patient?.first_name || ''} ${app.patient?.last_name || ''}`.trim();
            const result = await sendWhatsAppReminder(phone, patientName, time);
            return { appointmentId: app.id, type: 'reminder', result };
          }
          return { appointmentId: app.id, type: 'reminder', result: 'No phone number' };
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
      }
    }
  }

  // Saturday (6) - Re-engagement (6 months since last visit)
  if (dayOfWeek === 6) {
    const sixMonthsAgoStart = dayjs()
      .subtract(187, 'day')
      .format('YYYY-MM-DD');
    const sixMonthsAgoEnd = dayjs()
      .subtract(180, 'day')
      .format('YYYY-MM-DD');

    // This query is slightly more complex. We want patients whose last appointment was 6 months ago.
    // For simplicity, we can fetch patients who had an appointment in that window
    // and then check if they have any newer appointments.

    const { data: candidates, error: candidateError } = await supabase
      .from(APPOINTMENT_DATABASE)
      .select(`
        patient_id,
        patient:patient_id (
          id,
          first_name,
          last_name,
          phone
        )
      `)
      .gte('start_time', sixMonthsAgoStart)
      .lte('start_time', sixMonthsAgoEnd)
      .eq('status', 'confirmed');

    if (candidateError) {
      console.error('Supabase error:', candidateError);
      return NextResponse.json({ error: candidateError.message }, { status: 500 });
    }

    const uniquePatientIds = Array.from(
      new Set(candidates?.map((c) => c.patient_id))
    );

    if (uniquePatientIds.length > 0) {
      // Find all patients who HAVE future appointments
      const { data: patientsWithFutureApps, error: futureError } = await supabase
        .from(APPOINTMENT_DATABASE)
        .select('patient_id')
        .in('patient_id', uniquePatientIds)
        .gt('start_time', sixMonthsAgoEnd);

      if (!futureError) {
        const idsWithFutureApps = new Set(
          patientsWithFutureApps?.map((a) => a.patient_id)
        );
        const targetPatientIds = uniquePatientIds.filter(
          (id) => !idsWithFutureApps.has(id)
        );

        for (let i = 0; i < targetPatientIds.length; i += concurrencyLimit) {
          const chunk = targetPatientIds.slice(i, i + concurrencyLimit);
          const chunkPromises = chunk.map(async (patientId) => {
            const candidate = candidates?.find((c) => c.patient_id === patientId);
            const patient = candidate?.patient as unknown as {
              id: number;
              first_name: string;
              last_name: string;
              phone: string;
            };
            if (patient && patient.phone) {
              const patientName =
                `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
              const result = await sendWhatsAppReengagementReminder(
                patient.phone,
                patientName
              );
              return { patientId, type: 're-engagement', result };
            }
            return { patientId, type: 're-engagement', result: 'No phone' };
          });

          const chunkResults = await Promise.all(chunkPromises);
          results.push(...chunkResults);
        }
      }
    }
  }

  return NextResponse.json({
    processed: results.length,
    details: results,
  });
}
