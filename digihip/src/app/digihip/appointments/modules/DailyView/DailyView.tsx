/**
 * DailyView Component
 * Displays appointments for a selected day in a daily view format.
 * This component allows users to navigate through days, view appointments for the selected day,
 * and provides a calendar for quick date selection.
 * @module DailyView
 * @file DailyView.tsx
 * @path digihip/src/app/digihip/appointments/modules/DailyView/DailyView.tsx
 * @author Giorgos Geramoutsos
 * 
 */

import { 
  useState,
  useEffect,
  useRef, 
} from "react";
import { 
  formatDate, 
  formatTime, 
  nextDay, 
  prevDay 
} from "@/utils/date/dateUtils";
import { AppointmentInterface } from "@/utils/interfaces/appointment";
import { PatientOfAppointment } from "@/utils/interfaces/patient";
import NavigationPanel from "@/components/Appointments/NavigationPanel/NavigationPanel";
import PreviewAppointmentModal from "@/components/Appointments/PreviewAppointmentModal/PreviewAppointmentModal"
import styles from "@/digihip/appointments/modules/DailyView/dailyView.module.css";
import DatePicker from "react-datepicker";
import { customLocale } from "@/utils/locale/localeModule"


type Appointments = AppointmentInterface[] | null;
type Patients = PatientOfAppointment[] | null;

/**
 * @interface DailyProps
 * @property {Appointments} appointments - List of appointments for the day.
 * @property {Patients} patients - List of patients associated with the appointments.
 */
interface DailyProps {
  appointments: Appointments;
  patients: Patients;
}

/**
 * @param {DailyProps} param0 - The props for the DailyView component.
 * @property {Appointments} param0.appointments - Array of appointment objects.
 * @property {Patients} param0.patients - Array of patient objects.  
 * @returns {JSX.Element} - The rendered DailyView component.
 */
const DailyView: React.FC<DailyProps> = ({ appointments, patients }) => {

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    const filteredAppointments = (appointments ?? []).filter((appt) => {
    const apptDate = new Date(appt.datetime);
    return (
        apptDate.getFullYear() === selectedDate.getFullYear() &&
        apptDate.getMonth() === selectedDate.getMonth() &&
        apptDate.getDate() === selectedDate.getDate()
    );
    }).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    const [previewState, setPreviewState] = useState<{
        show: boolean,
        appointment: appointmentType
    }>({
        show: false,
        appointment: null
    });

    const label = selectedDate.toLocaleDateString("el-GR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    });

    const handleToggleCalendar = () => {
        setShowCalendar((prev) => !prev);
    };

    const handleDateChange = (date: Date | null) => {
    if (date) {
        setSelectedDate(date);
        setShowCalendar(false);
    }
    };

    const ShowCalendar = () => {
    if (showCalendar) {
        return (
        <div className={styles.datePickerWrapper} ref={calendarRef}>
            <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            inline
            locale={customLocale}
            />
        </div>
        );
    }
    return null;
    };

    const HandleCurrentAppointment = (appointment: appointmentType, apptId: string) => {
        setPreviewState({
            show: true,
            appointment,
        });
    };

    const RenderCurrentAppointment = () => {
        if (previewState.show && previewState.appointment) {
            return (
                <PreviewAppointmentModal
                    appointment={previewState.appointment}
                    onClose={() => setPreviewState({ show: false, appointment: null })}
                />
            );
        }
        return null;
    };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!appointments || appointments.length === 0) {
        return <p>Loading appointments...</p>;
    }
    
    if (!patients || patients.length === 0) {
        return <p>Loading patients...</p>;
    }

  return (
    <div className={styles.dailyView}>
      {ShowCalendar()}
      {/* Header */}
      <div className={styles.header}>
        <NavigationPanel 
          view="day"
          displayLabel={label}
          onPrev={() => setSelectedDate(prevDay(selectedDate))}
          onNext={() => setSelectedDate(nextDay(selectedDate))}
          onToday={() => setSelectedDate(new Date())}
          onToggleCalendar={handleToggleCalendar}
          />
      </div>
      {/* Day Grid */}
      <div className={styles.timeline}>
        {filteredAppointments.length === 0 ? (
          <p className={styles.noAppointments}>Δεν υπάρχουν ραντεβού για αυτήν την ημέρα.</p>
        ) : (
          filteredAppointments.map((appt) => (
            <div 
                key={appt._id} 
                className={styles.appointmentBox}
                onClick={() => HandleCurrentAppointment(appt, appt._id ?? "")}
                title={`Ημερομηνία : ${formatDate(appt.datetime)}\nΏρα : ${formatTime(appt.datetime)}\nΑσθενής : ${appt.patient?.firstname} ${appt.patient?.lastname}\nΑιτιολογία: ${appt.reason}\nΣημείωση: ${appt.note || "Δεν υπάρχει σημείωση"}\nΓιατρός: ${appt.doctor}\n`}
            >
              <span className={styles.time}>{formatTime(appt.datetime)}</span>
              <span className={styles.name}>
                      {appt.patient?.firstname} {appt.patient?.lastname}
              </span>
            </div>
          ))
        )}
      </div>
      {RenderCurrentAppointment()}
    </div>
  );
};

export default DailyView;
