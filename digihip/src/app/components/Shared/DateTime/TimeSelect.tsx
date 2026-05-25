/* Time Select File (Uniform modal field for appointments) */

import React, { useState, useRef, useEffect } from 'react';
import styles from '@/components/Shared/DateTime/datePicker.module.css';

interface TimeSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

const TimeSelect: React.FC<TimeSelectProps> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [open]);

  const handleSelect = (e: React.MouseEvent<HTMLButtonElement>, option: string) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(option);
    setOpen(false);
  };

  return (
    <div className={styles.timePickerWrap} ref={containerRef}>
      <button
        type="button"
        className={styles.timePickerButton}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((s) => !s);
        }}
      >
        <span className={`${styles.timePickerValue} ${!value ? styles.timePickerPlaceholder : ''}`}>
          {value || 'Επιλέξτε ώρα'}
        </span>
        <span className={styles.timePickerIcon} aria-hidden>▾</span>
      </button>

      {open && (
        <div className={styles.timeList}>
          {options.map((opt) => (
            <button key={opt} type="button" className={styles.timeListItem} onClick={(e) => handleSelect(e, opt)}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSelect;
