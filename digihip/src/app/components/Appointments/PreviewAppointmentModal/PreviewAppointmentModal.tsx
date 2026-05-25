"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./previewAppointmentModal.module.css";
import Select from "react-select";
import { PatientOfAppointment } from "@/utils/interfaces/patient";
import { AppointmentInterface } from "@/utils/interfaces/appointment";
import { useDoctor } from "@/api/_context/Doctors/Context";
import { updateAppointment } from "@/services/appointments/updateAppointment";
import { useAppointmentProvider } from "@/api/_context/Appointments/Context";
import HandleCases from "@/components/HandleCases/HandleCases";
import DatePicker from "@/components/Shared/DateTime/DatePicker";
import TimeSelect from "@/components/Shared/DateTime/TimeSelect";
import { format } from "date-fns";

type patientsType = PatientOfAppointment[] | null;
type appointmentType = AppointmentInterface | null;

interface PrevAppptProps {
  onClose: () => void;
  patients: patientsType;
  appointment: appointmentType;

}

const PreviewAppointmentModal: React.FC<PrevAppptProps> = ({ onClose, patients, appointment }) => {
    const [mounted, setMounted] = useState(false);

    const {currentDoctorData} = useDoctor();
    const { refetchAppointments } = useAppointmentProvider();

    const [editMode, setEditMode] = useState(false);
    const [ogData] = useState<appointmentType>(appointment);
    const [modalState, setModalState] = useState<{ message: string; option: "loading" | "success" | "fail"; visibility: boolean }>({
        message: "", option: "loading", visibility: false,
    });

    const [date, setDate] = useState<string>(
        appointment?.datetime ? new Date(appointment.datetime).toISOString().slice(0, 10) : ""
    );
    const [time, setTime] = useState<string>(
        appointment?.datetime ? new Date(appointment.datetime).toTimeString().slice(0, 5) : ""
    );
    const [reason, setReason] = useState<string>(appointment?.reason || "");
    const [doctor, setDoctor] = useState<string>(appointment?.doctor || "");

    const patientOptions = patients?.map((p) => ({
        value: p._id,
        label: `${p.lastname} ${p.firstname} - ${p.amka}`,
    }));

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

    useEffect(() => {
    setMounted(true);
    }, []);

    if (!mounted) return null;

    const modalRoot = document.body;

    const handleEditMode = () => {
        if (editMode) {
            setDate(ogData?.datetime ? new Date(ogData.datetime).toISOString().slice(0, 10) : "");
            setTime(ogData?.datetime ? new Date(ogData.datetime).toTimeString().slice(0, 5) : "");
            setReason(ogData?.reason || "");
            setDoctor(ogData?.doctor || "");
        }
        setEditMode((prev) => !prev);
    };

    const handleClose = () => {
        setDate(ogData?.datetime ? new Date(ogData.datetime).toISOString().slice(0, 10) : "");
        setTime(ogData?.datetime ? new Date(ogData.datetime).toTimeString().slice(0, 5) : "");
        setReason(ogData?.reason || "");
        setDoctor(ogData?.doctor || "");
        setEditMode(false);
        onClose();
    };

    const handleSave = async () => {
        if (!date || !time) {
            setModalState({ message: "Συμπληρώστε ημερομηνία και ώρα.", option: "fail", visibility: true });
            return;
        }

        const datetime = new Date(`${date}T${time}`);

        const updates: Partial<AppointmentInterface> = {
            datetime,
            reason,
            doctor,
            updatedBy: `${currentDoctorData?.firstname} ${currentDoctorData?.lastname}`,
        };

        try {
            const result = await updateAppointment(currentDoctorData?._id ?? "", appointment?._id ?? "", updates);
            if (result) {
                setModalState({ message: "Η ενημέρωση ολοκληρώθηκε επιτυχώς", option: "success", visibility: true });
                setEditMode(false);
                refetchAppointments();
                setTimeout(() => onClose(), 1500);
            }
        } catch (error) {
            console.error("Failed to update appointment", error);
            setModalState({ message: "Παρουσιάστηκε σφάλμα κατά την αποθήκευση", option: "fail", visibility: true });
        }
    };

    const modalContent = (
        <div className={styles.overlay}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
              <div className={styles.panelScroll}>
                <header className={styles.header}>
                    <h3>Προεπισκόπηση Ραντεβού</h3>
                    <button className={styles.closeBtn} onClick={handleClose}>✕</button>
                </header>
                <main className={styles.body}>
                    <form  className={styles.form}>
                        <label>Ημερομηνία:
                            {editMode ? (
                                <DatePicker
                                    value={date || undefined}
                                    onChange={(d) => setDate(format(d, 'yyyy-MM-dd'))}
                                    inline={false}
                                    placeholder="Επιλέξτε ημερομηνία"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={date ? new Date(date).toLocaleDateString('el') : ''}
                                    disabled
                                />
                            )}
                        </label>
                        <label>Ώρα:
                            {editMode ? (
                                <TimeSelect
                                    value={time}
                                    options={timeOptions}
                                    onChange={(val) => setTime(val)}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={time}
                                    disabled
                                />
                            )}
                        </label>
                        <label>Ασθενής:
                            <input 
                                type="text" 
                                value={appointment?.patient ? appointment.patient.lastname + " " + appointment.patient.firstname : ""} 
                                disabled 
                            />
                        </label>
                        <label>Επιβλέπων Ιατρός:
                            <input 
                                type="text" 
                                value={doctor} 
                                disabled={!editMode}
                                onChange={(e) => setDoctor(e.target.value)}
                            />
                        </label>
                        <label>Αιτία:
                            <input 
                                type="text"
                                value={reason} 
                                disabled={!editMode}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </label>
                        <label>Σημείωση:
                            <input 
                                type="text"
                                value="Δεν βρέθηκε σημείωση"
                                disabled 
                            />
                        </label>
                        <label>Δημιουργήθηκε από:
                            <input 
                                type="text" 
                                value={
                                    appointment?.updatedBy 
                                    && appointment.updatedBy !== "undefined undefined"
                                    ? appointment.updatedBy 
                                    : "Μη διαθέσιμο"
                                } 
                                disabled
                            />
                        </label>
                        <div className={styles.btns}>
                            <button 
                                type="button"
                                name="clear"
                                className={styles.clrBtn}
                                onClick={handleEditMode}
                            >
                                {editMode ? "Ακύρωση" : "Επεξεργασία"}
                            </button>
                            {editMode && (
                                <button 
                                    type="button" 
                                    className={styles.submitBtn}
                                    onClick={handleSave}
                                >
                                    Αποθήκευση
                                </button>
                            )}
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

export default PreviewAppointmentModal;
