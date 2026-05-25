/*
* NewAppointmentModal.tsx
* This component renders a modal for creating new appointments.
* It includes fields for date, time, patient selection, doctor, reason, and who added
* the appointment.
* It uses React hooks for state management and handles form submission to create an appointment.
* It also includes a clear button to reset the form fields.
*/

"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import styles from "./newApptModal.module.css";
import Select from "react-select";
import DatePicker from '@/components/Shared/DateTime/DatePicker';
import TimeSelect from '@/components/Shared/DateTime/TimeSelect';
import { format } from 'date-fns';
import { PatientOfAppointment } from "@/utils/interfaces/patient";
import { AppointmentInterface } from "@/utils/interfaces/appointment";
import { useDoctor } from "@/api/_context/Doctors/Context";
import { CreateAppointment } from "@/services/appointments/createAppointment";
import HandleCases from "@/components/HandleCases/HandleCases";

type patientsType = PatientOfAppointment[] | null;

interface NewApptProps {
  onClose: () => void;
  patients: patientsType;
}

const NewAppointmentModal: React.FC<NewApptProps> = ({ onClose, patients }) => {
    const [mounted, setMounted] = useState(false);
    
    const {currentDoctorData, loading} = useDoctor();
    
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [modalState, setModalState] = useState<{ message: string; option: "loading" | "success" | "fail"; visibility: boolean }>({
        message: "", option: "loading", visibility: false,
    });

    const timeOptions = (() => {
        const opts: string[] = [];
        for (let hour = 0; hour <= 23; hour += 1) {
            for (let minute = 0; minute < 60; minute += 15) {
                const hh = String(hour).padStart(2, '0');
                const mm = String(minute).padStart(2, '0');
                opts.push(`${hh}:${mm}`);
            }
        }
        return opts;
    })();

    const [apptData, setApptData] = useState<AppointmentInterface>({
        datetime: "",
        doctor: "",
        patient: "",
        reason: "",
        updatedBy: "",
    });

    const clrdApptData = ({
        datetime: "",
        doctor: "",
        patient: "",
        reason: "",
        updatedBy: "",
    });

    const patientOptions = patients?.map((p) => ({
        value: p._id,
        label: `${p.lastname} ${p.firstname} - ${p.amka}`,
    }));

    useEffect(() => {
    setMounted(true);

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
        document.body.style.overflow = previousBodyOverflow || "";
        document.documentElement.style.overflow = previousHtmlOverflow || "";
    };
    }, []);

    if (!mounted) return null;

    const modalRoot = document.body;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if(!date || !time || !apptData.patient) {
            setModalState({ message: "Συμπληρώστε όλα τα υποχρεωτικά πεδία.", option: "fail", visibility: true });
            return;
        }

        const datetime = new Date(`${date}T${time}`);

        const appointmentToSend: AppointmentInterface = {
            ...apptData,
            datetime,
            updatedBy: `${currentDoctorData?.firstname} ${currentDoctorData?.lastname}`,
        };

        try {
            const response = await CreateAppointment(currentDoctorData?._id || "", appointmentToSend);

            if (response?.status === 200) {
                setModalState({ message: "Το ραντεβού αποθηκεύτηκε επιτυχώς.", option: "success", visibility: true });
                setTimeout(() => onClose(), 1500);
            } else {
                setModalState({ message: "Αποτυχία αποθήκευσης ραντεβού!", option: "fail", visibility: true });
            }
        } catch (error) {
            console.error("Error creating appointment:", error);
            setModalState({ message: "Παρουσιάστηκε σφάλμα κατά την αποθήκευση", option: "fail", visibility: true });
        }
    };

    const UpdateData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, field: keyof AppointmentInterface) => {
        let newVal: string | number | undefined = e.target.value;

        setApptData((prevData) => ({
            ...prevData,
            [field]: newVal,
        })); 

        console.log(apptData);
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

    const modalContent = (
        <div className={styles.overlay} onClick={onClose} onWheel={handleOverlayWheel} onTouchMove={handleOverlayTouch}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.panelScroll}>
                    <header className={styles.header}>
                        <h3>Νέο Ραντεβού</h3>
                        <button className={styles.closeBtn} onClick={onClose}>✕</button>
                    </header>
                    <main className={styles.body}>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <label>
                            Ημερομηνία:
                            <DatePicker
                                value={date || undefined}
                                onChange={(d) => setDate(format(d, 'yyyy-MM-dd'))}
                                placeholder="Επιλέξτε ημερομηνία"
                                inline={true}
                            />
                            </label>
                            <label>
                            Ώρα:
                            <TimeSelect
                                value={time}
                                options={timeOptions}
                                onChange={(t) => setTime(t)}
                            />
                            </label>
                            <label>
                                Ασθενής
                                <Select
                                classNamePrefix="react-select"
                                label="Ασθενής"
                                options={patientOptions}
                                onChange={(selected) =>
                                    setApptData((prev) => ({
                                        ...prev,
                                        patient: selected?.value || undefined,
                                    }))
                                }
                                placeholder="Επιλέξτε ή Αναζητήστε Ασθενή"
                                isSearchable
                                noOptionsMessage={() => "Δεν βρέθηκαν ασθενείς"}
                                />
                            </label>
                            <label>
                            Επιβλέπων Ιατρός:
                                <input
                                type="text"
                                value={apptData.doctor  || ""}
                                onChange={(e) => UpdateData(e, "doctor")}
                            />
                            </label>
                            <label>
                            Αιτία:
                            <input
                                type="text"
                                value={apptData.reason || ""}
                                onChange={(e) => UpdateData(e, "reason")}
                            />
                            </label>
                            <label>
                            Προστέθηκε Από:
                            <input
                                type="text"
                                value={`${currentDoctorData?.firstname || ""} ${currentDoctorData?.lastname || ""}`}
                                disabled
                            />
                            </label>

                            <div className={styles.btns}>
                                <button 
                                    type="button"
                                    name="clear"
                                    className={styles.clrBtn}
                                    onClick={() => {
                                        setApptData(clrdApptData);
                                        setDate("");
                                        setTime("");
                                    }}
                                >
                                    Εκκαθάριση
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles.submitBtn}
                                >
                                    Αποθήκευση
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {ReactDOM.createPortal(modalContent, modalRoot)}
            {modalState.visibility && (
                <HandleCases
                    {...modalState}
                    onClose={() => setModalState(prev => ({ ...prev, visibility: false }))}
                />
            )}
        </>
    );
};

export default NewAppointmentModal;
