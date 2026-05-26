import { DocumentTextIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const dictionaryNavigationType = defineType({
  name: 'dictionaryNavigation',
  title: 'Dictionary Navigation',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'menu',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'patients',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'adults',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'minors',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'dashboard',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'appointments',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'general',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'addNewUser',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'logout',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'profile',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'backToPatients',
      type: 'internationalizedArrayString',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Dictionary Entries' };
    },
  },
});
