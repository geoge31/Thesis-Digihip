/**
 * Appointments Page
 * This component provides the appointments page for Digihip application.
 * Displays: 
    * monthly-view of all appointments
    * weekly-view of all appointments
    * daily-view of all appointments
 * @path @/src/app/digihip/appointments  
 * @file page.tsx
 * @gioge31
 */

"use client";

import React, {useState} from "react";
import { useAppointmentProvider } from "@/api/_context/Appointments/Context";
import { usePatientProvider } from "@/api/_context/Patients/Context";
import styles from "@/digihip/appointments/css/Appts.module.css";
import AddButton from "@/components/Buttons/Register/addButton";
import SelectView from "@/components/Appointments/SelectView/selectView";
import MonthlyView from "@/digihip/appointments/modules/MonthlyView/MonthlyView";
import WeeklyView from "@/digihip/appointments/modules/WeeklyView/WeeklyView"; 
import DailyView from "@/digihip/appointments/modules/DailyView/DailyView";
import NewAppointmentModal from "@/components/Appointments/NewApptModal/NewAppointmentModal"
import "react-datepicker/dist/react-datepicker.css";


/**
 * 
 * @returns 
 */
const AppointmentsPage  = () => {

    const { appointmentsList } = useAppointmentProvider();
    const { patientsList } = usePatientProvider();


    const [activeView, setActiveView] = useState<number>(0);
    const [apptmodal, setShowNewApptModal] = useState<boolean>(false);

    const ShowNewAppointment = () => {
        setShowNewApptModal(true);
    };

    const HandleChangeView = (view: number) => {
        setActiveView(view);
    };

    if(!appointmentsList) {
        return<>Loading</>;
    }
    
    return(
        <main className={styles.main}>
            <div className={styles.header}>
                {/*  */}
                <div className={styles.selectView}>
                    <SelectView selectionChange={HandleChangeView} />
                </div>
                <div className={styles.addAppointment }>
                    <AddButton
                        onRegister={ShowNewAppointment}
                        value="Προσθήκη Ραντεβού"
                    >
                        Προσθήκη Ραντεβού
                    </AddButton>
                </div>
            </div>
            <div className={styles.body}>
                
                {apptmodal && (
                    <NewAppointmentModal
                        onClose={() => setShowNewApptModal(false)}
                        patients={patientsList}
                    />
                )}

                {activeView === 0 && (
                    <div>
                    </div>
                )}
                {activeView === 1 && (
                    <div>
                        <MonthlyView appointments={appointmentsList} patients={patientsList}/>
                    </div>
                )}
                {activeView === 2 && (
                    <div>
                        <WeeklyView appointments={appointmentsList} patients={patientsList}/>
                    </div>
                )}
                {activeView === 3 && (
                    <div>
                        <DailyView appointments={appointmentsList} patients={patientsList}/>
                    </div>
                )}
            </div>
        </main>
    );
}; 



export default AppointmentsPage;
