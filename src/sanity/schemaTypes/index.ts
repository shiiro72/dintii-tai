import { type SchemaTypeDefinition } from 'sanity';

import { blockContentType } from './blockContentType';
import { siteInfoType } from './siteInfoType';
import { treatmentType } from './treatmentType';
import { treatmentGroupType } from './treatmentGroupType';
import { articleType } from './articleType';
import { galleryType } from './galleryType';
import { dictionaryPatientType } from './dictionaryPatientType';
import { dictionaryTreatmentType } from './dictionaryTreatmentType';
import { dictionaryNavigationType } from './dictionaryNavigationType';
import { dictionaryEditType } from './dictionaryEditType';
import { dictionaryGeneralType } from './dictionaryGeneralType';
import { dictionaryFeedbackType } from './dictionaryFeedbackType';
import { dictionaryFormType } from './dictionaryForms';
import { dictionaryTodoType } from './dictionaryTodoType';
import { dictionaryAppointmentsType } from './dictionaryAppointmentsType';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    siteInfoType,
    treatmentType,
    treatmentGroupType,
    articleType,
    galleryType,
    dictionaryPatientType,
    dictionaryTreatmentType,
    dictionaryNavigationType,
    dictionaryEditType,
    dictionaryGeneralType,
    dictionaryFeedbackType,
    dictionaryFormType,
    dictionaryTodoType,
    dictionaryAppointmentsType,
  ],
};
