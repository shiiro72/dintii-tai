import { defineQuery } from 'next-sanity';

export const SITEINFO_QUERY = defineQuery(`*[_type == "siteInfo"][0]{
  _id,
  title,
  subtitle[_key == $language][0]{value},
  description[_key == $language][0]{value},
  postalCode, 
  city,
  name,
  profession[_key == $language][0]{value},
  logo,
  phone,
  address,
  email, 
  timetable[_key == $language][0]{value},
  loginImage->{
    image
  },
}`);

export const GALLERY_QUERY = defineQuery(`*[_type == "gallery"]{
  _id,
  title,
  image
}`);

export const STAGE_QUERY = defineQuery(`*[_type == "siteInfo"][0]{
  _id,
  motto[_key == $language][0]{value},
  stageImage->{
    image
  },
  name,
  profession[_key == $language][0]{value}
}`);

export const ARTICLE_QUERY = defineQuery(`*[_type == "article"]{
  _id,
  title[_key == $language][0]{value},
  image,
  body[_key == $language][0]{value},
}`);

export const ARTICLE_SLUG_QUERY =
  defineQuery(`*[_type == "article"][slug.current == $slug][0] {
  _id,
  title[_key == $language][0]{value},
  image,
  body[_key == $language][0]{value},
  "plainContent":pt::text(body[_key == $language].value)
}`);

export const TREATMENT_QUERY =
  defineQuery(`*[_type == "treatmentGroup"] | order(order asc) {
  _id,
  name[_key == $language][0]{value},
  order,
  slug,
  "treatments": *[_type == "treatment" && references(^._id)]
    | order(name[_key == $language][0].value asc) {
      _id,
      name[_key == $language][0]{value},
      price,
      slug
    }
}`);

export const DICTIONARY_GENERAL_QUERY =
  defineQuery(`*[_type == "dictionaryGeneral"][0]{
    "aboutUs":aboutUs[_key == $language][0].value,
    "prices": prices[_key == $language][0].value,
    "contact":contact[_key == $language][0].value,
    "pricesTableTitle":pricesTableTitle[_key == $language][0].value,
    "schedule":schedule[_key == $language][0].value,
    "studio":studio,
    "search":search[_key == $language][0].value,
  }`);

export const DICTIONARY_NAVIGATION_QUERY =
  defineQuery(`*[_type == "dictionaryNavigation"][0]{
    "dashboard":dashboard[_key == $language][0].value,
    "patients":patients[_key == $language][0].value,
    "adults":adults[_key == $language][0].value,
    "minors":minors[_key == $language][0].value,
    "menu":menu[_key == $language][0].value,
    "general":general[_key == $language][0].value,
    "addNewUser":addNewUser[_key == $language][0].value,
    "logout":logout[_key == $language][0].value,
    "profile": profile[_key == $language][0].value,
    "backToPatients": backToPatients[_key == $language][0].value,
  }`);

export const DICTIONARY_EDIT_QUERY =
  defineQuery(`*[_type == "dictionaryEdit"][0]{
    "addPatient": addPatient[_key == $language][0].value,
    "editPatient": editPatient[_key == $language][0].value,
    "deletePatient": deletePatient[_key == $language][0].value,
    "addTreatment": addTreatment[_key == $language][0].value,
    "editTreatment": editTreatment[_key == $language][0].value,
    "deleteTreatment": deleteTreatment[_key == $language][0].value,
    "save": save[_key == $language][0].value,
    "cancel": cancel[_key == $language][0].value,
  }`);

export const DICTIONARY_PATIENT_QUERY =
  defineQuery(`*[_type == "dictionaryPatient"][0]{
    "firstName": firstName[_key == $language][0].value,
    "lastName": lastName[_key == $language][0].value,
    "phone": phone[_key == $language][0].value,
    "email": email[_key == $language][0].value,
    "city": city[_key == $language][0].value,
    "county": county[_key == $language][0].value,
    "patientFile": patientFile[_key == $language][0].value,
    "gdpr": gdpr[_key == $language][0].value,
    "birthdate": birthdate[_key == $language][0].value,
    "cnp": cnp
  }`);

export const DICTIONARY_TREATMENT_QUERY =
  defineQuery(`*[_type == "dictionaryTreatment"][0]{
    "treatment": treatment[_key == $language][0].value,
    "treatments": treatments[_key == $language][0].value,
    "price": price[_key == $language][0].value,
    "consentFile": consentFile[_key == $language][0].value,
    "date": date[_key == $language][0].value,
  }`);

export const DICTIONARY_FEEDBACK_QUERY =
  defineQuery(`*[_type == "dictionaryFeedback"][0]{
    "successMessage": successMessage[_key == $language][0].value,
    "errorMessage": errorMessage[_key == $language][0].value,
    "deletePatientMessage": deletePatientMessage[_key == $language][0].value,
    "deleteTreatmentMessage": deleteTreatmentMessage[_key == $language][0].value,
    "emptyPatientData": emptyPatientData[_key == $language][0].value,
    "emptyTreatmentData": emptyTreatmentData[_key == $language][0].value,
    "yes": yes[_key == $language][0].value,
    "no": no[_key == $language][0].value,
  }`);

export const DICTIONARY_FORM_QUERY =
  defineQuery(`*[_type == "dictionaryForm"][0]{
    "backToLogin":backToLogin[_key == $language][0].value,
    "resetPassword": resetPassword[_key == $language][0].value,
    "updatePassword":updatePassword[_key == $language][0].value,
    "forgotPassword":forgotPassword[_key == $language][0].value,
    "login":login[_key == $language][0].value,
    "email":email[_key == $language][0].value,
    "password":password[_key == $language][0].value,
    "confirmPassword":confirmPassword[_key == $language][0].value,
    "passwordDoNotMatch":passwordDoNotMatch[_key == $language][0].value,
    "patientAdultNotification":patientAdultNotification[_key == $language][0].value,
  }`);

export const DICTIONARY_TODO_QUERY =
  defineQuery(`*[_type == "dictionaryTodo"][0]{
    "todoHeadline": todoHeadline[_key == $language][0].value,
    "todo": todo[_key == $language][0].value,
    "comment": comment[_key == $language][0].value,
    "done": done[_key == $language][0].value,
    "redirectToTodoPage": redirectToTodoPage[_key == $language][0].value,
    "editTODOItem": editTODOItem[_key == $language][0].value,
    "deleteTODOItem": deleteTODOItem[_key == $language][0].value,
    "emptyTODOList": emptyTODOList[_key == $language][0].value,
    "addTODOItem": addTODOItem[_key == $language][0].value,
    "deleteTODOItemMessage": deleteTODOItemMessage[_key == $language][0].value,
  }`);

export const FULL_DICTIONARY_QUERY = defineQuery(`{
  "navigation": *[_type == "dictionaryNavigation"][0]{
    "dashboard":dashboard[_key == $language][0].value,
    "patients":patients[_key == $language][0].value,
    "adults":adults[_key == $language][0].value,
    "minors":minors[_key == $language][0].value,
    "menu":menu[_key == $language][0].value,
    "general":general[_key == $language][0].value,
    "addNewUser":addNewUser[_key == $language][0].value,
    "logout":logout[_key == $language][0].value,
    "profile": profile[_key == $language][0].value,
    "backToPatients": backToPatients[_key == $language][0].value,
    "appointmentsLink": appointments[_key == $language][0].value,
  },
  "general": *[_type == "dictionaryGeneral"][0]{
    "aboutUs":aboutUs[_key == $language][0].value,
    "prices": prices[_key == $language][0].value,
    "contact":contact[_key == $language][0].value,
    "pricesTableTitle":pricesTableTitle[_key == $language][0].value,
    "schedule":schedule[_key == $language][0].value,
    "studio":studio,
    "search":search[_key == $language][0].value,
  },
  "edit": *[_type == "dictionaryEdit"][0]{
    "addPatient": addPatient[_key == $language][0].value,
    "editPatient": editPatient[_key == $language][0].value,
    "deletePatient": deletePatient[_key == $language][0].value,
    "addTreatment": addTreatment[_key == $language][0].value,
    "editTreatment": editTreatment[_key == $language][0].value,
    "deleteTreatment": deleteTreatment[_key == $language][0].value,
    "save": save[_key == $language][0].value,
    "cancel": cancel[_key == $language][0].value,
  },
  "patient": *[_type == "dictionaryPatient"][0]{
    "firstName": firstName[_key == $language][0].value,
    "lastName": lastName[_key == $language][0].value,
    "phone": phone[_key == $language][0].value,
    "email": email[_key == $language][0].value,
    "city": city[_key == $language][0].value,
    "county": county[_key == $language][0].value,
    "patientFile": patientFile[_key == $language][0].value,
    "gdpr": gdpr[_key == $language][0].value,
    "birthdate": birthdate[_key == $language][0].value,
    "cnp": cnp
  },
  "treatment": *[_type == "dictionaryTreatment"][0]{
    "treatment": treatment[_key == $language][0].value,
    "treatments": treatments[_key == $language][0].value,
    "price": price[_key == $language][0].value,
    "consentFile": consentFile[_key == $language][0].value,
    "date": date[_key == $language][0].value,
  },
  "feedback": *[_type == "dictionaryFeedback"][0]{
    "successMessage": successMessage[_key == $language][0].value,
    "errorMessage": errorMessage[_key == $language][0].value,
    "deletePatientMessage": deletePatientMessage[_key == $language][0].value,
    "deleteTreatmentMessage": deleteTreatmentMessage[_key == $language][0].value,
    "emptyPatientData": emptyPatientData[_key == $language][0].value,
    "emptyTreatmentData": emptyTreatmentData[_key == $language][0].value,
    "yes": yes[_key == $language][0].value,
    "no": no[_key == $language][0].value,
  },
  "form": *[_type == "dictionaryForm"][0]{
    "backToLogin":backToLogin[_key == $language][0].value,
    "resetPassword": resetPassword[_key == $language][0].value,
    "updatePassword":updatePassword[_key == $language][0].value,
    "forgotPassword":forgotPassword[_key == $language][0].value,
    "login":login[_key == $language][0].value,
    "email":email[_key == $language][0].value,
    "password":password[_key == $language][0].value,
    "confirmPassword":confirmPassword[_key == $language][0].value,
    "passwordDoNotMatch":passwordDoNotMatch[_key == $language][0].value,
    "patientAdultNotification":patientAdultNotification[_key == $language][0].value,
  },
  "todo": *[_type == "dictionaryTodo"][0]{
    "todoHeadline": todoHeadline[_key == $language][0].value,
    "todo": todo[_key == $language][0].value,
    "comment": comment[_key == $language][0].value,
    "done": done[_key == $language][0].value,
    "redirectToTodoPage": redirectToTodoPage[_key == $language][0].value,
    "editTODOItem": editTODOItem[_key == $language][0].value,
    "deleteTODOItem": deleteTODOItem[_key == $language][0].value,
    "emptyTODOList": emptyTODOList[_key == $language][0].value,
    "addTODOItem": addTODOItem[_key == $language][0].value,
    "deleteTODOItemMessage": deleteTODOItemMessage[_key == $language][0].value,
  },
  "appointments": *[_type == "dictionaryAppointments"][0]{
    "appointmentsHeadline": appointmentsHeadline[_key == $language][0].value,
    "goToCalendar": goToCalendar[_key == $language][0].value,
    "selectPatient": selectPatient[_key == $language][0].value,
    "startTime": startTime[_key == $language][0].value,
    "endTime": endTime[_key == $language][0].value,
    "addAppointment": addAppointment[_key == $language][0].value,
    "editAppointment": editAppointment[_key == $language][0].value,
    "deleteAppointment": deleteAppointment[_key == $language][0].value,
    "deleteAppointmentMessage": deleteAppointmentMessage[_key == $language][0].value,
    "overlapWarning": overlapWarning[_key == $language][0].value,
    "overlapProceed": overlapProceed[_key == $language][0].value,
    "overlapCancel": overlapCancel[_key == $language][0].value,
    "today": today[_key == $language][0].value,
    "month": month[_key == $language][0].value,
    "week": week[_key == $language][0].value,
    "day": day[_key == $language][0].value,
    "weekOf": weekOf[_key == $language][0].value,
    "monday": monday[_key == $language][0].value,
    "tuesday": tuesday[_key == $language][0].value,
    "wednesday": wednesday[_key == $language][0].value,
    "thursday": thursday[_key == $language][0].value,
    "friday": friday[_key == $language][0].value,
    "saturday": saturday[_key == $language][0].value,
    "sunday": sunday[_key == $language][0].value,
  }
}`);
