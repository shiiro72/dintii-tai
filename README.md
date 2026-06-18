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

The reminder message uses a Meta Message Template named `appointment_reminder`. This template must be approved in your Meta Business Manager.

**Template structure (Romanian):**
"Bună {{1}}! Vă reamintim că aveți o programare mâine, la ora {{2}}. Mai puteți ajunge? (Vă rugăm să răspundeți cu DA sau NU)"

**Template variables:**
- `{{1}}`: Patient Name
- `{{2}}`: Appointment Time

Replies are handled automatically, and the system will send a confirmation or a fallback message if the reply is not recognized.

### Automation (CRON)

The project includes a `vercel.json` file that automatically configures a Vercel Cron Job to trigger reminders daily at 18:00 (Romanian Time).

If you are using another platform, set up a CRON job to call:
`GET /api/webhook/whatsapp/reminders`

Ensure you include the `Authorization: Bearer <CRON_SECRET>` header (where `<CRON_SECRET>` is an environment variable) OR ensure your platform sends the `x-vercel-cron: 1` header.

### Styling & Colors

Global colors for appointment statuses are defined in `src/app/globals.css` using CSS variables:
- `--color-appointment-pending-*`
- `--color-appointment-confirmed-*`
- `--color-appointment-cancelled-*`
- `--color-appointment-minor-*`

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
