import { NextResponse } from 'next/server';
import { createAdminClient } from '@/supabase/admin';
import { sendWhatsAppReminder } from '@/supabase/whatsapp';
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

  // Use date-only format (works with Supabase timestamp columns)
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
    .lt('start_time', nextDay) // Use lt (less than) for the next day
    .eq('status', 'pending');

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send reminders...
  const results = [];
  const concurrencyLimit = 10;

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
          return { appointmentId: app.id, result };
        }
        return { appointmentId: app.id, result: 'No phone number' };
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }
  }

  return NextResponse.json({
    processed: results.length,
    details: results,
  });
}
