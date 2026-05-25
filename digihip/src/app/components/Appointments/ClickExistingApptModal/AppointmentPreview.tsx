import React, { useState } from "react";
import { AppointmentInterface } from "@/utils/interfaces/appointment";
import { updateAppointment } from "@/services/appointments/updateAppointment";
import { useDoctor } from "@/api/_context/Doctors/Context";
import styles from "@/components/Appointments/ClickExistingApptModal/AppointmentsPreview.module.css";
import DatePicker from "react-datepicker";
import {el} from 'date-fns/locale';
import { IoMdClose } from "react-icons/io";
import { MdEdit, MdDelete } from "react-icons/md";

type appointmentType = AppointmentInterface | null;

interface ApptPreviewProps {
    appointment: appointmentType;
    onClose: () => void;
}

const ApptPreview: React.FC<ApptPreviewProps> = ({ appointment, onClose }) => {

    const { currentDoctorData } = useDoctor();

    const [appData, setAppData] = useState<appointmentType> (appointment);
    const [ogData] = useState<appointmentType>(appointment);
    const [editMode, setEditMode] = useState<boolean>(false);

    const uppercaseFields : Array<keyof AppointmentInterface> = [
        "appointmentDoctor",
        "appointmentPatient"
    ];

    
    /**
     * 
     * @returns 
     */
    const RenderButtons = () => {
        
        if(editMode) {
            return(
                <div className={styles.activeBtns}>
                    <button
                        type="button"
                        name="cancel"
                        title="Ακύρωση"
                        onClick={handleEditMode}
                    >
                        Ακύρωση
                    </button>
                    <button
                        type="button"
                        name="save"
                        title="Αποθήκευση"
                        onClick={HandleSaveAppointment}
                    >
                        Αποθήκευση
                    </button>
                </div>
            );
        } else {
            return (
                <div className={styles.inActiveBtns}>
                    <button
                        type="button"
                        name="edit"
                        title="Επεξεργασία"
                        onClick={handleEditMode}
                    >
                        {<MdEdit size={20}/>}
                    </button>
                    <button
                        type="button"
                        name="delete"
                        title="Διαγραφή"
                        // onClick={}
                    >
                        {<MdDelete size={20}/>}
                    </button>
                </div>
            )
        }
    };

    const handleEditMode = () => {
        if(editMode) {
            setAppData(ogData);
        } else {
            setAppData(appData);
        }
        setEditMode((prev) => !prev);
    };


    /**
     * 
     * @param field 
     * @param value 
     */
    const UpdateApptData = (field: keyof AppointmentInterface, value: string | Date | object) => {

        if(typeof value === "string" && uppercaseFields.includes(field)) {
            value = value.toUpperCase();
        }

        setAppData((prevData) => ({
            ...prevData,
            [field]: value,
        })); 
    };

    const HandleSaveAppointment = () => {
        setAppData(appData);
        setEditMode(false);
        UpdateCurrentAppointment();
    };


    const UpdateCurrentAppointment = async () => {

        const updates: Partial<AppointmentInterface> = {
            appointmentDate: appData?.appointmentDate,
            appointmentDoctor: appData?.appointmentDoctor,
            appointmentReason: appData?.appointmentReason,
        };

        try {
            const result = await updateAppointment(currentDoctorData?._id ?? "", appData?._id ?? "", updates);
            if (result) {
                alert("Η ενημέρωση ολοκληρώθηκε επιτυχώς");
                setEditMode(false);
            }
        } catch (error) {
            console.error("Failed to update appointment", error);
        }
        
    };

    return (
        <main className={styles.main}>
            <div className={styles.background}>
                <div className={styles.appointment}>
                    <div className={styles.apptHeader}>
                        <p>Στοιχεία Ραντεβού</p>
                        <button
                            type="button"
                            title="Κλείσιμο"
                            name="close"
                            onClick={onClose}
                        >
                            {<IoMdClose/>}
                        </button>
                    </div>
                    <div className={styles.apptMain}>
                        {/** date & time of patient */}
                        <div className={styles.apptInput}>
                            <label htmlFor="date">Ημερομηνία & Ώρα</label>
                            <DatePicker 
                                name="date"
                                showTimeSelect
                                popperPlacement="bottom-start"
                                dateFormat="dd-MM-yyyy | HH:mm"
                                timeIntervals={5}
                                locale={el}
                                value={new Date(appData?.appointmentDate ?? "").toLocaleDateString()}
                                readOnly={!editMode}
                                onChange={(date) => UpdateApptData("appointmentDate", date as Date)}
                            />
                            
                        </div>
                        {/** appointment patient  */}
                        <div className={styles.apptInput}>
                            <label htmlFor="patient">Ασθενής</label>
                            <input 
                                type="text" 
                                name="patient"
                                title="Ασθενής"
                                value={appData?.appointmentPatient?.firstname}
                                readOnly={!editMode}
                                // onChange={}
                            />
                        </div>
                        {/** appointment reason */}
                        <div className={styles.apptInput}>
                            <label htmlFor="reason">Αιτιολογία</label>
                            <input 
                                type="text" 
                                name="reason"
                                title="Αιτιολογία"
                                value={appData?.appointmentReason}
                                readOnly={!editMode}
                                onChange={(e) => UpdateApptData("appointmentReason", e.target.value)}
                            />
                        </div>
                        {/** appointment doctor */}
                        <div className={styles.apptInput}>
                            <label htmlFor="doctor">Παρευρισκόμενος Ιατρός</label>
                            <input 
                                type="text" 
                                name="doctor"
                                title="Παρευρισκόμενος Ιατρός"
                                value={appData?.appointmentDoctor}
                                readOnly={!editMode}
                                onChange={(e) => UpdateApptData("appointmentDoctor", e.target.value)}
                            />
                        </div>
                        {/** appointment admin */}
                        <div className={styles.apptInput}>
                            <label htmlFor="admin">Προστέθηκε από</label>
                            <input 
                                type="text" 
                                name="admin"
                                title="Διαχειριστής"
                                value={appData?.doctorName}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className={styles.apptBtns}>
                        {RenderButtons()}
                    </div>
                </div>
            </div>
        </main>
    )
};

export default ApptPreview;