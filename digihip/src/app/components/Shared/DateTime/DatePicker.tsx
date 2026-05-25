"use client";

/* Date Picker File (Uniform modal field for appointments) */

import React, { useMemo } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import styles from '@/components/Shared/DateTime/datePicker.module.css';

let Greek: any = undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Greek = require('flatpickr/dist/l10n/gr').Greek;
} catch (e) {
}
import { format } from 'date-fns';

interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date) => void;
  inline?: boolean;
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, inline = true, placeholder }) => {
  const parsed = value instanceof Date ? value : value ? new Date(value) : undefined;

  const flatpickrOptions = useMemo(
    () => ({
      locale: {
        ...Greek,
        firstDayOfWeek: 1,
      },
      dateFormat: 'Y-m-d',
      inline: inline,
      appendTo: inline ? undefined : (typeof document !== 'undefined' ? document.body : undefined),
      allowInput: false,
      monthSelectorType: 'static' as const,
      prevArrow: '‹',
      nextArrow: '›',
    }),
    [inline]
  );

  return (
    <div>
      {inline ? (
        <>
          <div className={`${styles.selectedDate} ${!parsed ? styles.selectedDatePlaceholder : ''}`}>
            {parsed ? format(parsed, 'dd/MM/yyyy') : placeholder || 'Επιλέξτε ημερομηνία'}
          </div>
          <div className={styles.inlineCalendar}>
            <Flatpickr
              value={parsed}
              onChange={(arr: Date[]) => {
                const d = arr[0];
                if (d) onChange(d);
              }}
              options={flatpickrOptions}
            />
          </div>
        </>
      ) : (
        <Flatpickr
          className={styles.dateInput}
          value={parsed}
          onChange={(arr: Date[]) => {
            const d = arr[0];
            if (d) onChange(d);
          }}
          options={flatpickrOptions}
        />
      )}
    </div>
  );
};

export default DatePicker;
