import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/supabase/admin';
import { APPOINTMENT_DATABASE } from '@/types/GlobalTypes';
import { sendWhatsAppMessage } from '@/supabase/whatsapp';
import dayjs from 'dayjs';

export async function GET(request: NextRequest) {
  // 1. Meta verification challenge
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  // 2. environment variable
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Verification failed', { status: 403 });
}

export async function POST(request: NextRequest) {
  // 3. log the incoming replies and return 200
  const body = await request.json();
  console.log('Incoming WhatsApp message:', JSON.stringify(body, null, 2));

  // Handle incoming message status updates
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (message?.type === 'text') {
    const text = message.text.body.toLowerCase().trim();
    const from = message.from; // Phone number without '+'

    let status: 'confirmed' | 'cancelled' | null = null;
    if (text === 'da' || text === 'yes') {
      status = 'confirmed';
    } else if (text === 'nu' || text === 'no') {
      status = 'cancelled';
    }

    if (status) {
      try {
        const supabase = createAdminClient();

        // Find the most recent upcoming appointment for this phone number
        // We look for appointments from today onwards
        const { data: appointments, error: fetchError } = await supabase
          .from(APPOINTMENT_DATABASE)
          .select('id')
          .or(`phone_number.eq.${from}, phone_number.eq.+${from}`)
          .gte('start_time', dayjs().startOf('day').toISOString())
          .order('start_time', { ascending: true })
          .limit(1);

        if (fetchError) throw fetchError;

        if (appointments && appointments.length > 0) {
          const { error: updateError } = await supabase
            .from(APPOINTMENT_DATABASE)
            .update({ status })
            .eq('id', appointments[0].id);

          if (updateError) throw updateError;

          console.log(`Updated appointment ${appointments[0].id} to ${status} for ${from}`);

          const confirmationMsg = status === 'confirmed'
            ? 'Vă mulțumim! Programarea dvs. a fost confirmată. / Thank you! Your appointment is confirmed.'
            : 'Vă mulțumim! Programarea dvs. a fost anulată. / Thank you! Your appointment has been cancelled.';

          await sendWhatsAppMessage(from, confirmationMsg);
        } else {
           await sendWhatsAppMessage(from, "Nu am găsit nicio programare viitoare pentru acest număr. / We couldn't find any upcoming appointments for this number.");
        }
      } catch (error) {
        console.error('Error processing WhatsApp reply:', error);
      }
    } else {
      // Fallback for unrecognized replies
      await sendWhatsAppMessage(
        from,
        "Nu am înțeles răspunsul. Vă rugăm să răspundeți cu DA sau NU. / I didn't understand the response. Please reply with YES or NO."
      );
    }
  }

  return NextResponse.json({ status: 'received' });
}
