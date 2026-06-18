import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { sendWhatsAppReminder } from '@/supabase/whatsapp';
import { APPOINTMENT_DATABASE } from '@/types/GlobalTypes';
import dayjs from 'dayjs';

export async function GET(request: Request) {
  // Auth check for CRON trigger (supports both custom secret and Vercel's internal cron header)
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');

  const isAuthorized =
    (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
    vercelCronHeader === '1';

  if (!isAuthorized) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = await createClient();
  const tomorrow = dayjs().add(1, 'day');
  const startOfTomorrow = tomorrow.startOf('day').toISOString();
  const endOfTomorrow = tomorrow.endOf('day').toISOString();

  const { data: appointments, error } = await supabase
    .from(APPOINTMENT_DATABASE)
    .select(`
      *,
      patient (
        id,
        first_name,
        last_name,
        phone
      )
    `)
    .gte('start_time', startOfTomorrow)
    .lte('start_time', endOfTomorrow)
    .eq('status', 'pending');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  const concurrencyLimit = 10;

  if (appointments) {
    for (let i = 0; i < appointments.length; i += concurrencyLimit) {
      const chunk = appointments.slice(i, i + concurrencyLimit);
      const chunkPromises = chunk.map(async (app) => {
        const phone = app.phone_number || app.patient?.phone;
        if (phone) {
          const time = dayjs(app.start_time).format('HH:mm');
          const patientName = `${app.patient?.first_name || ''} ${app.patient?.last_name || ''}`.trim();
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
    details: results
  });
}
