/**
 * WeeklyView Component
 * This component renders a weekly view of appointments.
 * It displays a grid of days with appointment boxes for each day.
 * Users can navigate between weeks and view appointment details.
 * @module WeeklyView
 * @file WeeklyView.tsx
 * @path digihip/src/app/digihip/appointments/modules/WeeklyView/WeeklyView.tsx
 * @author Giorgos Geramoutsos
 */

import { 
    useState, 
    useEffect, 
    useRef,
} from "react";
import { AppointmentInterface } from "@/utils/interfaces/appointment";
import { PatientOfAppointment } from "@/utils/interfaces/patient";
import NavigationPanel from "@/components/Appointments/NavigationPanel/NavigationPanel";
import PreviewAppointmentModal from "@/components/Appointments/PreviewAppointmentModal/PreviewAppointmentModal"
import styles from "@/digihip/appointments/modules/WeeklyView/weeklyView.module.css";
import { 
    formatDate, 
    formatTime, 
    getDaysInMonth, 
    getFirstDayOfMonth,
    getStartOfWeek,
    prevWeek,
    nextWeek, 
    prevMonth, 
    nextMonth, 
} from "@/utils/date/dateUtils";
import { customLocale } from "@/utils/locale/localeModule";
import DatePicker from 'react-datepicker';


type Appointments = AppointmentInterface[] | null;
type Patients = PatientOfAppointment[] | null;


/**
 * @interface WeeklyViewProps
 * @property {Appointments} appointments - List of appointments for the week.   
 * @property {Patients} patients - List of patients associated with the appointments.
 */
interface WeeklyViewProps {
  appointments: Appointments;
  patients: Patients;
}

/**
 * WeeklyView Component
 * @param {WeeklyViewProps} props - The properties for the WeeklyView component.
 * @property {Appointments} props.appointments - List of appointments for the week.
 * @property {Patients} props.patients - List of patients associated with the appointments.
 * @returns {JSX.Element} The rendered WeeklyView component.
 */
const WeeklyView: React.FC<WeeklyViewProps> = ({ appointments, patients }) => {

    // const appts = appointments;
    // const ptnts = patients;

    const calendarRef = useRef<HTMLDivElement>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startOfWeek, setStartOfWeek] = useState(getStartOfWeek(new Date()));

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        return date;
    });

    const getAppointmentsForDate = (date: Date | null) => {

        if (!date) return [];

        return appointments?.filter(appt => {
            const apptDate = new Date(appt.datetime);
            return (
                apptDate.getFullYear() === date.getFullYear() &&
                apptDate.getMonth() === date.getMonth() &&
                apptDate.getDate() === date.getDate()
            );
        }) ?? [];
    };

    // const dailyAppointments = getAppointmentsForDate(date).sort((a, b) => {
    //     return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
    // });

    const [previewState, setPreviewState] = useState<{
        show: boolean,
        appointment: appointmentType
    }> ({
        show: false, 
        appointment: null
    });

    const daysOfWeek = ["ΔΕΥ", "ΤΡΙ", "ΤΕΤ", "ΠΕΜ", "ΠΑΡ", "ΣΑΒ", "ΚΥΡ"];

    const handleToggleCalendar = () => {
        console.log("Toggle Calendar Clicked");
        setShowCalendar(prev => !prev); 
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setCurrentDate(date);
            setStartOfWeek(getStartOfWeek(date));
            setShowCalendar(false); 
        }
    };

    const ShowCalendar = () => {
        if(showCalendar) {
            return (
                <div className={styles.datePickerWrapper} ref={calendarRef}>
                    <DatePicker
                        selected={currentDate}
                        onChange={handleDateChange}
                        inline
                        locale={customLocale}
                        dateFormat="dd/MM/yyyy"
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
        // setCurrApptId(apptId);
        // PreviewCurrentAppointment(appointment);
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
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!appointments || appointments.length === 0) {
        return <p>Loading appointments...</p>;
    }
    
    if (!patients || patients.length === 0) {
        return <p>Loading patients...</p>;
    }

    return(
        <div className={styles.weeklyView}>
            {/* Header */}
            <div className={styles.header}>
                <NavigationPanel
                    view="week"
                    displayLabel={`Εβδομάδα ${formatDate(startOfWeek)} - ${formatDate(weekDates[6])}`}
                    onPrev={() => prevWeek(startOfWeek, setStartOfWeek)}
                    onNext={() => nextWeek(startOfWeek, setStartOfWeek)}
                    onToday={() => {
                        const today = new Date();
                        setCurrentDate(today);
                        setStartOfWeek(getStartOfWeek(today));
                    }}
                    onToggleCalendar={handleToggleCalendar}
                />
            </div>
            {/* Week Content */}
            <div className={styles.weekGrid}>
                {ShowCalendar()}
                {weekDates.map((date, i) => {
                const dailyAppointments = getAppointmentsForDate(date).sort((a, b) =>
                    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
                );
                return (
                    <div key={i} className={styles.dayColumn}>
                    <div className={styles.dayHeader}>
                        {daysOfWeek[i]} {formatDate(date)}
                    </div>
                    <div className={styles.appointmentsContainer}>
                        <div className={styles.appointmentsList}>
                            {dailyAppointments.length > 0 ? (
                            dailyAppointments.map(appointment => (
                                <div 
                                    key={appointment._id} 
                                    className={styles.appointmentBox}
                                    onClick={() => HandleCurrentAppointment(appointment, appointment._id ?? "")}
                                    title={`Ημερομηνία : ${formatDate(appointment.datetime)}\nΏρα : ${formatTime(appointment.datetime)}\nΑσθενής : ${appointment.patient?.firstname} ${appointment.patient?.lastname}\nΑιτιολογία: ${appointment.reason}\nΣημείωση: ${appointment.note || "Δεν υπάρχει σημείωση"}\nΓιατρός: ${appointment.doctor}\n`}
                                >
                                    <b>{formatTime(appointment.datetime)}</b><br />
                                    {appointment.patient?.firstname} {appointment.patient?.lastname}
                                </div>
                            ))
                            ) : (
                            <div className={styles.noAppointments}>–</div>
                            )}
                            </div>
                        </div>
                    </div>
                );
                })}
            </div>
            {RenderCurrentAppointment()}
        </div>
    );

};

export default WeeklyView;