import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import styles from '@/components/PatientAppointmentModal/PatientAppointmentModal.module.css';
import DatePicker from '@/components/Shared/DateTime/DatePicker';
import TimeSelect from '@/components/Shared/DateTime/TimeSelect';

interface AppointmentModalProps {
  isVisible: boolean;
  onClose: () => void;
  patientName: string;
  onSubmit: (appointmentData: {
    date: string;
    time: string;
    reason: string;
    doctor: string;
  }) => void;
}

const PatientAppointmentModal: React.FC<AppointmentModalProps> = ({
  isVisible,
  onClose,
  patientName,
  onSubmit,
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [doctor, setDoctor] = useState('');
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow || '';
      document.documentElement.style.overflow = previousHtmlOverflow || '';
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const preventBackgroundScroll = (event: Event) => {
      const target = event.target;

      if (
        modalRef.current &&
        target instanceof Node &&
        modalRef.current.contains(target)
      ) {
        return;
      }

      event.preventDefault();
    };

    const listenerOptions: AddEventListenerOptions = {
      passive: false,
      capture: true,
    };

    document.addEventListener('wheel', preventBackgroundScroll, listenerOptions);
    document.addEventListener(
      'touchmove',
      preventBackgroundScroll,
      listenerOptions
    );

    return () => {
      document.removeEventListener('wheel', preventBackgroundScroll, true);
      document.removeEventListener('touchmove', preventBackgroundScroll, true);
    };
  }, [isVisible]);

  const timeOptions = useMemo(() => {
    const options: string[] = [];

    for (let hour = 0; hour <= 23; hour += 1) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hh = String(hour).padStart(2, '0');
        const mm = String(minute).padStart(2, '0');
        options.push(`${hh}:${mm}`);
      }
    }

    return options;
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!date) {
      alert('Παρακαλώ επιλέξτε ημερομηνία');
      return;
    }

    onSubmit({
      date: format(date, 'yyyy-MM-dd'),
      time,
      reason,
      doctor,
    });

    onClose();
  };

  const handleOverlayWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleOverlayTouch = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  if (!isVisible) return null;

    return (
        <div
            className={styles.modalOverlay}
            onWheel={handleOverlayWheel}
            onTouchMove={handleOverlayTouch}
        >
            <div className={styles.modalContent} ref={modalRef}>
                <div className={styles.modalScroll}>
                    <h3>Νέο Ραντεβού για {patientName}</h3>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div>
                            <DatePicker
                                value={date}
                                onChange={(d) => setDate(d)}
                                placeholder="Επιλέξτε ημερομηνία"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Ώρα:</span>
                            <TimeSelect value={time} options={timeOptions} onChange={setTime} />
                        </div>

                        <label>
                            Αιτιολογία:
                            <input
                                type="text"
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                                required
                            />
                        </label>

                        <label>
                            Ιατρός:
                            <input
                                type="text"
                                value={doctor}
                                onChange={(event) => setDoctor(event.target.value)}
                                required
                            />
                        </label>

                        <div className={styles.buttons}>
                            <button type="submit">Αποθήκευση</button>
                            <button type="button" onClick={onClose}>
                                Άκυρο
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PatientAppointmentModal;
