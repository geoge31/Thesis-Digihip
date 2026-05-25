/**
 * MonthlyView Component
 * This component renders a monthly view of appointments.
 * It displays a calendar grid with appointment boxes for each day.
 * Users can navigate between months and view appointment details.
 * It also includes a date picker for selecting specific dates.
 * @module MonthlyView
 * @file MonthlyView.tsx
 * @path src/app/digihip/appointments/modules/MonthlyView/MonthlyView.tsx
 * @author Giorgos Geramoutsos
 */

import { 
    useState, 
    useEffect, 
    useRef,
} from "react";
import { 
    formatDate, 
    formatTime, 
    getDaysInMonth, 
    getFirstDayOfMonth, 
    prevMonth, 
    nextMonth 
} from "@/utils/date/dateUtils";
import { AppointmentInterface } from "@/utils/interfaces/appointment";
import { PatientOfAppointment } from "@/utils/interfaces/patient";
import NavigationPanel from "@/components/Appointments/NavigationPanel/NavigationPanel";
import PreviewAppointmentModal from "@/components/Appointments/PreviewAppointmentModal/PreviewAppointmentModal"
import DatePicker from 'react-datepicker';
import stylesMonth from "@/digihip/appointments/modules/MonthlyView/monthlyView.module.css";
import { customLocale } from "@/utils/locale/localeModule"


type Appointments = AppointmentInterface[] | null;
type Patients = PatientOfAppointment[] | null;
type appointmentType = AppointmentInterface | null;

/**
 * @interface MonthlyProps
 * @property {Appointments} appointments - Array of appointment objects.
 * @property {Patients} patients - Array of patient objects.
 */
interface MonthlyProps {
    appointments: Appointments;
    patients: Patients;
}

/**
 * @param {MonthlyProps} param0 - The props for the MonthlyView component.
 * @property {Appointments} param0.appointments - Array of appointment objects.
 * @property {Patients} param0.patients - Array of patient objects.
 * @returns {JSX.Element} - The rendered MonthlyView component. 
 */
const MonthlyView: React.FC<MonthlyProps> = ({ appointments, patients}) => {

    const calendarRef = useRef<HTMLDivElement>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // to-do
    // const [currApptId, setCurrApptId] = useState("");

    const [previewState, setPreviewState] = useState<{
        show: boolean,
        appointment: appointmentType
    }> ({
        show: false, 
        appointment: null
    });

    /**
     * 
     * @returns 
     */
    const RenderCurrentMonthContent = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
    
        const totalDaysInMonth = getDaysInMonth(year, month); // Total days in the current month
        const firstDayOfMonth = getFirstDayOfMonth(year, month); // Day of the week the month starts on
        const totalBoxes = 42; // Fixed grid for the calendar
    
        const emptyStartBoxes = Array.from({ length: firstDayOfMonth }, (_, i) => (
            <EmptyBox key={`empty-${i}`} />
        ));
    
        const filledBoxes = Array.from({ length: totalDaysInMonth }, (_, day) => {
            const currentDay = new Date(year, month, day + 1);
            const dailyAppointments = getAppointmentsForDate(currentDay);
    
            return (
                <AppointmentBox
                    key={`day-${day + 1}`}
                    day={day + 1}
                    appointments={dailyAppointments}
                />
            );
        });
    
        const emptyEndBoxes = Array.from(
            { length: totalBoxes - firstDayOfMonth - totalDaysInMonth },
            (_, i) => <EmptyBox key={`remaining-${i}`} />
        );
    
        return [...emptyStartBoxes, ...filledBoxes, ...emptyEndBoxes];
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
    
    /**
     * Reusable Appointment Empty Box Component
     * @returns 
     */
    const EmptyBox = () => <div className={stylesMonth.appointmentBox} />;

    /**
     * Reusable Appointment Box Component
     * @param param0 
     * @returns 
     */
    const AppointmentBox = ({ day, appointments }: { day: number; appointments: Appointments }) => (
        <div className={stylesMonth.appointmentBox}>
            <div className={stylesMonth.dateHeaedr}>{day}</div>
            <div className={stylesMonth.appointmentsContainer}>
                {(appointments !== null && appointments.length > 0) ? (
                    appointments.map((appt) => <AppointmentItem key={appt._id} appointment={appt} />)
                ) : (
                    <p className={stylesMonth.noAppointments}>-</p>
                )}
            </div>
        </div>
    );

    /**
     * Reusable Appointment Item Component
     * AppointmentItem Component for rendering individual appointments
     * @param param0 
     * @returns 
     */
    const AppointmentItem: React.FC<{ appointment: AppointmentInterface }> = ({ appointment }) => (
        <div
            title="Πατήστε στο πλαίσιο του ραντεβού για τροποποίηση"
            className={stylesMonth.appointmentItem}
            onClick={() => HandleCurrentAppointment(appointment, appointment._id ?? "")}
        >
            <>
                {/* <GoDotFill color="green" /> */}
                <p title={`Ημερομηνία : ${formatDate(appointment.datetime)}\nΏρα : ${formatTime(appointment.datetime)}\nΑσθενής : ${appointment.patient?.firstname} ${appointment.patient?.lastname}\nΑιτιολογία: ${appointment.reason}\nΣημείωση: ${appointment.note || "Δεν υπάρχει σημείωση"}\nΓιατρός: ${appointment.doctor}\n`}>
                    {formatTime(appointment?.datetime)}{" "}
                    {` ${appointment?.patient?.firstname} ${appointment?.patient?.lastname}`}
                </p>
                {/* <Tooltip
                    date={new Date(appointment?.datetime ?? new Date()).toLocaleDateString()}
                    time={new Date(appointment?.datetime ?? new Date()).toLocaleTimeString('el', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    pntName={`${appointment?.patient?.firstname} ${appointment?.appointmentPatient?.lastname}`}
                    apptReason={appointment?.reason ?? null}
                    docName={appointment?.doctor ?? null}
                /> */}
            </>
        </div>
    );

    /**
     * 
     * @param date 
     * @returns 
     */
    const getAppointmentsForDate = (date: Date | null) => {

        if (!date) return [];
        return appointments?.filter(appt => {
            const apptDate = new Date(appt.datetime);
            return (
                apptDate.getFullYear() === date.getFullYear() &&
                apptDate.getMonth() === date.getMonth() &&
                apptDate.getDate() === date.getDate()
            );
        }).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    };

    const HandleCurrentAppointment = (appointment: appointmentType, apptId: string) => {
        setPreviewState({
        show: true,
        appointment,
    });
        // setCurrApptId(apptId);
        // PreviewCurrentAppointment(appointment);
    };


    const label = currentDate.toLocaleDateString("el-GR", {
        month: "long",
        year: "numeric",
    });

    const handleToggleCalendar = () => {
        setShowCalendar((prev) => !prev);
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setCurrentDate(date);
            setShowCalendar(false);
        }
    };

    const ShowCalendar = () => {
        if (showCalendar) {
            return (
                <div className={stylesMonth.datePickerWrapper} ref={calendarRef}>
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
        <div className={stylesMonth.monthlyAppointments}>
            {ShowCalendar()}
            {/* Header */}
            <div className={stylesMonth.header}>
                <NavigationPanel 
                    view="month"
                    displayLabel={label}
                    onPrev={() => prevMonth(setCurrentDate)}
                    onNext={() => nextMonth(setCurrentDate)}
                    onToday={() => setCurrentDate(new Date())}
                    onToggleCalendar={handleToggleCalendar}
                />

            </div>
            {/* Calendar Grid */}
            <div className={stylesMonth.monthContent}>
                <div className={stylesMonth.daysOfWeek}>
                    <div className={stylesMonth.dayOfWeek}>Δευτέρα</div>
                    <div className={stylesMonth.dayOfWeek}>Τρίτη</div>
                    <div className={stylesMonth.dayOfWeek}>Τετάρτη</div>
                    <div className={stylesMonth.dayOfWeek}>Πέμπτη</div>
                    <div className={stylesMonth.dayOfWeek}>Παρασκευή</div>
                    <div className={stylesMonth.dayOfWeek}>Σάββατο</div>
                    <div className={stylesMonth.dayOfWeek}>Κυριακή</div>
                </div>
                <div className={stylesMonth.appointmentsBoxes}>
                    {RenderCurrentMonthContent()}
                    {RenderCurrentAppointment()}
                </div>
            </div>
            {/* {RenderExistingAppointment()} */}
        </div>
    );
};

export default MonthlyView;