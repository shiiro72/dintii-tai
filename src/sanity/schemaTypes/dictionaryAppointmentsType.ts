import { CalendarIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const dictionaryAppointmentsType = defineType({
  name: 'dictionaryAppointments',
  title: 'Dictionary Appointments',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'appointmentsHeadline',
      title: 'Appointments Headline',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'goToCalendar',
      title: 'Go to Calendar Button',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'selectPatient',
      title: 'Select Patient Label',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'startTime',
      title: 'Start Time Label',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'endTime',
      title: 'End Time Label',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'addAppointment',
      title: 'Add Appointment',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'editAppointment',
      title: 'Edit Appointment',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'deleteAppointment',
      title: 'Delete Appointment',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'deleteAppointmentMessage',
      title: 'Delete Appointment Message',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'overlapWarning',
      title: 'Overlap Warning Message',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'overlapProceed',
      title: 'Overlap Proceed Button',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'overlapCancel',
      title: 'Overlap Cancel Button',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'today',
      title: 'Today Label',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'month',
      title: 'Month Label',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'week',
      title: 'Week Label',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'day',
      title: 'Day Label',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'weekOf',
      title: 'Week Of Label',
      type: 'internationalizedArrayString',
      description: 'e.g. Week of {date}',
    }),
    defineField({
      name: 'monday',
      title: 'Monday',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'tuesday',
      title: 'Tuesday',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'wednesday',
      title: 'Wednesday',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'thursday',
      title: 'Thursday',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'friday',
      title: 'Friday',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'saturday',
      title: 'Saturday',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'sunday',
      title: 'Sunday',
      type: 'internationalizedArrayString',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Appointments Dictionary Entries' };
    },
  },
});
