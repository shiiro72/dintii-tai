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
  ],
  preview: {
    prepare() {
      return { title: 'Appointments Dictionary Entries' };
    },
  },
});
