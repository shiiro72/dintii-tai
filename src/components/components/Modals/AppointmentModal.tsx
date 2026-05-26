'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDictionary } from '@/components/providers/DictionaryProvider';
import { useDialog } from '@/components/providers/DialogProvider';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import dayjs from 'dayjs';
import {
  addAppointment,
  editAppointment,
} from '@/supabase/actions/appointmentActions';
import { addPatient } from '@/supabase/actions/patientActions';
import { EditPatientForm } from '@/components/molecules/EditForm';

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
}: AppointmentModalProps) {
  const t = useDictionary();
  const { closeDialog, showFeedback } = useDialog();
  const [searchTerm, setSearchTerm] = useState('');
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
      showFeedback('success', t.successMessage || 'Saved successfully');
      onSave?.();
    } catch (error) {
      showFeedback('error', `${t.errorMessage} ${error}`);
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
      {!selectedPatientId && (
        <EditPatientForm
          formFunctionality="add"
          formAction={addPatient}
          formFields={[
            { label: t.firstName, element: 'firstName', required: true },
            { label: t.lastName, element: 'lastName', required: true },
            { label: t.phone, element: 'phone', required: true },
          ]}
          className="w-full"
        />
      )}

      <form action={handleSubmit} className="flex flex-col gap-y-4">
        <div className="relative">
          <Input
            label={t.search + ' ' + t.patients}
            element="patientSearch"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowOptions(true);
            }}
            onFocus={() => setShowOptions(true)}
            onBlur={() => setTimeout(() => setShowOptions(false), 200)}
            autoComplete="off"
          />
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

        {selectedPatientId && (
          <div className="bg-gray-100 p-2 rounded text-black flex justify-between items-center">
            <span>
              {patients.find((p) => p.id === selectedPatientId)?.first_name}{' '}
              {patients.find((p) => p.id === selectedPatientId)?.last_name}
            </span>
            <Button
              iconName="close"
              asLink
              onClick={() => {
                setSelectedPatientId(null);
                setSearchTerm('');
              }}
            />
          </div>
        )}
        <input type="hidden" name="patientId" value={selectedPatientId || ''} />

        <Input
          label={t.appointments?.startTime || 'Start Time'}
          element="startTime"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />

        <Input
          label={t.appointments?.endTime || 'End Time'}
          element="endTime"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />

        <div className="flex gap-x-3 mt-4">
          <Button
            label={t.cancel || 'Cancel'}
            onClick={closeDialog}
            type="button"
            className="w-full rounded-full"
            iconName="cancel"
          />
          <Button
            label={t.save || 'Save'}
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
