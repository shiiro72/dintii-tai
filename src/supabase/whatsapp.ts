/**
 * WhatsApp Business API utility for sending messages.
 *
 * Configuration:
 * The message content is defined in `sendWhatsAppReminder` function.
 * It sends a bilingual message (Romanian and English).
 */

const WHATSAPP_API_URL = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function sendWhatsAppMessage(to: string, message: string) {
  if (!ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials are not configured');
    return;
  }

  // Ensure phone number has country code but no '+' for the API
  const formattedPhone = to.startsWith('+') ? to.substring(1) : to.startsWith('40') ? to : `40${to}`;

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Error sending WhatsApp message:', data);
    }
    return data;
  } catch (error) {
    console.error('WhatsApp API call failed:', error);
  }
}

export async function sendWhatsAppReminder(to: string, patientName: string, appointmentTime: string) {
  const message = `Bună! Vă reamintim că aveți o programare mâine, la ora ${appointmentTime}. Mai puteți ajunge? (Vă rugăm să răspundeți cu DA sau NU)

Hello! We remind you that you have an appointment tomorrow at ${appointmentTime}. Are you still coming? (Please respond with YES or NO)`;

  return sendWhatsAppMessage(to, message);
}
