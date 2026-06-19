'use client';

import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/ro';
import 'dayjs/locale/de';
import { useDictionary } from '@/components/providers/DictionaryProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
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
  const lang = useLanguage();
  const { handleClick, closeDialog, showFeedback } = useDialog();
  const [currentDate, setCurrentDate] = useState(dayjs().locale(lang));
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  useEffect(() => {
    setCurrentDate((prev) => prev.locale(lang));
  }, [lang]);

  const appointments = initialAppointments;

  const startOfWeek = useMemo(
    () => currentDate.startOf('isoWeek'),
    [currentDate]
  );
  const daysOfWeek = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day')),
    [startOfWeek]
  );

  const hours = useMemo(() => {
    const defaultStart = 8;
    const defaultEnd = 18;

    if (initialAppointments.length === 0) {
      return Array.from({ length: defaultEnd - defaultStart + 1 }).map(
        (_, i) => defaultStart + i
      );
    }

    let minHour = defaultStart;
    let maxHour = defaultEnd;

    initialAppointments.forEach((app) => {
      const startHour = dayjs(app.start_time).hour();
      const endHour = dayjs(app.end_time).hour();
      if (startHour < minHour) minHour = startHour;
      if (endHour > maxHour) maxHour = endHour;
    });

    return Array.from({ length: maxHour - minHour + 1 }).map(
      (_, i) => minHour + i
    );
  }, [initialAppointments]);

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const monthDays = Array.from({ length: endOfMonth.date() }).map((_, i) =>
    startOfMonth.add(i, 'day')
  );

  const getAppointmentsForDate = (date: dayjs.Dayjs) => {
    return appointments.filter((app) =>
      dayjs(app.start_time).isSame(date, 'day')
    );
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
      <div className='flex flex-col gap-y-4 p-4'>
        <Button
          label={`Call ${phone}`}
          iconName='call'
          href={`tel:${phone}`}
          className='w-full rounded-full'
        />
        <Button
          label='WhatsApp Message'
          iconName='chat'
          href={getWhatsAppLink(phone)}
          target='_blank'
          className='w-full rounded-full'
        />
        <Button
          label={t?.edit?.cancel || 'Cancel'}
          onClick={closeDialog}
          className='w-full rounded-full'
          iconName='cancel'
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
      showFeedback(
        'success',
        t?.feedback?.successMessage || 'Deleted successfully'
      );
    } catch (error) {
      showFeedback('error', `${t?.feedback?.errorMessage} ${error}`);
    }
  };

  const renderMonthView = () => {
    const dayKeys = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ] as const;

    const dayNames = dayKeys.map(
      (key) =>
        t?.appointments?.[key as keyof typeof t.appointments] ||
        dayjs()
          .isoWeekday(dayKeys.indexOf(key) + 1)
          .locale(lang)
          .format('ddd')
    );

    return (
      <div className='grid grid-cols-7 gap-1'>
        {dayNames.map((d) => (
          <div
            key={d}
            className='bg-base-dark p-2 text-center font-bold text-white'
          >
            {d}
          </div>
        ))}
        {Array.from({ length: startOfMonth.isoWeekday() - 1 }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className='border border-gray-100 bg-gray-50 p-4'
          ></div>
        ))}
        {monthDays.map((day) => {
          const isPast = day.isBefore(dayjs().startOf('day'));
          const isWeekend = day.day() === 0 || day.day() === 6;
          return (
            <div
              key={day.toString()}
              className={`relative min-h-[100px] border border-gray-100 p-1 ${isPast ? 'bg-gray-200 opacity-60 grayscale' : isWeekend ? 'bg-orange-50' : 'bg-white'}`}
            >
              <span
                className={`text-sm ${isWeekend ? 'font-bold text-orange-600' : 'text-gray-500'}`}
              >
                {day.date()}
              </span>
              <div className='relative z-10 mt-1 flex flex-col gap-1'>
                {getAppointmentsForDate(day).map((app) => {
                  const isConfirmed = app.status === 'confirmed';
                  const isCancelled = app.status === 'cancelled';
                  return (
                    <div
                      key={app.id}
                      className={`cursor-pointer truncate rounded p-1 text-[10px] ${
                        isConfirmed
                          ? 'bg-green-100 text-green-800'
                          : isCancelled
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAppointment(app);
                      }}
                    >
                      {dayjs(app.start_time).format('HH:mm')}{' '}
                      {app.patient?.last_name}
                    </div>
                  );
                })}
              </div>
              <div
                className='absolute inset-0 z-0 cursor-pointer bg-blue-500 opacity-0 hover:opacity-10'
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
  };

  const renderWeekView = () => (
    <div className='flex flex-col overflow-x-auto'>
      <div className='flex min-w-[800px] border-b border-gray-200'>
        <div className='w-20 flex-shrink-0'></div>
        {daysOfWeek.map((day) => {
          const isWeekend = day.day() === 0 || day.day() === 6;
          const dayKeys = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
          ] as const;
          const dayName =
            t?.appointments?.[
              dayKeys[day.day()] as keyof typeof t.appointments
            ] || day.locale(lang).format('ddd');

          return (
            <div
              key={day.toString()}
              className={`flex-1 border-l border-gray-200 p-2 text-center ${day.isSame(dayjs(), 'day') ? 'bg-blue-50 font-bold' : isWeekend ? 'bg-orange-600 text-white' : 'bg-base-dark text-white'}`}
            >
              <div>{dayName}</div>
              <div className='text-sm'>{day.format('DD/MM')}</div>
            </div>
          );
        })}
      </div>
      <div className='flex min-w-[800px] flex-col'>
        {hours.map((hour) => (
          <div key={hour} className='flex h-20 border-b border-gray-100'>
            <div className='w-20 flex-shrink-0 py-1 pr-2 text-right text-sm text-gray-400'>
              {hour}:00
            </div>
            {daysOfWeek.map((day) => {
              const dayApps = getAppointmentsForDate(day).filter(
                (app) => dayjs(app.start_time).hour() === hour
              );
              const isPast = day.isBefore(dayjs().startOf('day'));
              const isWeekend = day.day() === 0 || day.day() === 6;
              return (
                <div
                  key={day.toString() + hour}
                  className={`group relative flex-1 border-l border-gray-100 ${isPast ? 'bg-gray-100' : isWeekend ? 'bg-orange-50/30' : 'bg-white'}`}
                  onClick={() => handleSlotClick(day, hour)}
                >
                  {!isPast && (
                    <div className='absolute inset-0 cursor-pointer bg-blue-500 opacity-0 group-hover:opacity-10' />
                  )}
                  {dayApps.map((app) => {
                    const start = dayjs(app.start_time);
                    const end = dayjs(app.end_time);
                    const durationMin = end.diff(start, 'minute');
                    const top = (start.minute() / 60) * 100;
                    const height = (durationMin / 60) * 100;

                    const isConfirmed = app.status === 'confirmed';
                    const isCancelled = app.status === 'cancelled';
                    const isMinor =
                      app.patient?.birthdate &&
                      dayjs().diff(dayjs(app.patient.birthdate), 'year') < 18;

                    let bgColor = isMinor
                      ? 'var(--color-appointment-minor-bg)'
                      : 'var(--color-appointment-pending-bg)';
                    let textColor = isMinor
                      ? 'var(--color-appointment-minor-text)'
                      : 'var(--color-appointment-pending-text)';
                    let borderColor = isMinor
                      ? 'var(--color-appointment-minor-border)'
                      : 'var(--color-appointment-pending-border)';

                    if (isConfirmed) {
                      bgColor = 'var(--color-appointment-confirmed-bg)';
                      textColor = 'var(--color-appointment-confirmed-text)';
                      borderColor = 'var(--color-appointment-confirmed-border)';
                    } else if (isCancelled) {
                      bgColor = 'var(--color-appointment-cancelled-bg)';
                      textColor = 'var(--color-appointment-cancelled-text)';
                      borderColor = 'var(--color-appointment-cancelled-border)';
                    }

                    return (
                      <div
                        key={app.id}
                        className='absolute right-1 left-1 z-10 flex flex-col justify-between overflow-hidden rounded p-1 text-xs border-l-4 shadow-sm'
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                          backgroundColor: bgColor,
                          color: textColor,
                          borderColor: borderColor,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAppointment(app);
                        }}
                      >
                        <div className='flex items-start justify-between font-bold'>
                          <span className='mr-1 truncate'>
                            {start.format('HH:mm')} -{' '}
                            <NextLink
                              href={`${PATIENTS_PATH}/${dayjs().diff(dayjs(app.patient?.birthdate), 'year') < 18 ? 'minor' : 'adult'}/${app.patient?.id}`}
                              className='cursor-pointer hover:underline'
                              onClick={(e) => e.stopPropagation()}
                            >
                              {app.patient?.first_name} {app.patient?.last_name}
                            </NextLink>
                          </span>
                          <div
                            className='flex shrink-0 gap-1'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              iconName='edit'
                              asLink
                              onClick={() => {
                                handleEditAppointment(app);
                              }}
                              iconClassName='!text-xs'
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
                              iconClassName='!text-xs'
                            />
                          </div>
                        </div>
                        {app.phone_number && (
                          <div
                            className='cursor-pointer text-[10px] hover:underline'
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
      <div className='flex flex-col'>
        <div
          className={`p-4 text-center ${isWeekend ? 'bg-orange-600' : 'bg-base-dark'} mb-4 font-bold text-white`}
        >
          {currentDate.locale(lang).format('dddd, MMMM D, YYYY')}
        </div>
        <div className='flex flex-col border border-gray-200'>
          {hours.map((hour) => (
            <div
              key={hour}
              className={`flex h-24 border-b border-gray-100 ${isPast ? 'bg-gray-100' : isWeekend ? 'bg-orange-50' : 'bg-white'} group relative`}
              onClick={() => handleSlotClick(currentDate, hour)}
            >
              <div className='w-24 flex-shrink-0 border-r border-gray-100 py-2 pr-4 text-right font-medium text-gray-400'>
                {hour}:00
              </div>
              <div className='relative flex-1'>
                <div className='absolute inset-0 cursor-pointer bg-blue-500 opacity-0 group-hover:opacity-5' />
                {getAppointmentsForDate(currentDate)
                  .filter((app) => dayjs(app.start_time).hour() === hour)
                  .map((app) => {
                    const isConfirmed = app.status === 'confirmed';
                    const isCancelled = app.status === 'cancelled';
                    const isMinor =
                      app.patient?.birthdate &&
                      dayjs().diff(dayjs(app.patient.birthdate), 'year') < 18;

                    let bgColor = isMinor
                      ? 'var(--color-appointment-minor-bg)'
                      : 'var(--color-appointment-pending-bg)';
                    let textColor = isMinor
                      ? 'var(--color-appointment-minor-text)'
                      : 'var(--color-appointment-pending-text)';
                    let borderColor = isMinor
                      ? 'var(--color-appointment-minor-border)'
                      : 'var(--color-appointment-pending-border)';

                    if (isConfirmed) {
                      bgColor = 'var(--color-appointment-confirmed-bg)';
                      textColor = 'var(--color-appointment-confirmed-text)';
                      borderColor = 'var(--color-appointment-confirmed-border)';
                    } else if (isCancelled) {
                      bgColor = 'var(--color-appointment-cancelled-bg)';
                      textColor = 'var(--color-appointment-cancelled-text)';
                      borderColor = 'var(--color-appointment-cancelled-border)';
                    }

                    return (
                      <div
                        key={app.id}
                        className='absolute right-2 left-2 z-10 flex items-center justify-between rounded border-l-4 p-2 text-sm shadow-md'
                        style={{
                          top: `${(dayjs(app.start_time).minute() / 60) * 100}%`,
                          height: `${(dayjs(app.end_time).diff(dayjs(app.start_time), 'minute') / 60) * 100}%`,
                          backgroundColor: bgColor,
                          color: textColor,
                          borderColor: borderColor,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAppointment(app);
                        }}
                      >
                        <div>
                          <span className='font-bold'>
                            {dayjs(app.start_time).format('HH:mm')} -{' '}
                            {dayjs(app.end_time).format('HH:mm')}
                          </span>
                          <NextLink
                            href={`${PATIENTS_PATH}/${dayjs().diff(dayjs(app.patient?.birthdate), 'year') < 18 ? 'minor' : 'adult'}/${app.patient?.id}`}
                            className='ml-3 cursor-pointer font-semibold hover:underline'
                            onClick={(e) => e.stopPropagation()}
                          >
                            {app.patient?.first_name} {app.patient?.last_name}
                          </NextLink>
                          {app.phone_number && (
                            <span
                              className='ml-3 cursor-pointer text-xs italic hover:underline'
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
                        <div
                          className='flex gap-2'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            iconName='edit'
                            asLink
                            onClick={() => handleEditAppointment(app)}
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
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm md:flex-row'>
        <div className='flex items-center gap-4'>
          <h2 className='text-base-dark text-xl font-bold'>
            {viewMode === 'month' &&
              currentDate.locale(lang).format('MMMM YYYY')}
            {viewMode === 'week' &&
              (t?.appointments?.weekOf || 'Week of {date}').replace(
                '{date}',
                startOfWeek.locale(lang).format('MMM D, YYYY')
              )}
            {viewMode === 'day' && currentDate.locale(lang).format('LL')}
          </h2>
          <div className='flex gap-1'>
            <Button
              iconName='chevron_left'
              asLink
              onClick={() => setCurrentDate(currentDate.subtract(1, viewMode))}
            />
            <Button
              label={t?.appointments?.today || 'Today'}
              asLink
              onClick={() => setCurrentDate(dayjs().locale(lang))}
            />
            <Button
              iconName='chevron_right'
              asLink
              onClick={() => setCurrentDate(currentDate.add(1, viewMode))}
            />
          </div>
        </div>
        <div className='flex rounded-lg bg-gray-100 p-1'>
          {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`cursor-pointer rounded-md px-4 py-1 text-sm transition-all ${viewMode === mode ? 'text-base-dark bg-white font-bold shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t?.appointments?.[mode] ||
                mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        <Button
          label={t?.appointments?.addAppointment || 'Add Appointment'}
          iconName='add'
          onClick={() => handleSlotClick(currentDate, 9)}
          className='rounded-full'
        />
      </div>

      <div className='overflow-hidden rounded-lg bg-white shadow-sm'>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
}
