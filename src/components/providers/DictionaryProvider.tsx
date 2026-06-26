'use client';

import { FULL_DICTIONARY_QUERYResult } from '@/sanity/types';
import { createContext, useContext } from 'react';

export const defaultDictionaryEntries: FULL_DICTIONARY_QUERYResult = {
  navigation: {
    dashboard: 'Dashboard',
    patients: 'Patients',
    adults: 'Adults',
    minors: 'Minors',
    menu: 'Menu',
    general: 'General',
    addNewUser: 'Add New User',
    logout: 'Logout',
    profile: 'Profile',
    backToPatients: 'Back to patients overview',
    appointmentsLink: 'Appointments',
  },
  general: {
    aboutUs: 'About Us',
    prices: 'Prices',
    contact: 'Contact',
    pricesTableTitle: 'Prices',
    schedule: 'Schedule',
    studio: 'Studio',
    search: 'Search',
  },
  edit: {
    addPatient: 'Add Patient',
    editPatient: 'Edit Patient',
    deletePatient: 'Delete Patient',
    addTreatment: 'Add Treatment',
    editTreatment: 'Edit Treatment',
    deleteTreatment: 'Delete Treatment',
    save: 'Save',
    cancel: 'Cancel',
  },
  patient: {
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    email: 'Email',
    city: 'City',
    county: 'County',
    patientFile: 'Patient File',
    gdpr: 'GDPR',
    birthdate: 'Birthdate',
    cnp: 'CNP',
  },
  treatment: {
    treatment: 'Treatment',
    treatments: 'Treatments',
    price: 'Price',
    consentFile: 'Consent',
    date: 'Date',
  },
  feedback: {
    successMessage: 'Saved Successfully',
    errorMessage: 'Failed with following error',
    deletePatientMessage: 'Are you sure you want to delete this patient?',
    deleteTreatmentMessage: 'Are you sure you want to delete this treatment?',
    emptyPatientData: 'No patients have been added yet',
    emptyTreatmentData: 'No treatments have been added yet',
    yes: 'Yes',
    no: 'No',
  },
  form: {
    backToLogin: 'Back to Login',
    resetPassword: 'Reset Password',
    updatePassword: 'Update Password',
    forgotPassword: 'Forgot Password',
    login: 'Login',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    passwordDoNotMatch: 'Passwords do not match',
    patientAdultNotification: 'Patient is an adult',
  },
  todo: {
    todoHeadline: 'To-Do List',
    todo: 'To-Do',
    comment: 'Comment',
    done: 'Done',
    redirectToTodoPage: 'Go to To-Do Page',
    editTODOItem: 'Edit To-Do',
    deleteTODOItem: 'Delete TODO Item',
    emptyTODOList: 'No TODO items have been added yet',
    addTODOItem: 'Add To-Do',
    deleteTODOItemMessage:
      'Are you sure you want to delete "{entry}" to-do item?',
  },
  appointments: {
    appointmentsHeadline: 'Upcoming Appointments',
    goToCalendar: 'Go to calendar',
    selectPatient: 'Select Patient',
    startTime: 'Start Time',
    endTime: 'End Time',
    addAppointment: 'Add Appointment',
    editAppointment: 'Edit Appointment',
    deleteAppointment: 'Delete Appointment',
    deleteAppointmentMessage:
      'Are you sure you want to delete this appointment?',
    overlapWarning: null,
    overlapProceed: null,
    overlapCancel: null,
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    weekOf: 'Week of {date}',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },
};

export const DictionaryContext =
  createContext<FULL_DICTIONARY_QUERYResult | null>(defaultDictionaryEntries);

export default function DictionaryProvider({
  children,
  dictionaryEntries,
}: {
  children: React.ReactNode;
  dictionaryEntries: FULL_DICTIONARY_QUERYResult | null;
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
