'use client';

import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useDictionary } from '@/components/providers/DictionaryProvider';
import { Button } from '@/components/atoms/Button';
import { APPOINTMENTS_PATH } from '@/types/GlobalTypes';
import BaseWidget from './BaseWidget';

dayjs.extend(isoWeek);

export function AppointmentWidget({
  appointments,
}: {
  appointments: {
    id: number;
    start_time: string;
    end_time: string;
    patient?: {
      first_name: string;
      last_name: string;
    };
  }[];
}) {
  const dictionary = useDictionary();
  const t = dictionary?.appointments;
  const today = dayjs();
  const startOfWeek = today.startOf('isoWeek');
  const days = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));

  const getAppsForDay = (date: dayjs.Dayjs) => {
    return appointments.filter(app => dayjs(app.start_time).isSame(date, 'day'));
  };

  return (
    <BaseWidget>
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold border-b pb-2">
          {t?.appointmentsHeadline || 'Upcoming Appointments'}
        </h3>

        <div className="grid grid-cols-7 gap-1 mb-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-gray-400 font-bold">{d}</div>
            ))}
            {days.map(day => {
                const dayApps = getAppsForDay(day);
                const isToday = day.isSame(today, 'day');
                return (
                    <div
                        key={day.toString()}
                        className={`flex flex-col items-center p-1 rounded-md ${isToday ? 'bg-blue-100' : ''}`}
                    >
                        <span className={`text-xs ${isToday ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                            {day.date()}
                        </span>
                        {dayApps.length > 0 && (
                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>
                        )}
                    </div>
                );
            })}
        </div>

        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {appointments.filter(app => dayjs(app.start_time).isAfter(dayjs().subtract(1, 'hour'))).slice(0, 5).map(app => (
                <div key={app.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded border-l-4 border-blue-400">
                    <div className="flex flex-col">
                        <span className="font-semibold">{app.patient?.first_name} {app.patient?.last_name}</span>
                        <span className="text-xs text-gray-500">{dayjs(app.start_time).format('MMM D, HH:mm')}</span>
                    </div>
                </div>
            ))}
            {appointments.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-4">No upcoming appointments</p>
            )}
        </div>

        <Button
          label={t?.goToCalendar || 'Go to calendar'}
          href={APPOINTMENTS_PATH}
          className="mt-2"
          iconName="calendar_today"
        />
      </div>
    </BaseWidget>
  );
}
