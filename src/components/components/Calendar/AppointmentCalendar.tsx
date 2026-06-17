'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useDictionary } from '@/components/providers/DictionaryProvider';
import { useDialog } from '@/components/providers/DialogProvider';
import { Button } from '@/components/atoms/Button';
import AppointmentModal from '../Modals/AppointmentModal';
import { deleteAppointment } from '@/supabase/actions/appointmentActions';
import DeleteButton from '@/components/molecules/DeleteButton';
import { getWhatsAppLink } from '@/helpers';
import { PATIENTS_PATH } from '@/types/GlobalTypes';
import NextLink from 'next/link';

dayjs.extend(isoWeek);

type ViewMode = 'month' | 'week' | 'day';

type AppointmentWithPatient = {
    id: number;
    patient_id: number;
    start_time: string;
    end_time: string;
    phone_number: string | null;
    status?: 'pending' | 'confirmed' | 'cancelled';
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string;
        birthdate: string | null;
    };
};

export default function AppointmentCalendar({
  initialAppointments,
  patients,
}: {
  initialAppointments: AppointmentWithPatient[];
  patients: {
      id: number;
      first_name: string;
      last_name: string;
      phone: string;
      birthdate: string | null;
  }[];
}) {
  const dictionary = useDictionary();
  const t = dictionary;
  const { handleClick, closeDialog, showFeedback } = useDialog();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  const appointments = initialAppointments;

  const startOfWeek = currentDate.startOf('isoWeek');
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));
  const hours = Array.from({ length: 11 }).map((_, i) => 8 + i); // 8 to 18

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const monthDays = Array.from({ length: endOfMonth.date() }).map((_, i) => startOfMonth.add(i, 'day'));

  const getAppointmentsForDate = (date: dayjs.Dayjs) => {
    return appointments.filter(app => dayjs(app.start_time).isSame(date, 'day'));
  };

  const handleSlotClick = (date: dayjs.Dayjs, hour: number) => {
    if (date.isBefore(dayjs().startOf('day'))) return;

    const selectedDate = date.hour(hour).minute(0).second(0).toDate();
    handleClick(
      <AppointmentModal
        patients={patients}
        selectedDate={selectedDate}
        onSave={() => {
            // refresh data
        }}
        initialAppointments={appointments}
      />,
      t?.appointments?.addAppointment || 'Add Appointment'
    );
  };

  const handlePhoneClick = (phone: string) => {
    handleClick(
      <div className="flex flex-col gap-y-4 p-4">
        <Button
          label={`Call ${phone}`}
          iconName="call"
          href={`tel:${phone}`}
          className="w-full rounded-full"
        />
        <Button
          label="WhatsApp Message"
          iconName="chat"
          href={getWhatsAppLink(phone)}
          target="_blank"
          className="w-full rounded-full"
        />
        <Button
          label={t?.edit?.cancel || 'Cancel'}
          onClick={closeDialog}
          className="w-full rounded-full"
          iconName="cancel"
        />
      </div>,
      'Phone Actions'
    );
  };

  const handleEditAppointment = (app: AppointmentWithPatient) => {
    handleClick(
      <AppointmentModal
        appointment={app}
        patients={patients}
        initialAppointments={appointments}
      />,
      t?.appointments?.editAppointment || 'Edit Appointment'
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAppointment(id);
      showFeedback('success', t?.feedback?.successMessage || 'Deleted successfully');
    } catch (error) {
      showFeedback('error', `${t?.feedback?.errorMessage} ${error}`);
    }
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
        <div
          key={d}
          className="bg-base-dark p-2 text-center font-bold text-white"
        >
          {d}
        </div>
      ))}
      {Array.from({ length: startOfMonth.isoWeekday() - 1 }).map((_, i) => (
        <div key={`empty-${i}`} className="border border-gray-100 bg-gray-50 p-4"></div>
      ))}
      {monthDays.map((day) => {
        const isPast = day.isBefore(dayjs().startOf('day'));
        const isWeekend = day.day() === 0 || day.day() === 6;
        return (
          <div
            key={day.toString()}
            className={`relative min-h-[100px] border border-gray-100 p-1 ${isPast ? 'bg-gray-200 grayscale opacity-60' : isWeekend ? 'bg-orange-50' : 'bg-white'}`}
          >
            <span className={`text-sm ${isWeekend ? 'font-bold text-orange-600' : 'text-gray-500'}`}>{day.date()}</span>
            <div className="relative z-10 mt-1 flex flex-col gap-1">
                  {getAppointmentsForDate(day).map((app) => {
                const isConfirmed = app.status === 'confirmed';
                const isCancelled = app.status === 'cancelled';
                return (
                  <div
                    key={app.id}
                    className={`cursor-pointer truncate rounded p-1 text-[10px] ${
                      isConfirmed ? 'bg-green-100 text-green-800' :
                      isCancelled ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAppointment(app);
                    }}
                  >
                    {dayjs(app.start_time).format('HH:mm')} {app.patient?.last_name}
                  </div>
                );
              })}
            </div>
            <div
              className="absolute inset-0 z-0 cursor-pointer bg-blue-500 opacity-0 hover:opacity-10"
              onClick={() => {
                setCurrentDate(day);
                setViewMode('day');
              }}
            />
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="flex flex-col overflow-x-auto">
      <div className="flex border-b border-gray-200 min-w-[800px]">
        <div className="w-20 flex-shrink-0"></div>
        {daysOfWeek.map((day) => {
          const isWeekend = day.day() === 0 || day.day() === 6;
          return (
            <div
              key={day.toString()}
              className={`flex-1 border-l border-gray-200 p-2 text-center ${day.isSame(dayjs(), 'day') ? 'bg-blue-50 font-bold' : isWeekend ? 'bg-orange-600 text-white' : 'bg-base-dark text-white'}`}
            >
              <div>{day.format('ddd')}</div>
              <div className="text-sm">{day.format('DD/MM')}</div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col min-w-[800px]">
        {hours.map(hour => (
          <div key={hour} className="flex border-b border-gray-100 h-20">
            <div className="w-20 flex-shrink-0 text-right pr-2 text-gray-400 text-sm py-1">
              {hour}:00
            </div>
            {daysOfWeek.map(day => {
              const dayApps = getAppointmentsForDate(day).filter(app => dayjs(app.start_time).hour() === hour);
              const isPast = day.isBefore(dayjs().startOf('day'));
              const isWeekend = day.day() === 0 || day.day() === 6;
              return (
                <div
                  key={day.toString() + hour}
                  className={`flex-1 border-l border-gray-100 relative group ${isPast ? 'bg-gray-100' : isWeekend ? 'bg-orange-50/30' : 'bg-white'}`}
                  onClick={() => handleSlotClick(day, hour)}
                >
                  {!isPast && <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-blue-500 cursor-pointer" />}
                  {dayApps.map(app => {
                    const start = dayjs(app.start_time);
                    const end = dayjs(app.end_time);
                    const durationMin = end.diff(start, 'minute');
                    const top = (start.minute() / 60) * 100;
                    const height = (durationMin / 60) * 100;

                    const isConfirmed = app.status === 'confirmed';
                    const isCancelled = app.status === 'cancelled';
                    const isMinor = app.patient?.birthdate && dayjs().diff(dayjs(app.patient.birthdate), 'year') < 18;

                    let bgColor = isMinor ? '#e9d5ff' : '#bfdbfe';
                    let textColor = isMinor ? '#6b21a8' : '#1e40af';
                    let borderColor = isMinor ? '#a855f7' : '#3b82f6';

                    if (isConfirmed) {
                      bgColor = '#dcfce7';
                      textColor = '#166534';
                      borderColor = '#22c55e';
                    } else if (isCancelled) {
                      bgColor = '#fee2e2';
                      textColor = '#991b1b';
                      borderColor = '#ef4444';
                    }

                    return (
                      <div
                        key={app.id}
                        className="absolute left-1 right-1 rounded p-1 text-xs overflow-hidden z-10 flex flex-col justify-between shadow-sm"
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                          backgroundColor: bgColor,
                          color: textColor,
                          borderLeft: `4px solid ${borderColor}`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAppointment(app);
                        }}
                      >
                        <div className="font-bold flex justify-between items-start">
                          <span className="truncate mr-1">
                            {start.format('HH:mm')} -{' '}
                            <NextLink
                              href={`${PATIENTS_PATH}/${dayjs().diff(dayjs(app.patient?.birthdate), 'year') < 18 ? 'minor' : 'adult'}/${app.patient?.id}`}
                              className="cursor-pointer hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {app.patient?.first_name} {app.patient?.last_name}
                            </NextLink>
                          </span>
                          <div
                            className="flex shrink-0 gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              iconName="edit"
                              asLink
                              onClick={() => {
                                handleEditAppointment(app);
                              }}
                              iconClassName="!text-xs"
                            />
                            <DeleteButton
                              deleteAction={() => handleDelete(app.id)}
                              message={
                                t?.appointments?.deleteAppointmentMessage ||
                                'Delete this appointment?'
                              }
                              asLink
                              dialogHeadline={
                                t?.appointments?.deleteAppointment ||
                                'Delete Appointment'
                              }
                              iconClassName="!text-xs"
                            />
                          </div>
                        </div>
                        {app.phone_number && (
                          <div
                            className="cursor-pointer text-[10px] hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (app.phone_number)
                                handlePhoneClick(app.phone_number);
                            }}
                          >
                            {app.phone_number}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDayView = () => {
    const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;
    const isPast = currentDate.isBefore(dayjs().startOf('day'));

    return (
    <div className="flex flex-col">
       <div className={`text-center p-4 ${isWeekend ? 'bg-orange-600' : 'bg-base-dark'} text-white font-bold mb-4`}>
          {currentDate.format('dddd, MMMM D, YYYY')}
       </div>
       <div className="flex flex-col border border-gray-200">
          {hours.map(hour => (
             <div key={hour} className={`flex border-b border-gray-100 h-24 ${isPast ? 'bg-gray-100' : isWeekend ? 'bg-orange-50' : 'bg-white'} relative group`} onClick={() => handleSlotClick(currentDate, hour)}>
                <div className="w-24 flex-shrink-0 text-right pr-4 text-gray-400 font-medium py-2 border-r border-gray-100">
                    {hour}:00
                </div>
                <div className="flex-1 relative">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-blue-500 cursor-pointer" />
                    {getAppointmentsForDate(currentDate).filter(app => dayjs(app.start_time).hour() === hour).map(app => {
                         const isConfirmed = app.status === 'confirmed';
                         const isCancelled = app.status === 'cancelled';
                         const isMinor = app.patient?.birthdate && dayjs().diff(dayjs(app.patient.birthdate), 'year') < 18;

                         let bgColor = isMinor ? '#f3e8ff' : '#dbeafe';
                         let textColor = isMinor ? '#581c87' : '#1e3a8a';
                         let borderColor = isMinor ? '#a855f7' : '#3b82f6';

                         if (isConfirmed) {
                           bgColor = '#f0fdf4';
                           textColor = '#166534';
                           borderColor = '#22c55e';
                         } else if (isCancelled) {
                           bgColor = '#fef2f2';
                           textColor = '#991b1b';
                           borderColor = '#ef4444';
                         }

                         return (
                           <div
                             key={app.id}
                             className="absolute left-2 right-2 rounded p-2 text-sm z-10 flex justify-between items-center shadow-md border-l-4"
                             style={{
                               top: `${(dayjs(app.start_time).minute() / 60) * 100}%`,
                               height: `${(dayjs(app.end_time).diff(dayjs(app.start_time), 'minute') / 60) * 100}%`,
                               backgroundColor: bgColor,
                               color: textColor,
                               borderColor: borderColor
                             }}
                             onClick={(e) => {
                               e.stopPropagation();
                               handleEditAppointment(app);
                             }}
                           >
                         <div>
                            <span className="font-bold">{dayjs(app.start_time).format('HH:mm')} - {dayjs(app.end_time).format('HH:mm')}</span>
                            <NextLink
                              href={`${PATIENTS_PATH}/${dayjs().diff(dayjs(app.patient?.birthdate), 'year') < 18 ? 'minor' : 'adult'}/${app.patient?.id}`}
                              className="ml-3 cursor-pointer font-semibold hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {app.patient?.first_name} {app.patient?.last_name}
                            </NextLink>
                            {app.phone_number && (
                              <span
                                className="ml-3 cursor-pointer text-xs italic hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (app.phone_number)
                                    handlePhoneClick(app.phone_number);
                                }}
                              >
                                {app.phone_number}
                              </span>
                            )}
                          </div>
                         <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                             <Button iconName="edit" asLink onClick={() => handleEditAppointment(app)} />
                             <DeleteButton
                                deleteAction={() => handleDelete(app.id)}
                                message={t?.appointments?.deleteAppointmentMessage || 'Delete this appointment?'}
                                asLink
                                 dialogHeadline={t?.appointments?.deleteAppointment || 'Delete Appointment'}
                             />
                         </div>
                           </div>
                         );
                    })}
                </div>
             </div>
          ))}
       </div>
    </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-base-dark">
            {viewMode === 'month' && currentDate.format('MMMM YYYY')}
            {viewMode === 'week' && `Week of ${startOfWeek.format('MMM D, YYYY')}`}
            {viewMode === 'day' && currentDate.format('MMM D, YYYY')}
          </h2>
          <div className="flex gap-1">
            <Button iconName="chevron_left" asLink onClick={() => setCurrentDate(currentDate.subtract(1, viewMode))} />
            <Button label="Today" asLink onClick={() => setCurrentDate(dayjs())} />
            <Button iconName="chevron_right" asLink onClick={() => setCurrentDate(currentDate.add(1, viewMode))} />
          </div>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`cursor-pointer px-4 py-1 rounded-md text-sm transition-all ${viewMode === mode ? 'bg-white shadow text-base-dark font-bold' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        <Button
            label={t?.appointments?.addAppointment || 'Add Appointment'}
            iconName="add"
            onClick={() => handleSlotClick(currentDate, 9)}
            className="rounded-full"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
}
