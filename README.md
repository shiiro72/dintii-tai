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

### Styling & Colors

Global colors for appointment statuses are defined in `src/app/globals.css` using CSS variables:
- `--color-appointment-pending-*`
- `--color-appointment-confirmed-*`
- `--color-appointment-cancelled-*`
- `--color-appointment-minor-*`

### Appointment Status

- **Pending (Default)**: Blue/Purple on calendar.
- **Confirmed**: Green on calendar.
- **Cancelled**: Red on calendar.
