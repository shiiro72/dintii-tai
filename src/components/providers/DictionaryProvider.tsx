'use client';

import { DICTIONARY_QUERYResult } from '@/types/GeneralTypes';
import { createContext, useContext } from 'react';

export const defaultDictionaryEntries: DICTIONARY_QUERYResult = {
  prices: 'Prices',
  aboutUs: 'About Us',
  pricesTableTitle: 'Prices',
  treatment: 'Treatment',
  contact: 'Contact',
  schedule: 'Schedule',
  login: 'Login',
  email: 'Email',
  addNewUser: 'Add New User',
  logout: 'Logout',
  patients: 'Patients',
  password: 'Password',
  dashboard: 'Dashboard',
  menu: 'Menu',
  general: 'General',
  firstName: 'First Name',
  lastName: 'Last Name',
  phone: 'Phone',
  city: 'City',
  county: 'County',
  patientFile: 'Patient File',
  birthdate: 'Birthdate',
  date: 'Date',
  price: 'Price',
  gdpr: 'GDPR',
  consentFile: 'Consent',
  editPatient: 'Edit Patient',
  addPatient: 'Add Patient',
  deletePatient: 'Delete Patient',
  editTreatment: 'Edit Treatment',
  addTreatment: 'Add Treatment',
  deleteTreatment: 'Delete Treatment',
  profile: 'Profile',
  save: 'Save',
  cancel: 'Cancel',
  cnp: 'CNP',
  backToPatients: 'Back to patients overview',
  successMessage: 'Saved Successfully',
  errorMessage: 'Failed with following error',
  deletePatientMessage: 'Are you sure you want to delete this patient?',
  deleteTreatmentMessage: 'Are you sure you want to delete this treatment?',
  yes: 'Yes',
  no: 'No',
  studio: 'Studio',
  emptyPatientData: 'No patients have been added yet',
  emptyTreatmentData: 'No treatments have been added yet',
  search: 'Search',
  adults: null,
  minors: null,
  backToLogin: null,
  resetPassword: null,
  updatePassword: null,
  forgotPassword: null,
  confirmPassword: null,
  passwordDoNotMatch: null,
  patientAdultNotification: null,
  todoHeadline: 'To-Do List',
  todo: 'To-Do',
  comment: 'Comment',
  done: 'Done',
  deleteTODOItem: 'Delete TODO Item',
  emptyTODOList: 'No TODO items have been added yet',
  addTODOItem: 'Add To-Do',
  editTODOItem: 'Edit To-Do',
  redirectToTodoPage: 'Go to To-Do Page',
  deleteTODOItemMessage:
    'Are you sure you want to delete "{entry}" to-do item?',
  treatments: 'Treatments',
  appointments: {
    appointmentsHeadline: 'Upcoming Appointments',
    goToCalendar: 'Go to calendar',
    selectPatient: 'Select Patient',
    startTime: 'Start Time',
    endTime: 'End Time',
    addAppointment: 'Add Appointment',
    editAppointment: 'Edit Appointment',
    deleteAppointment: 'Delete Appointment',
    deleteAppointmentMessage: 'Are you sure you want to delete this appointment?',
  },
  appointmentsLink: 'Appointments',
};

export const DictionaryContext = createContext<DICTIONARY_QUERYResult | null>(
  defaultDictionaryEntries
);

export default function DictionaryProvider({
  children,
  dictionaryEntries,
}: {
  children: React.ReactNode;
  dictionaryEntries: DICTIONARY_QUERYResult | null;
}) {
  return (
    <DictionaryContext.Provider
      value={dictionaryEntries || defaultDictionaryEntries}
    >
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);

  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }

  return context;
}
