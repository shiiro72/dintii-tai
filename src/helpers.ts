import { SanityDocument } from 'next-sanity';
import { TREATMENT_CONSENT } from './types/GlobalTypes';

export function getEnglishNameFromInternationalizedField(
  document: SanityDocument,
  element: string
): string {
  const array = document?.[element];

  if (Array.isArray(array)) {
    const roTitle = array.find((item) => item._key === 'ro')?.value;
    return roTitle;
  }

  return 'untitled';
}

export function getInternationalizedPreviewTitle(
  selection: Record<'title', string>
): { title: string } {
  const { title, ...rest } = selection;

  const roTitle = Array.isArray(title)
    ? title.find((item) => item._key === 'ro')?.value || 'No title'
    : 'No title';

  return {
    title: roTitle,
    ...rest,
  };
}

export function triggerEvent(eventName: string, data: string | boolean) {
  const event = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(event);
}

export function subscribeToEvent(
  eventName: string,
  customFunction: (e: CustomEvent) => void
) {
  document.addEventListener(eventName, (e: Event) => {
    customFunction(e as CustomEvent);
  });
}

export function unsubscribeFromEvent(eventName: string) {
  document.removeEventListener(eventName, () => {});
}

export function convertSnakeToCamelCase(snakeCaseString: string): string {
  if (!snakeCaseString.includes('_')) return snakeCaseString;

  return snakeCaseString
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
}

export function removeLocaleFromPathName(pathName: string): string {
  return pathName.substring(pathName.indexOf('/', 1));
}

export function getWhatsAppLink(phoneNumber: string) {
  let phoneNumberWithCountryCode = phoneNumber;

  if (!phoneNumber.includes('+'))
    phoneNumberWithCountryCode = `+40${phoneNumber}`;

  return `https://wa.me/${phoneNumberWithCountryCode}`;
}

export const replaceEntry = (message: string, entry: string) =>
  message?.replace('{entry}', entry);

export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function getPatientFileName(
  id: string | number,
  fileName: string
): string {
  return `${id}/${fileName}`.trim();
}

export function getTreatmentConsentFileName(
  treatmentID: string | number
): string {
  return `${TREATMENT_CONSENT}/${treatmentID}`.trim();
}
