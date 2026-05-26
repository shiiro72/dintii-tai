import {
  DICTIONARY_EDIT_QUERYResult,
  DICTIONARY_FEEDBACK_QUERYResult,
  DICTIONARY_FORM_QUERYResult,
  DICTIONARY_GENERAL_QUERYResult,
  DICTIONARY_NAVIGATION_QUERYResult,
  DICTIONARY_PATIENT_QUERYResult,
  DICTIONARY_TODO_QUERYResult,
  DICTIONARY_TREATMENT_QUERYResult,
  internalGroqTypeReferenceTo,
  SanityImageCrop,
  SanityImageHotspot,
} from '@/sanity/types';

export type FieldString = { value: string | null };

export type SanityImage = {
  image: {
    asset?: {
      _ref: string;
      _type: 'reference';
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
    };
    media?: unknown;
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    alt?: string;
    _type: 'image';
  } | null;
};

export type NavigationLink = {
  name: string;
  href?: string;
  icon: string;
  target?: string;
  onClick?: () => void;
};

export type DICTIONARY_QUERYResult = NonNullable<DICTIONARY_EDIT_QUERYResult> &
  NonNullable<DICTIONARY_GENERAL_QUERYResult> &
  NonNullable<DICTIONARY_NAVIGATION_QUERYResult> &
  NonNullable<DICTIONARY_PATIENT_QUERYResult> &
  NonNullable<DICTIONARY_TREATMENT_QUERYResult> &
  NonNullable<DICTIONARY_FEEDBACK_QUERYResult> &
  NonNullable<DICTIONARY_FORM_QUERYResult> &
  NonNullable<DICTIONARY_TODO_QUERYResult> &
  {
    appointments?: {
      appointmentsHeadline: string | null;
      goToCalendar: string | null;
      selectPatient: string | null;
      startTime: string | null;
      endTime: string | null;
      addAppointment: string | null;
      editAppointment: string | null;
      deleteAppointment: string | null;
      deleteAppointmentMessage: string | null;
    } | null;
    appointmentsLink?: string | null;
  };

export type SupabaseArray = { [key: string]: string }[] | [] | null;

export type PatientCategory = 'adult' | 'minor';

export type LoadRowsParams = {
  from: number;
  to: number;
  ascending?: boolean;
  element?: string;
  id?: number;
  category?: 'adult' | 'minor';
};

export type LoadRowsFunction = (
  params: LoadRowsParams
) => Promise<SupabaseArray | undefined>;
