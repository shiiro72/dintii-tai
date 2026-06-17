This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

At

```bash
/studio
```

you can open the studio to edit data

## WhatsApp Reminders

The system sends automatic WhatsApp reminders to clients the day before their appointment.

### Configuration

The reminder message is configured in `src/supabase/whatsapp.ts` within the `sendWhatsAppReminder` function.

The current message is:
"Bună! Vă reamintim că aveți o programare mâine, la ora {time}. Mai puteți ajunge? (Vă rugăm să răspundeți cu DA sau NU)
Hello! We remind you that you have an appointment tomorrow at {time}. Are you still coming? (Please respond with YES or NO)"

### Automation (CRON)

To trigger reminders daily at 18:00, set up a CRON job to call:
`GET /api/webhook/whatsapp/reminders`

Ensure you include the `Authorization: Bearer <CRON_SECRET>` header, where `<CRON_SECRET>` is an environment variable.

### Environment Variables

Required variables for WhatsApp integration:
- `WHATSAPP_PHONE_NUMBER_ID`: Your Meta WhatsApp Phone Number ID.
- `WHATSAPP_ACCESS_TOKEN`: Your Meta WhatsApp Business API Access Token.
- `WHATSAPP_VERIFY_TOKEN`: Token for Meta webhook verification.
- `CRON_SECRET`: Secret key for authenticating the reminder CRON job.

### Appointment Status

- **Pending (Default)**: Blue/Purple on calendar.
- **Confirmed**: Green on calendar (triggered by "DA" or "YES" reply).
- **Cancelled**: Red on calendar (triggered by "NU" or "NO" reply).
