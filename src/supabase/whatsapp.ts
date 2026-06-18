/**
 * WhatsApp Business API utility for sending messages.
 *
 * Configuration:
 * - Templates are used for initiating conversations (e.g., reminders).
 * - Free-form text is used for replies within the 24-hour window.
 */

const WHATSAPP_API_URL = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Sends a free-form text message.
 * Use this ONLY for replying to a user message within 24 hours.
 */
export async function sendWhatsAppMessage(to: string, message: string) {
  if (!ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials are not configured');
    return;
  }

  const formattedPhone = to.startsWith('+')
    ? to.substring(1)
    : to.startsWith('40')
      ? to
      : `40${to}`;

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
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

/**
 * Sends an appointment reminder using a pre-approved Meta Template.
 * Templates are required for initiating messages.
 */
export async function sendWhatsAppReminder(
  to: string,
  patientName: string,
  appointmentTime: string
) {
  if (!ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials are not configured');
    return;
  }

  const formattedPhone = to.startsWith('+')
    ? to.substring(1)
    : to.startsWith('40')
      ? to
      : `40${to}`;

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: 'appointment_reminder', // Must be approved in Meta Business Manager
          language: { code: 'ro' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: patientName },
                { type: 'text', text: appointmentTime },
              ],
            },
          ],
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Error sending WhatsApp template reminder:', data);
    }
    return data;
  } catch (error) {
    console.error('WhatsApp Template API call failed:', error);
  }
}
