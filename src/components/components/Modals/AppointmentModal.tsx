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
  onSave?: () => void;
};

export default function AppointmentModal({
  appointment,
  patients,
  selectedDate,
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
  const [searchTerm, setSearchTerm] = useState(
    appointment?.patient
      ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
      : ''
  );
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    appointment?.patient_id || null
  );
  const [startTime, setStartTime] = useState(
    appointment?.start_time
      ? dayjs(appointment.start_time).format('YYYY-MM-DDTHH:mm')
      : selectedDate
        ? dayjs(selectedDate).format('YYYY-MM-DDTHH:mm')
        : dayjs().format('YYYY-MM-DDTHH:mm')
  );
  const [endTime, setEndTime] = useState(
    appointment?.end_time
      ? dayjs(appointment.end_time).format('YYYY-MM-DDTHH:mm')
      : ''
  );

  const availableTimes = useMemo(() => {
    const times = [];
    for (let h = 8; h <= 18; h++) {
      times.push(`${h.toString().padStart(2, '0')}:00`);
      times.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return times;
  }, []);
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

  async function handleSubmit(formData: FormData) {
    try {
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
        if (!confirm('This slot is already reserved. Do you want to proceed?')) {
            return;
        }
      }

      formData.set('startTime', newStart.toISOString());
      formData.set('endTime', newEnd.toISOString());

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
      showFeedback('success', t?.feedback?.successMessage || 'Saved successfully');
      onSave?.();
    } catch (error) {
      showFeedback('error', `${t?.feedback?.errorMessage} ${error}`);
    }
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 font-bold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-y-4">
      <EditPatientForm
        formFunctionality="add"
        formAction={addPatient}
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
        className="w-full"
      />

      <form action={handleSubmit} className="flex flex-col gap-y-4">
        <div className="relative">
          <Input
            label={
              selectedPatientId
                ? t?.navigation?.patients || 'Patients'
                : (t?.general?.search || 'Search') +
                  ' ' +
                  (t?.navigation?.patients || 'Patients')
            }
            element="patientSearch"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedPatientId(null);
              setShowOptions(true);
            }}
            onFocus={() => setShowOptions(true)}
            onBlur={() => setTimeout(() => setShowOptions(false), 200)}
            autoComplete="off"
          >
            {selectedPatientId && (
              <Button
                iconName="close"
                asLink
                onClick={() => {
                  setSelectedPatientId(null);
                  setSearchTerm('');
                }}
                className="absolute right-2 top-3"
              />
            )}
          </Input>
          {showOptions && filteredPatients.length > 0 && !selectedPatientId && (
            <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredPatients.map((p) => (
                <li
                  key={p.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
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
        <input type="hidden" name="patientId" value={selectedPatientId || ''} />

        <div className="flex gap-x-4">
          <Input
            label={t.appointments?.startTime || 'Start Time'}
            element="startTimeDate"
            type="date"
            value={dayjs(startTime).format('YYYY-MM-DD')}
            onChange={(e) => {
              const newDate = e.target.value;
              const currentTime = dayjs(startTime).format('HH:mm');
              setStartTime(`${newDate}T${currentTime}`);
            }}
            required
            containerClassName="flex-1"
          />
          <div className="flex flex-1 flex-col gap-y-1">
            <label className="text-xs text-white">
              {t.appointments?.startTime || 'Start Time'}
            </label>
            <select
              value={dayjs(startTime).format('HH:mm')}
              onChange={(e) => {
                const newTime = e.target.value;
                const currentDate = dayjs(startTime).format('YYYY-MM-DD');
                setStartTime(`${currentDate}T${newTime}`);
              }}
              className="rounded-lg border border-gray-500 bg-white p-3 text-black"
            >
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-x-4">
          <Input
            label={t.appointments?.endTime || 'End Time'}
            element="endTimeDate"
            type="date"
            value={dayjs(endTime).format('YYYY-MM-DD')}
            onChange={(e) => {
              const newDate = e.target.value;
              const currentTime = dayjs(endTime).format('HH:mm');
              setEndTime(`${newDate}T${currentTime}`);
            }}
            required
            containerClassName="flex-1"
          />
          <div className="flex flex-1 flex-col gap-y-1">
            <label className="text-xs text-white">
              {t.appointments?.endTime || 'End Time'}
            </label>
            <select
              value={dayjs(endTime).format('HH:mm')}
              onChange={(e) => {
                const newTime = e.target.value;
                const currentDate = dayjs(endTime).format('YYYY-MM-DD');
                setEndTime(`${currentDate}T${newTime}`);
              }}
              className="rounded-lg border border-gray-500 bg-white p-3 text-black"
            >
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-x-3 mt-4">
          <Button
            label={t?.edit?.cancel || 'Cancel'}
            onClick={closeDialog}
            type="button"
            className="w-full rounded-full"
            iconName="cancel"
          />
          <Button
            label={t?.edit?.save || 'Save'}
            type="submit"
            className="w-full rounded-full"
            iconName="save"
            disabled={!selectedPatientId}
          />
        </div>
      </form>
    </div>
  );
}
