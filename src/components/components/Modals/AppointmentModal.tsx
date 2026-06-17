'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDictionary } from '@/components/providers/DictionaryProvider';
import { useDialog } from '@/components/providers/DialogProvider';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import {
  addAppointment,
  editAppointment,
} from '@/supabase/actions/appointmentActions';
import { addPatient } from '@/supabase/actions/patientActions';
import { EditPatientForm } from '@/components/molecules/EditForm';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  birthdate: string | null;
};

type AppointmentModalProps = {
  appointment?: {
    id: number;
    patient_id: number;
    start_time: string;
    end_time: string;
    phone_number: string | null;
    patient?: Patient;
  };
  patients: Patient[];
  selectedDate?: Date;
  patientId?: number;
  onSave?: () => void;
};

export default function AppointmentModal({
  appointment,
  patients,
  selectedDate,
  patientId,
  onSave,
  initialAppointments = [],
}: AppointmentModalProps & {
  initialAppointments?: {
    id: number;
    start_time: string;
    end_time: string;
  }[];
}) {
  const t = useDictionary();
  const { closeDialog, showFeedback } = useDialog();
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    appointment?.patient_id || patientId || null
  );
  const [searchTerm, setSearchTerm] = useState(() => {
    if (appointment?.patient) {
      return `${appointment.patient.first_name} ${appointment.patient.last_name}`;
    }
    if (patientId) {
      const p = patients.find((p) => p.id === patientId);
      return p ? `${p.first_name} ${p.last_name}` : '';
    }
    return '';
  });
  const [startTime, setStartTime] = useState(() => {
    const initial = appointment?.start_time
      ? dayjs(appointment.start_time)
      : selectedDate
        ? dayjs(selectedDate)
        : dayjs();
    return initial.isValid()
      ? initial.format('YYYY-MM-DDTHH:mm')
      : dayjs().format('YYYY-MM-DDTHH:mm');
  });

  const [endTime, setEndTime] = useState(() => {
    if (appointment?.end_time) {
      const initial = dayjs(appointment.end_time);
      if (initial.isValid()) return initial.format('YYYY-MM-DDTHH:mm');
    }

    const patient = patients.find((p) => p.id === selectedPatientId);
    let duration = 30;
    if (patient) {
      const birthdate = patient.birthdate ? dayjs(patient.birthdate) : null;
      const isAdult = birthdate ? dayjs().diff(birthdate, 'year') >= 18 : true;
      duration = isAdult ? 60 : 30;
    }

    return dayjs(startTime).add(duration, 'minute').format('YYYY-MM-DDTHH:mm');
  });
  const [showOverlapWarning, setShowOverlapWarning] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);

  const [showOptions, setShowOptions] = useState(false);

  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) =>
      `${a.first_name} ${a.last_name}`.localeCompare(
        `${b.first_name} ${b.last_name}`
      )
    );
  }, [patients]);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return sortedPatients;

    const term = searchTerm.toLowerCase();
    return sortedPatients
      .filter((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        const aFullName = `${a.first_name} ${a.last_name}`.toLowerCase();
        const bFullName = `${b.first_name} ${b.last_name}`.toLowerCase();
        const aStarts = aFullName.startsWith(term);
        const bStarts = bFullName.startsWith(term);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aFullName.localeCompare(bFullName);
      });
  }, [sortedPatients, searchTerm]);

  useEffect(() => {
    if (selectedPatientId && startTime && !appointment) {
      const patient = patients.find((p) => p.id === selectedPatientId);
      if (patient) {
        const birthdate = patient.birthdate ? dayjs(patient.birthdate) : null;
        const isAdult = birthdate
          ? dayjs().diff(birthdate, 'year') >= 18
          : true;
        const duration = isAdult ? 60 : 30;
        setEndTime(
          dayjs(startTime).add(duration, 'minute').format('YYYY-MM-DDTHH:mm')
        );
      }
    }
  }, [selectedPatientId, startTime, patients, appointment]);

  const saveAppointment = async () => {
    try {
      const formData = new FormData();
      const newStart = dayjs(startTime);
      const newEnd = dayjs(endTime);

      formData.set('startTime', newStart.toISOString());
      formData.set('endTime', newEnd.toISOString());
      formData.set('patientId', selectedPatientId?.toString() || '');

      if (appointment) {
        formData.append('id', appointment.id.toString());
        await editAppointment(formData);
      } else {
        const patient = patients.find((p) => p.id === selectedPatientId);
        if (patient) {
          formData.append('phone', patient.phone || '');
        }
        await addAppointment(formData);
      }
      closeDialog();
      showFeedback(
        'success',
        t?.feedback?.successMessage || 'Saved successfully'
      );
      onSave?.();
    } catch (error) {
      showFeedback('error', `${t?.feedback?.errorMessage} ${error}`);
    }
  };

  async function handleSubmit() {
    const newStart = dayjs(startTime);
    const newEnd = dayjs(endTime);

    const hasOverlap = initialAppointments.some((app) => {
      if (appointment && app.id === appointment.id) return false;

      const appStart = dayjs(app.start_time);
      const appEnd = dayjs(app.end_time);

      return (
        (newStart.isAfter(appStart) && newStart.isBefore(appEnd)) ||
        (newEnd.isAfter(appStart) && newEnd.isBefore(appEnd)) ||
        (newStart.isSameOrBefore(appStart) && newEnd.isSameOrAfter(appEnd))
      );
    });

    if (hasOverlap) {
      setShowOverlapWarning(true);
      return;
    }

    await saveAppointment();
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className='bg-yellow-200 font-bold'>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  if (showOverlapWarning) {
    return (
      <div className='flex flex-col items-center gap-y-6 text-center'>
        <div className='text-xl text-white'>
          {t?.appointments?.overlapWarning ||
            'This slot is already reserved. Do you want to proceed?'}
        </div>
        <div className='flex w-full gap-x-4'>
          <Button
            label={t?.appointments?.overlapCancel || 'Cancel'}
            onClick={() => setShowOverlapWarning(false)}
            className='w-full rounded-full'
            iconName='arrow_back'
          />
          <Button
            label={t?.appointments?.overlapProceed || 'Proceed'}
            onClick={saveAppointment}
            className='w-full rounded-full'
            iconName='check_circle'
          />
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-y-4'>
      <div className='flex justify-end'>
        <Button
          label={
            showAddPatient
              ? t?.edit?.cancel || 'Cancel'
              : t?.edit?.addPatient || 'Add Patient'
          }
          iconName={showAddPatient ? 'close' : 'person_add'}
          onClick={() => setShowAddPatient(!showAddPatient)}
          asLink
          className='!text-white hover:!text-gray-300'
        />
      </div>

      {showAddPatient && (
        <div className='mb-2 border-b border-white/20 pb-4'>
          <EditPatientForm
            formFunctionality='add'
            formAction={async (formData) => {
              await addPatient(formData);
              setShowAddPatient(false);
            }}
            formFields={[
              {
                label: t?.patient?.firstName || 'First Name',
                element: 'firstName',
                required: true,
              },
              {
                label: t?.patient?.lastName || 'Last Name',
                element: 'lastName',
                required: true,
              },
              {
                label: t?.patient?.phone || 'Phone',
                element: 'phone',
                required: true,
              },
            ]}
            className='w-full'
          />
        </div>
      )}

      <form action={handleSubmit} className='flex flex-col gap-y-4'>
        <div className='relative'>
          <Input
            label={
              selectedPatientId
                ? t?.navigation?.patients || 'Patients'
                : (t?.general?.search || 'Search') +
                  ' ' +
                  (t?.navigation?.patients || 'Patients')
            }
            element='patientSearch'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedPatientId(null);
              setShowOptions(true);
            }}
            onFocus={() => setShowOptions(true)}
            onBlur={() => setTimeout(() => setShowOptions(false), 200)}
            autoComplete='off'
          >
            {selectedPatientId && (
              <Button
                iconName='close'
                asLink
                onClick={() => {
                  setSelectedPatientId(null);
                  setSearchTerm('');
                }}
                className='absolute top-3 right-2'
              />
            )}
          </Input>
          {showOptions && filteredPatients.length > 0 && !selectedPatientId && (
            <ul className='absolute z-50 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg'>
              {filteredPatients.map((p) => (
                <li
                  key={p.id}
                  className='cursor-pointer px-4 py-2 text-black hover:bg-gray-100'
                  onClick={() => {
                    setSelectedPatientId(p.id);
                    setSearchTerm(`${p.first_name} ${p.last_name}`);
                    setShowOptions(false);
                  }}
                >
                  {highlightMatch(`${p.first_name} ${p.last_name}`, searchTerm)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input type='hidden' name='patientId' value={selectedPatientId || ''} />

        <Input
          label={t.treatment?.date || 'Date'}
          element='appointmentDate'
          type='date'
          value={dayjs(startTime).format('YYYY-MM-DD')}
          onChange={(e) => {
            const newDate = e.target.value;
            const currentStartTime = dayjs(startTime).format('HH:mm');
            const currentEndTime = dayjs(endTime).format('HH:mm');
            setStartTime(`${newDate}T${currentStartTime}`);
            setEndTime(`${newDate}T${currentEndTime}`);
          }}
          required
        />

        <div className='flex gap-x-4'>
          <Input
            label={t.appointments?.startTime || 'Start Time'}
            element='startTime'
            type='time'
            value={dayjs(startTime).format('HH:mm')}
            onChange={(e) => {
              const newTime = e.target.value;
              const currentDate = dayjs(startTime).format('YYYY-MM-DD');
              setStartTime(`${currentDate}T${newTime}`);
            }}
            required
            containerClassName='flex-1'
          />
          <Input
            label={t.appointments?.endTime || 'End Time'}
            element='endTime'
            type='time'
            value={dayjs(endTime).format('HH:mm')}
            onChange={(e) => {
              const newTime = e.target.value;
              const currentDate = dayjs(startTime).format('YYYY-MM-DD');
              setEndTime(`${currentDate}T${newTime}`);
            }}
            required
            containerClassName='flex-1'
          />
        </div>

        <div className='mt-4 flex gap-x-3'>
          <Button
            label={t?.edit?.cancel || 'Cancel'}
            onClick={closeDialog}
            type='button'
            className='w-full rounded-full'
            iconName='cancel'
          />
          <Button
            label={t?.edit?.save || 'Save'}
            type='submit'
            className='w-full rounded-full'
            iconName='save'
            disabled={!selectedPatientId}
          />
        </div>
      </form>
    </div>
  );
}
